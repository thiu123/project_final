import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import {
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnInvalidAmount,
  IpnOrderNotFound,
  IpnResponse,
  IpnSuccess,
  IpnUnknownError,
} from 'vnpay';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import {
  EBOOK_PRICE_RATIO,
  EXCHANGE_RATE_USD_TO_VND,
  OrderStatus,
  PaymentMethod,
  StatusActor,
} from '../../constants/app.constants';
import { BooksService } from '../books/books.service';
import { BookDocument } from '../books/schemas/book.schema';
import { Cart, CartDocument, CartItem } from '../carts/schemas/cart.schema';
import { EbooksService } from '../ebooks/ebooks.service';
import { InventoryService } from '../inventory/inventory.service';
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
import { PaymentResult } from './payments/payment.types';
import { VnpayService } from './payments/vnpay.service';
import {
  Order,
  OrderDocument,
  OrderStatusEvent,
  ShippingAddress,
} from './schemas/order.schema';

type PopulatedCartItem = Omit<CartItem, 'bookId'> & { bookId: BookDocument };

type Gateway = Exclude<PaymentMethod, 'COD'>;

type SettleOutcome =
  'settled' | 'not_found' | 'already_settled' | 'amount_mismatch';

const IPN_RESPONSES: Record<SettleOutcome, IpnResponse> = {
  settled: IpnSuccess,
  not_found: IpnOrderNotFound,
  already_settled: InpOrderAlreadyConfirmed,
  amount_mismatch: IpnInvalidAmount,
};

