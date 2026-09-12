import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EBOOK_PRICE_RATIO,
  EXCHANGE_RATE_USD_TO_VND,
  ORDER_STATUSES,
  OrderStatus,
  PAID_ORDER_STATUSES,
  PaymentMethod,
} from '../../constants/app.constants';
import { BooksService } from '../books/books.service';
import { Book, BookDocument } from '../books/schemas/book.schema';
import { Cart, CartDocument, CartItem } from '../carts/schemas/cart.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import {
  VoucherRejectReason,
  VouchersService,
} from '../vouchers/vouchers.service';
import {
  CodCheckoutDto,
  MomoReturnQuery,
  VnpayReturnQuery,
} from './dto/order.dto';
import { allowedTransitions, REVENUE_MATCH } from './order-transitions';
import { MomoService } from './payments/momo.service';
import { VnpayService } from './payments/vnpay.service';
import { Order, OrderDocument, ShippingAddress } from './schemas/order.schema';

type PopulatedCartItem = Omit<CartItem, 'bookId'> & { bookId: BookDocument };

const CHECKOUT_VOUCHER_MESSAGES: Record<
  Exclude<VoucherRejectReason, 'MIN_AMOUNT'>,
  string
> = {
  INVALID: 'Invalid voucher code',
  EXPIRED: 'Voucher has expired',
  USAGE_LIMIT: 'Voucher usage limit reached',
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    private readonly booksService: BooksService,
    private readonly vouchersService: VouchersService,
    private readonly vnpayService: VnpayService,
    private readonly momoService: MomoService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // ---------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------

  async getUserOrders(userId: string) {
    return this.orderModel
      .find({ userId })
      .populate('items.bookId')
      .sort({ createdAt: -1 });
  }

  /** Admin: every order. */
  async getAllOrders() {
    return this.orderModel
      .find()
      .populate('items.bookId')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
  }

  /** Admin: revenue + per-status stats + latest 10 orders. */
  async getDashboardStats() {
    // A COD order only counts once the cash is actually back, which is why this
    // is not simply "status is one of the paid ones" — see REVENUE_MATCH.
    const paidFilter = REVENUE_MATCH;

    const revenueResult = await this.orderModel.aggregate<{ total: number }>([
      { $match: paidFilter },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const orderStats = await this.orderModel.aggregate([
      { $match: paidFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
        },
      },
    ]);

    const recentOrders = await this.orderModel
      .find()
      .populate('items.bookId', 'title')
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    return { totalRevenue, orderStats, recentOrders };
  }

  /** Looks an order up by its public `orderId` (not the Mongo _id). */
  async getOrderById(orderId: string) {
    const order = await this.orderModel
      .findOne({ orderId })
      .populate('items.bookId');
    if (!order) {
      throw new HttpException({ msg: 'Order not found' }, HttpStatus.NOT_FOUND);
    }
    return order;
  }

  /** Ebooks are readable as soon as an order containing them is paid. */
  async checkEbookPurchase(userId: string, bookId?: string) {
    if (!bookId) {
      throw new HttpException(
        { msg: 'Book ID is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const order = await this.orderModel.findOne({
      userId,
      status: { $in: PAID_ORDER_STATUSES },
      'items.bookId': bookId,
      'items.productType': 'ebook',
    });

    return { isPurchased: !!order };
  }

  // ---------------------------------------------------------------------
  // Admin mutations
  // ---------------------------------------------------------------------

  /**
   * Moves an order along its lifecycle on an admin's instruction.
   *
   * This used to be a bare `findByIdAndUpdate`, which let any status be written
   * over any other. That was wrong in three ways at once: a prepaid order could
   * be marked `Paid` without a payment, `Confirmed` never recorded who
   * confirmed it, and `Cancelled` walked away with the stock still deducted.
   * Every route into a new status now goes through the transition table and
   * carries the side effects that status implies.
   */
  async updateOrderStatus(id: string, status: OrderStatus) {
    if (!ORDER_STATUSES.includes(status)) {
      throw new HttpException(
        { msg: 'Invalid status' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const order = await this.findOrderOrFail(id);
    const allowed = allowedTransitions(order.paymentMethod, order.status);
    if (!allowed.includes(status)) {
      throw new HttpException(
        { msg: this.transitionRejection(order, status, allowed) },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (status === 'Cancelled') {
      await this.releaseInventory(order);
    } else if (status === 'Confirmed') {
      order.confirmedByAdmin = true;
      order.confirmedAt = new Date();
    }

    order.status = status;
    await order.save();
    this.logger.log(`Order ${order.orderId} moved to ${status}`);

    return this.populatedOrder(id);
  }

  /** Explains a refused transition in terms of what the admin can actually do. */
  private transitionRejection(
    order: OrderDocument,
    target: OrderStatus,
    allowed: OrderStatus[],
  ): string {
    // Repeating a status is a refusal, not a quiet no-op: an admin clicking
    // Confirm twice should be told the first one already landed.
    if (target === order.status) {
      return `Order is already ${order.status}.`;
    }
    if (target === 'Paid' && order.paymentMethod !== 'COD') {
      return `A ${order.paymentMethod} order is marked Paid by the payment gateway when the money clears, not by hand. Only cash-on-delivery orders are settled manually.`;
    }
    if (allowed.length === 0) {
      return `Order is already ${order.status}, which is final.`;
    }
    return `Cannot move a ${order.paymentMethod} order from ${order.status} to ${target}. Allowed next: ${allowed.join(', ')}.`;
  }

  /** Kept as its own endpoint; the rules live in one place regardless. */
  async confirmOrder(id: string) {
    return this.updateOrderStatus(id, 'Confirmed');
  }

  // ---------------------------------------------------------------------
  // User mutations
  // ---------------------------------------------------------------------

  async cancelOrder(userId: string, id: string) {
    const order = await this.findOrderOrFail(id);

    if (order.userId.toString() !== userId) {
      throw new HttpException({ msg: 'Unauthorized' }, HttpStatus.FORBIDDEN);
    }

    const hasEbook = order.items.some((item) => item.productType === 'ebook');
    if (hasEbook && order.status === 'Paid') {
      throw new HttpException(
        { msg: 'Cannot cancel order containing ebooks after payment' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Only Pending or Paid orders (before admin confirmation) can be cancelled
    if (!['Pending', 'Paid'].includes(order.status)) {
      throw new HttpException(
        {
          msg: 'Cannot cancel order. Only Pending or Paid orders can be cancelled.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.releaseInventory(order);

    order.status = 'Cancelled';
    await order.save();

    return this.orderModel.findById(id).populate('items.bookId');
  }

  /**
   * Gives back whatever a cancelled order took, once.
   *
   * COD commits stock while still `Pending`, so the old "restore only when
   * Paid" rule would have leaked it. Orders written before the flag existed
   * fall back to that rule.
   */
  private async releaseInventory(order: OrderDocument): Promise<void> {
    const committed = order.inventoryCommitted ?? order.status === 'Paid';
    if (!committed) return;

    await this.restoreInventory(order);
    order.inventoryCommitted = false;
  }

  // ---------------------------------------------------------------------
  // Checkout
  // ---------------------------------------------------------------------

  async checkoutWithVnpay(userId: string, voucherCode?: string) {
    const { orderId, totalAmount } = await this.createOrderFromCart(
      userId,
      voucherCode,
      'Vnpay',
    );
    const paymentUrl = await this.vnpayService.buildPaymentUrl({
      orderId,
      amount: totalAmount,
    });
    return { paymentUrl };
  }

  async checkoutWithMomo(userId: string, voucherCode?: string) {
    const { orderId, totalAmount } = await this.createOrderFromCart(
      userId,
      voucherCode,
      'Momo',
    );
    const paymentUrl = await this.momoService.buildPaymentUrl({
      orderId,
      amount: totalAmount,
    });
    return { paymentUrl };
  }

  /**
   * Cash on delivery. There is no gateway and no redirect: the order is placed
   * immediately and stays `Pending` until the courier collects the money, so
   * the client goes straight to the status page.
   */
  async checkoutWithCod(userId: string, dto: CodCheckoutDto) {
    await this.rejectEbooksForCod(userId);

    const { orderId, totalAmount } = await this.createOrderFromCart(
      userId,
      dto.voucherCode,
      'COD',
      dto.shipping,
    );

    const order = await this.orderModel.findOne({ orderId });
    if (order) await this.commitInventory(order);
    await this.notifyNewOrder(orderId);

    return {
      orderId,
      totalAmount,
      paymentMethod: 'COD' as const,
      status: 'Pending' as const,
    };
  }

  /**
   * Ebooks cannot ship, so there is nothing for a courier to collect against —
   * and access is granted only once an order reaches a paid status, which a COD
   * order does not until it is delivered. Blocking here beats selling someone a
   * download they cannot open.
   */
  private async rejectEbooksForCod(userId: string): Promise<void> {
    const cart = await this.cartModel.findOne({ userId });
    if (cart?.items.some((item) => item.productType === 'ebook')) {
      throw new HttpException(
        {
          msg: 'Cash on delivery is not available for ebooks. Please pay with VNPay or MoMo, or remove the ebooks from your cart.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Turns the user's cart into a Pending order priced in VND.
   * Voucher usage is NOT consumed here; that happens when payment succeeds.
   */
  private async createOrderFromCart(
    userId: string,
    voucherCode: string | undefined,
    paymentMethod: PaymentMethod,
    shipping?: ShippingAddress,
  ): Promise<{ orderId: string; totalAmount: number }> {
    const cart = await this.cartModel
      .findOne({ userId })
      .populate<{ items: PopulatedCartItem[] }>('items.bookId');

    if (!cart || cart.items.length === 0) {
      throw new HttpException({ msg: 'Cart is empty' }, HttpStatus.BAD_REQUEST);
    }

    // Hardbooks need stock; ebooks don't
    for (const item of cart.items) {
      if (
        item.productType === 'hardbook' &&
        item.bookId.stock < item.quantity
      ) {
        throw new HttpException(
          {
            msg: `Insufficient stock for "${item.bookId.title}". Available: ${item.bookId.stock}, Requested: ${item.quantity}`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Subtotal in USD (ebooks are 30% off the hardbook price)
    const subtotal = cart.items.reduce((sum, item) => {
      const price =
        item.productType === 'ebook'
          ? item.bookId.price * EBOOK_PRICE_RATIO
          : item.bookId.price;
      return sum + price * item.quantity;
    }, 0);

    let discountAmount = 0;
    if (voucherCode) {
      const result = await this.vouchersService.checkVoucher(
        voucherCode,
        subtotal,
      );
      if (!result.ok) {
        const message =
          result.reason === 'MIN_AMOUNT'
            ? `Minimum order amount is $${result.voucher?.minOrderAmount ?? 0}`
            : CHECKOUT_VOUCHER_MESSAGES[result.reason];
        throw new HttpException({ msg: message }, HttpStatus.BAD_REQUEST);
      }
      discountAmount = result.discountAmount;
    }

    const totalAmount = Math.round(
      (subtotal - discountAmount) * EXCHANGE_RATE_USD_TO_VND,
    );
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    await new this.orderModel({
      userId,
      orderId,
      items: cart.items.map((item) => ({
        bookId: item.bookId._id,
        quantity: item.quantity,
        productType: item.productType,
      })),
      total: totalAmount,
      paymentMethod,
      shipping,
      voucher: voucherCode
        ? {
            code: voucherCode.toUpperCase(),
            discountAmount: Math.round(
              discountAmount * EXCHANGE_RATE_USD_TO_VND,
            ),
          }
        : undefined,
    }).save();

    return { orderId, totalAmount };
  }

  // ---------------------------------------------------------------------
  // Payment gateway callbacks: return the frontend URL to redirect to
  // ---------------------------------------------------------------------

  async handleVnpayReturn(query: VnpayReturnQuery): Promise<string> {
    const { vnp_ResponseCode, vnp_TxnRef } = query;
    try {
      await this.settlePayment(vnp_TxnRef, vnp_ResponseCode === '00');
      return this.statusPageUrl(vnp_TxnRef);
    } catch (err) {
      this.logger.error(`Payment processing error: ${(err as Error).message}`);
      return this.statusPageUrl('unknown');
    }
  }

  async handleMomoReturn(query: MomoReturnQuery): Promise<string> {
    const { resultCode, orderId } = query;
    try {
      // MoMo may send resultCode as the string "0" or the number 0
      await this.settlePayment(orderId, Number(resultCode) === 0);
      return this.statusPageUrl(orderId);
    } catch (err) {
      this.logger.error(
        `MoMo payment processing error: ${(err as Error).message}`,
      );
      return this.statusPageUrl('unknown');
    }
  }

  /** Marks the order Paid/Failed and, on success, consumes stock, voucher usage and the cart. */
  private async settlePayment(
    orderId: string | undefined,
    success: boolean,
  ): Promise<void> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) {
      this.logger.error(`Order not found: ${orderId}`);
      return;
    }
    const alreadyNotified = order.inventoryCommitted;

    order.status = success ? 'Paid' : 'Failed';
    await order.save();
    this.logger.log(`Order ${orderId} updated to status: ${order.status}`);

    if (!success) return;
    await this.commitInventory(order);
    if (!alreadyNotified) await this.notifyNewOrder(order.orderId);
  }

  private async notifyNewOrder(orderId: string): Promise<void> {
    const order = await this.orderModel
      .findOne({ orderId })
      .populate<{ userId: { username?: string; email?: string } | null }>(
        'userId',
        'username email',
      );

    if (!order) return;

    this.notificationsGateway.notifyNewOrder({
      orderId: order.orderId,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      customer:
        order.shipping?.fullName ||
        order.userId?.username ||
        order.userId?.email ||
        'Customer',
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Takes the stock, the voucher usage and the cart for an order.
   *
   * Shared by the gateway callbacks and by COD, which reaches this point at
   * `Pending` rather than `Paid`: the goods are committed to the buyer as soon
   * as the order is placed, and the money only arrives on delivery.
   */
  private async commitInventory(order: OrderDocument): Promise<void> {
    if (order.inventoryCommitted) return;

    for (const item of order.items) {
      const book = await this.bookModel.findById(item.bookId);
      if (!book) continue;

      if (item.productType === 'hardbook' && book.stock >= item.quantity) {
        book.stock -= item.quantity;
      }
      book.sold += item.quantity;
      await book.save();
    }

    if (order.voucher?.code) {
      await this.vouchersService.adjustUsage(order.voucher.code, 1);
    }

    order.inventoryCommitted = true;
    await order.save();

    await this.booksService.invalidateBooks(
      order.items.map((item) => String(item.bookId)),
    );

    await this.cartModel.findOneAndDelete({ userId: order.userId });
    this.logger.log(`Cart cleared for user ${order.userId}`);
  }

  /** Reverses `settlePayment` for a cancelled paid order. */
  private async restoreInventory(order: OrderDocument): Promise<void> {
    for (const item of order.items) {
      const book = await this.bookModel.findById(item.bookId);
      if (!book) continue;

      if (item.productType === 'hardbook') {
        book.stock += item.quantity;
      }
      book.sold = Math.max(0, book.sold - item.quantity);
      await book.save();
    }

    if (order.voucher?.code) {
      await this.vouchersService.adjustUsage(order.voucher.code, -1);
    }

    await this.booksService.invalidateBooks(
      order.items.map((item) => String(item.bookId)),
    );
  }

  private statusPageUrl(orderId: string | undefined): string {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    return `${frontendUrl}/order/status/${orderId ?? 'unknown'}`;
  }

  /** The shape the admin table expects back after a mutation. */
  private populatedOrder(id: string) {
    return this.orderModel
      .findById(id)
      .populate('items.bookId')
      .populate('userId', 'username email');
  }

  private async findOrderOrFail(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new HttpException({ msg: 'Order not found' }, HttpStatus.NOT_FOUND);
    }
    return order;
  }
}
