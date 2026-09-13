import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EBOOK_PRICE_RATIO,
  EXCHANGE_RATE_USD_TO_VND,
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
import { REVENUE_MATCH, allowedTransitions } from './order-transitions';
import { MomoService } from './payments/momo.service';
import { VnpayService } from './payments/vnpay.service';
import { Order, OrderDocument, ShippingAddress } from './schemas/order.schema';

type PopulatedCartItem = Omit<CartItem, 'bookId'> & { bookId: BookDocument };

const VOUCHER_MESSAGES: Record<
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

  getUserOrders(userId: string) {
    return this.orderModel
      .find({ userId })
      .populate('items.bookId')
      .sort({ createdAt: -1 });
  }

  getAllOrders() {
    return this.orderModel
      .find()
      .populate('items.bookId')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
  }

  async getDashboardStats() {
    const [revenue] = await this.orderModel.aggregate<{ total: number }>([
      { $match: REVENUE_MATCH },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const orderStats = await this.orderModel.aggregate([
      { $match: REVENUE_MATCH },
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

    return { totalRevenue: revenue?.total ?? 0, orderStats, recentOrders };
  }

  // Looks up by the public `orderId`, not the Mongo _id.
  async getOrderById(orderId: string) {
    const order = await this.orderModel
      .findOne({ orderId })
      .populate('items.bookId');

    if (!order) {
      throw new NotFoundException({ msg: 'Order not found' });
    }
    return order;
  }

  async checkEbookPurchase(userId: string, bookId?: string) {
    if (!bookId) {
      throw new BadRequestException({ msg: 'Book ID is required' });
    }

    const order = await this.orderModel.findOne({
      userId,
      status: { $in: PAID_ORDER_STATUSES },
      'items.bookId': bookId,
      'items.productType': 'ebook',
    });

    return { isPurchased: !!order };
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.findOrderOrFail(id);
    const allowed = allowedTransitions(order.paymentMethod, order.status);

    if (!allowed.includes(status)) {
      throw new BadRequestException({
        msg: this.transitionRejection(order, status, allowed),
      });
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

    return this.orderModel
      .findById(id)
      .populate('items.bookId')
      .populate('userId', 'username email');
  }

  confirmOrder(id: string) {
    return this.updateOrderStatus(id, 'Confirmed');
  }

  async cancelOrder(userId: string, id: string) {
    const order = await this.findOrderOrFail(id);

    if (order.userId.toString() !== userId) {
      throw new ForbiddenException({ msg: 'Unauthorized' });
    }

    const hasEbook = order.items.some((item) => item.productType === 'ebook');
    if (hasEbook && order.status === 'Paid') {
      throw new BadRequestException({
        msg: 'Cannot cancel order containing ebooks after payment',
      });
    }

    if (!['Pending', 'Paid'].includes(order.status)) {
      throw new BadRequestException({
        msg: 'Cannot cancel order. Only Pending or Paid orders can be cancelled.',
      });
    }

    await this.releaseInventory(order);
    order.status = 'Cancelled';
    await order.save();

    return this.orderModel.findById(id).populate('items.bookId');
  }

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

  // Cash on delivery: no gateway, no redirect. The order is placed right away
  // and stays Pending until the courier collects the money.
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

  async handleVnpayReturn(query: VnpayReturnQuery): Promise<string> {
    try {
      await this.settlePayment(
        query.vnp_TxnRef,
        query.vnp_ResponseCode === '00',
      );
      return this.statusPageUrl(query.vnp_TxnRef);
    } catch (error) {
      this.logger.error(`VNPay return error: ${(error as Error).message}`);
      return this.statusPageUrl(undefined);
    }
  }

  async handleMomoReturn(query: MomoReturnQuery): Promise<string> {
    try {
      // MoMo sends resultCode as the string "0" or the number 0.
      await this.settlePayment(query.orderId, Number(query.resultCode) === 0);
      return this.statusPageUrl(query.orderId);
    } catch (error) {
      this.logger.error(`MoMo return error: ${(error as Error).message}`);
      return this.statusPageUrl(undefined);
    }
  }

  // Ebooks cannot ship and access is only granted once an order is paid,
  // which a COD order is not until it is delivered.
  private async rejectEbooksForCod(userId: string): Promise<void> {
    const cart = await this.cartModel.findOne({ userId });
    if (cart?.items.some((item) => item.productType === 'ebook')) {
      throw new BadRequestException({
        msg: 'Cash on delivery is not available for ebooks. Please pay with VNPay or MoMo, or remove the ebooks from your cart.',
      });
    }
  }

  // Turns the cart into a Pending order priced in VND. Voucher usage is only
  // counted once the payment succeeds.
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
      throw new BadRequestException({ msg: 'Cart is empty' });
    }

    for (const item of cart.items) {
      if (
        item.productType === 'hardbook' &&
        item.bookId.stock < item.quantity
      ) {
        throw new BadRequestException({
          msg: `Insufficient stock for "${item.bookId.title}". Available: ${item.bookId.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Subtotal in USD; an ebook costs 70% of the printed price.
    const subtotal = cart.items.reduce((sum, item) => {
      const price =
        item.productType === 'ebook'
          ? item.bookId.price * EBOOK_PRICE_RATIO
          : item.bookId.price;
      return sum + price * item.quantity;
    }, 0);

    const discountAmount = await this.resolveDiscount(voucherCode, subtotal);
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

  private async resolveDiscount(
    voucherCode: string | undefined,
    subtotal: number,
  ): Promise<number> {
    if (!voucherCode) return 0;

    const result = await this.vouchersService.checkVoucher(
      voucherCode,
      subtotal,
    );
    if (result.ok) return result.discountAmount;

    const msg =
      result.reason === 'MIN_AMOUNT'
        ? `Minimum order amount is $${result.voucher?.minOrderAmount ?? 0}`
        : VOUCHER_MESSAGES[result.reason];
    throw new BadRequestException({ msg });
  }

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

  // Takes the stock, the voucher usage and the cart. COD reaches this while
  // still Pending: the goods are reserved when the order is placed.
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
  }

  // Gives back whatever a cancelled order took, once. Orders created before
  // `inventoryCommitted` existed fall back to "committed when Paid".
  private async releaseInventory(order: OrderDocument): Promise<void> {
    const committed = order.inventoryCommitted ?? order.status === 'Paid';
    if (!committed) return;

    for (const item of order.items) {
      const book = await this.bookModel.findById(item.bookId);
      if (!book) continue;

      if (item.productType === 'hardbook') book.stock += item.quantity;
      book.sold = Math.max(0, book.sold - item.quantity);
      await book.save();
    }

    if (order.voucher?.code) {
      await this.vouchersService.adjustUsage(order.voucher.code, -1);
    }

    await this.booksService.invalidateBooks(
      order.items.map((item) => String(item.bookId)),
    );
    order.inventoryCommitted = false;
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

  // Explains a refused transition in terms of what the admin can actually do.
  private transitionRejection(
    order: OrderDocument,
    target: OrderStatus,
    allowed: OrderStatus[],
  ): string {
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

  private statusPageUrl(orderId: string | undefined): string {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    return `${frontendUrl}/order/status/${orderId ?? 'unknown'}`;
  }

  private async findOrderOrFail(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException({ msg: 'Order not found' });
    }
    return order;
  }
}
