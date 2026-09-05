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
import { Book, BookDocument } from '../books/schemas/book.schema';
import { Cart, CartDocument, CartItem } from '../carts/schemas/cart.schema';
import { VoucherRejectReason, VouchersService } from '../vouchers/vouchers.service';
import { MomoReturnQuery, VnpayReturnQuery } from './dto/order.dto';
import { MomoService } from './payments/momo.service';
import { VnpayService } from './payments/vnpay.service';
import { Order, OrderDocument } from './schemas/order.schema';

type PopulatedCartItem = Omit<CartItem, 'bookId'> & { bookId: BookDocument };

const CHECKOUT_VOUCHER_MESSAGES: Record<Exclude<VoucherRejectReason, 'MIN_AMOUNT'>, string> = {
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
    private readonly vouchersService: VouchersService,
    private readonly vnpayService: VnpayService,
    private readonly momoService: MomoService,
  ) {}

  // ---------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------

  async getUserOrders(userId: string) {
    return this.orderModel.find({ userId }).populate('items.bookId').sort({ createdAt: -1 });
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
    const paidFilter = { status: { $in: PAID_ORDER_STATUSES } };

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
    const order = await this.orderModel.findOne({ orderId }).populate('items.bookId');
    if (!order) {
      throw new HttpException({ msg: 'Order not found' }, HttpStatus.NOT_FOUND);
    }
    return order;
  }

  /** Ebooks are readable as soon as an order containing them is paid. */
  async checkEbookPurchase(userId: string, bookId?: string) {
    if (!bookId) {
      throw new HttpException({ msg: 'Book ID is required' }, HttpStatus.BAD_REQUEST);
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

  async updateOrderStatus(id: string, status: OrderStatus) {
    if (!ORDER_STATUSES.includes(status)) {
      throw new HttpException({ msg: 'Invalid status' }, HttpStatus.BAD_REQUEST);
    }

    const order = await this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('items.bookId');
    if (!order) {
      throw new HttpException({ msg: 'Order not found' }, HttpStatus.NOT_FOUND);
    }
    return order;
  }

  async confirmOrder(id: string) {
    const order = await this.findOrderOrFail(id);

    if (order.status !== 'Paid') {
      throw new HttpException({ msg: 'Can only confirm paid orders' }, HttpStatus.BAD_REQUEST);
    }
    if (order.confirmedByAdmin) {
      throw new HttpException({ msg: 'Order already confirmed' }, HttpStatus.BAD_REQUEST);
    }

    order.confirmedByAdmin = true;
    order.confirmedAt = new Date();
    order.status = 'Confirmed';
    await order.save();

    return this.orderModel
      .findById(id)
      .populate('items.bookId')
      .populate('userId', 'username email');
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
        { msg: 'Cannot cancel order. Only Pending or Paid orders can be cancelled.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // A paid order already consumed stock and voucher usage: give them back
    if (order.status === 'Paid') {
      await this.restoreInventory(order);
    }

    order.status = 'Cancelled';
    await order.save();

    return this.orderModel.findById(id).populate('items.bookId');
  }

  // ---------------------------------------------------------------------
  // Checkout
  // ---------------------------------------------------------------------

  async checkoutWithVnpay(userId: string, voucherCode?: string) {
    const { orderId, totalAmount } = await this.createOrderFromCart(userId, voucherCode, 'Vnpay');
    const paymentUrl = await this.vnpayService.buildPaymentUrl({ orderId, amount: totalAmount });
    return { paymentUrl };
  }

  async checkoutWithMomo(userId: string, voucherCode?: string) {
    const { orderId, totalAmount } = await this.createOrderFromCart(userId, voucherCode, 'Momo');
    const paymentUrl = await this.momoService.buildPaymentUrl({ orderId, amount: totalAmount });
    return { paymentUrl };
  }

  /**
   * Turns the user's cart into a Pending order priced in VND.
   * Voucher usage is NOT consumed here; that happens when payment succeeds.
   */
  private async createOrderFromCart(
    userId: string,
    voucherCode: string | undefined,
    paymentMethod: PaymentMethod,
  ): Promise<{ orderId: string; totalAmount: number }> {
    const cart = await this.cartModel
      .findOne({ userId })
      .populate<{ items: PopulatedCartItem[] }>('items.bookId');

    if (!cart || cart.items.length === 0) {
      throw new HttpException({ msg: 'Cart is empty' }, HttpStatus.BAD_REQUEST);
    }

    // Hardbooks need stock; ebooks don't
    for (const item of cart.items) {
      if (item.productType === 'hardbook' && item.bookId.stock < item.quantity) {
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
        item.productType === 'ebook' ? item.bookId.price * EBOOK_PRICE_RATIO : item.bookId.price;
      return sum + price * item.quantity;
    }, 0);

    let discountAmount = 0;
    if (voucherCode) {
      const result = await this.vouchersService.checkVoucher(voucherCode, subtotal);
      if (!result.ok) {
        const message =
          result.reason === 'MIN_AMOUNT'
            ? `Minimum order amount is $${result.voucher?.minOrderAmount ?? 0}`
            : CHECKOUT_VOUCHER_MESSAGES[result.reason];
        throw new HttpException({ msg: message }, HttpStatus.BAD_REQUEST);
      }
      discountAmount = result.discountAmount;
    }

    const totalAmount = Math.round((subtotal - discountAmount) * EXCHANGE_RATE_USD_TO_VND);
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
      voucher: voucherCode
        ? {
            code: voucherCode.toUpperCase(),
            discountAmount: Math.round(discountAmount * EXCHANGE_RATE_USD_TO_VND),
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
      this.logger.error(`MoMo payment processing error: ${(err as Error).message}`);
      return this.statusPageUrl('unknown');
    }
  }

  /** Marks the order Paid/Failed and, on success, consumes stock, voucher usage and the cart. */
  private async settlePayment(orderId: string | undefined, success: boolean): Promise<void> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) {
      this.logger.error(`Order not found: ${orderId}`);
      return;
    }

    order.status = success ? 'Paid' : 'Failed';
    await order.save();
    this.logger.log(`Order ${orderId} updated to status: ${order.status}`);

    if (!success) return;

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
  }

  private statusPageUrl(orderId: string | undefined): string {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    return `${frontendUrl}/order/status/${orderId ?? 'unknown'}`;
  }

  private async findOrderOrFail(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new HttpException({ msg: 'Order not found' }, HttpStatus.NOT_FOUND);
    }
    return order;
  }
}