const HISTORY_ACTOR_FIELDS = 'username email avatar_url';

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
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    private readonly booksService: BooksService,
    private readonly inventoryService: InventoryService,
    private readonly ebooksService: EbooksService,
    private readonly vouchersService: VouchersService,
    private readonly vnpayService: VnpayService,
    private readonly momoService: MomoService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  getUserOrders(userId: string) {
    return this.orderModel
      .find({ userId })
      .populate('items.bookId')
      .populate('statusHistory.actorId', HISTORY_ACTOR_FIELDS)
      .sort({ createdAt: -1 });
  }

  getAllOrders() {
    return this.orderModel
      .find()
      .populate('items.bookId')
      .populate('userId', 'username email')
      .populate('statusHistory.actorId', HISTORY_ACTOR_FIELDS)
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
  async getOrderById(orderId: string, user: JwtPayload) {
    const order = await this.orderModel
      .findOne({ orderId })
      .populate('items.bookId')
      .populate('statusHistory.actorId', HISTORY_ACTOR_FIELDS);

    if (!order || (!user.admin && order.userId.toString() !== user.id)) {
      throw new NotFoundException({ msg: 'Order not found' });
    }
    return order;
  }

  async checkEbookPurchase(userId: string, bookId?: string) {
    if (!bookId) {
      throw new BadRequestException({ msg: 'Book ID is required' });
    }

    return {
      isPurchased: await this.ebooksService.hasPurchased(userId, bookId),
    };
  }

  async updateOrderStatus(id: string, status: OrderStatus, adminId?: string) {
    const order = await this.findOrderOrFail(id);
    const allowed = allowedTransitions(order.paymentMethod, order.status);

    if (!allowed.includes(status)) {
      throw new BadRequestException({
        msg: this.transitionRejection(order, status, allowed),
      });
    }

    if (status === 'Cancelled') {
      await this.cancelAndRestock(order, 'admin', adminId);
    } else {
      let note: string | undefined;

      if (status === 'Confirmed') {
        order.confirmedByAdmin = true;
        order.confirmedAt = new Date();
      } else if (status === 'Paid') {
        note = 'Cash collected on delivery';
      }

      this.recordStatus(order, status, 'admin', { actorId: adminId, note });
      await order.save();
    }
    this.logger.log(`Order ${order.orderId} moved to ${status}`);

    return this.orderModel
      .findById(id)
      .populate('items.bookId')
      .populate('userId', 'username email')
      .populate('statusHistory.actorId', HISTORY_ACTOR_FIELDS);
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

    await this.cancelAndRestock(order, 'customer', userId);

    return this.orderModel
      .findById(id)
      .populate('items.bookId')
      .populate('statusHistory.actorId', HISTORY_ACTOR_FIELDS);
  }

  async checkoutWithVnpay(userId: string, voucherCode?: string) {
    const order = await this.createOrderFromCart(userId, voucherCode, 'Vnpay');
    const paymentUrl = await this.vnpayService.buildPaymentUrl({
      orderId: order.orderId,
      amount: order.total,
    });
    return { paymentUrl };
  }

  async checkoutWithMomo(userId: string, voucherCode?: string) {
    const order = await this.createOrderFromCart(userId, voucherCode, 'Momo');
    const paymentUrl = await this.momoService.buildPaymentUrl({
      orderId: order.orderId,
      amount: order.total,
    });
    return { paymentUrl };
  }

  // Cash on delivery: no gateway, no redirect. The order is placed right away
  // and stays Pending until the courier collects the money.
  async checkoutWithCod(userId: string, dto: CodCheckoutDto) {
    await this.rejectEbooksForCod(userId);

    const order = await this.connection.transaction(async (session) => {
      const created = await this.createOrderFromCart(
        userId,
        dto.voucherCode,
        'COD',
        { shipping: dto.shipping, inventoryCommitted: true, session },
      );
      await this.inventoryService.commitSale(created.items, {
        orderCode: created.orderId,
        actorId: userId,
        session,
      });
      return created;
    });

    await this.afterStockCommitted(order);
    await this.notifyNewOrder(order.orderId);

    return {
      orderId: order.orderId,
      totalAmount: order.total,
      paymentMethod: 'COD' as const,
      status: 'Pending' as const,
    };
  }

  async handleVnpayReturn(query: VnpayReturnQuery): Promise<string> {
    const result = this.vnpayService.verify(query);
    if (!result) {
      this.logger.warn(
        `VNPay return rejected: bad signature (${query.vnp_TxnRef})`,
      );
      return this.statusPageUrl(query.vnp_TxnRef);
    }

    try {
      await this.settlePayment(result, 'Vnpay');
    } catch (error) {
      this.logger.error(`VNPay return error: ${(error as Error).message}`);
    }
    return this.statusPageUrl(result.orderId);
  }

  async handleVnpayIpn(query: VnpayReturnQuery): Promise<IpnResponse> {
    const result = this.vnpayService.verify(query);
    if (!result) return IpnFailChecksum;

    try {
      return IPN_RESPONSES[await this.settlePayment(result, 'Vnpay')];
    } catch (error) {
      this.logger.error(`VNPay IPN error: ${(error as Error).message}`);
      return IpnUnknownError;
    }
  }

  async handleMomoReturn(query: MomoReturnQuery): Promise<string> {
    const result = this.momoService.verify(query);
    if (!result) {
      this.logger.warn(
        `MoMo return rejected: bad signature (${String(query.orderId)})`,
      );
      return this.statusPageUrl(
        typeof query.orderId === 'string' ? query.orderId : undefined,
      );
    }

    try {
      await this.settlePayment(result, 'Momo');
    } catch (error) {
      this.logger.error(`MoMo return error: ${(error as Error).message}`);
    }
    return this.statusPageUrl(result.orderId);
  }

  async handleMomoIpn(body: MomoReturnQuery): Promise<void> {
    const result = this.momoService.verify(body);
    if (!result) {
      this.logger.warn(
        `MoMo IPN rejected: bad signature (${String(body.orderId)})`,
      );
      return;
    }
    await this.settlePayment(result, 'Momo');
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
    options: {
      shipping?: ShippingAddress;
      inventoryCommitted?: boolean;
      session?: ClientSession;
    } = {},
  ): Promise<OrderDocument> {
    const cart = await this.cartModel
      .findOne({ userId })
      .session(options.session ?? null)
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
    const orderId = `ORD${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    return new this.orderModel({
      userId,
      orderId,
      items: cart.items.map((item) => ({
        bookId: item.bookId._id,
        quantity: item.quantity,
        productType: item.productType,
      })),
      total: totalAmount,
      paymentMethod,
      shipping: options.shipping,
      inventoryCommitted: options.inventoryCommitted ?? false,
      statusHistory: [
        {
          status: 'Pending',
          actor: 'customer',
          actorId: userId,
          note: `Order placed via ${paymentMethod}`,
        },
      ],
      voucher: voucherCode
        ? {
            code: voucherCode.toUpperCase(),
            discountAmount: Math.round(
              discountAmount * EXCHANGE_RATE_USD_TO_VND,
            ),
          }
        : undefined,
    }).save({ session: options.session });
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
    { orderId, success, amount }: PaymentResult,
    gateway: Gateway,
  ): Promise<SettleOutcome> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order || order.paymentMethod !== gateway) {
      this.logger.error(`${gateway} callback for unknown order: ${orderId}`);
      return 'not_found';
    }

    if (amount !== order.total) {
      this.logger.error(
        `${gateway} amount mismatch on ${orderId}: got ${amount}, expected ${order.total}`,
      );
      return 'amount_mismatch';
    }

    if (order.status !== 'Pending') {
      return this.alreadySettled(order, success, gateway);
    }

    const status: OrderStatus = success ? 'Paid' : 'Failed';
    const takesStock = success && !order.inventoryCommitted;
    const event = this.statusEvent(status, 'gateway', {
      note: success
        ? `${order.paymentMethod} confirmed the payment`
        : `${order.paymentMethod} rejected the payment`,
    });

    const settled = await this.connection.transaction(async (session) => {
      const claimed = await this.orderModel.updateOne(
        { _id: order._id, status: 'Pending' },
        {
          $set: {
            status,
            inventoryCommitted: order.inventoryCommitted || takesStock,
          },
          $push: { statusHistory: event },
        },
        { session },
      );
      if (claimed.matchedCount === 0) return false;

      if (takesStock) {
        await this.inventoryService.commitSale(order.items, {
          orderCode: order.orderId,
          actorId: order.userId,
          allowOversell: true,
          session,
        });
      }
      return true;
    });

    if (!settled) {
      const current = await this.orderModel.findById(order._id);
      return this.alreadySettled(current ?? order, success, gateway);
    }
    this.logger.log(`Order ${orderId} updated to status: ${status}`);

    if (takesStock) {
      await this.afterStockCommitted(order);
      await this.notifyNewOrder(order.orderId);
    }
    return 'settled';
  }

  private alreadySettled(
    order: OrderDocument,
    success: boolean,
    gateway: Gateway,
  ): SettleOutcome {
    if (success && order.status === 'Cancelled') {
      this.logger.error(
        `${gateway} reports payment for cancelled order ${order.orderId}: refund it manually`,
      );
    }
    return 'already_settled';
  }

  private async afterStockCommitted(order: OrderDocument): Promise<void> {
    if (order.voucher?.code) {
      await this.vouchersService.adjustUsage(order.voucher.code, 1);
    }
    await this.booksService.invalidateBooks(this.bookIds(order));
    await this.cartModel.findOneAndDelete({ userId: order.userId });
  }

  private async cancelAndRestock(
    order: OrderDocument,
    actor: StatusActor,
    actorId?: string,
  ): Promise<void> {
    const restock = order.inventoryCommitted ?? order.status === 'Paid';
    const event = this.statusEvent('Cancelled', actor, {
      actorId,
      note: restock ? 'Reserved stock returned' : undefined,
    });

    const cancelled = await this.connection.transaction(async (session) => {
      const claimed = await this.orderModel.updateOne(
        { _id: order._id, status: order.status },
        {
          $set: { status: 'Cancelled', inventoryCommitted: false },
          $push: { statusHistory: event },
        },
        { session },
      );
      if (claimed.matchedCount === 0) return false;

      if (restock) {
        await this.inventoryService.revertSale(order.items, {
          orderCode: order.orderId,
          actorId,
          session,
        });
      }
      return true;
    });

    if (!cancelled) {
      throw new ConflictException({
        msg: 'This order was just updated by someone else. Refresh and try again.',
      });
    }

    if (restock) {
      if (order.voucher?.code) {
        await this.vouchersService.adjustUsage(order.voucher.code, -1);
      }
      await this.booksService.invalidateBooks(this.bookIds(order));
    }
  }

  private bookIds(order: OrderDocument): string[] {
    return order.items.map((item) => String(item.bookId));
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

  private recordStatus(
    order: OrderDocument,
    status: OrderStatus,
    actor: StatusActor,
    options: { actorId?: string; note?: string } = {},
  ): void {
    if (order.status !== status || order.statusHistory.length === 0) {
      order.statusHistory.push(this.statusEvent(status, actor, options));
    }

    order.status = status;
  }

  private statusEvent(
    status: OrderStatus,
    actor: StatusActor,
    options: { actorId?: string; note?: string } = {},
  ): OrderStatusEvent {
    return {
      status,
      actor,
      actorId: options.actorId ? new Types.ObjectId(options.actorId) : null,
      note: options.note,
      at: new Date(),
    };
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
