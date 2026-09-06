import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import {
  CheckoutDto,
  CodCheckoutDto,
  MomoReturnQuery,
  UpdateOrderStatusDto,
  VnpayReturnQuery,
} from './dto/order.dto';
import { OrdersService } from './orders.service';

/**
 * Validates the COD body only. The pipe is scoped to that one route because
 * the other DTOs on this controller carry no decorators, and `whitelist` would
 * strip their fields away.
 */
const shippingPipe = new ValidationPipe({ transform: true, whitelist: true });

@Controller('order')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  checkout(@CurrentUser() user: JwtPayload, @Body() dto: CheckoutDto) {
    return this.ordersService.checkoutWithVnpay(user.id, dto.voucherCode);
  }

  @Post('checkout_momo')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  checkoutMomo(@CurrentUser() user: JwtPayload, @Body() dto: CheckoutDto) {
    return this.ordersService.checkoutWithMomo(user.id, dto.voucherCode);
  }

  /**
   * Cash on delivery: places the order outright, no gateway redirect.
   * Delivery details are required — see `CodCheckoutDto`.
   */
  @Post('checkout_cod')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  checkoutCod(
    @CurrentUser() user: JwtPayload,
    @Body(shippingPipe) dto: CodCheckoutDto,
  ) {
    return this.ordersService.checkoutWithCod(user.id, dto);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  getUserOrders(@CurrentUser() user: JwtPayload) {
    return this.ordersService.getUserOrders(user.id);
  }

  @Get('admin/all')
  @UseGuards(AdminGuard)
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get('admin/dashboard/stats')
  @UseGuards(AdminGuard)
  getDashboardStats() {
    return this.ordersService.getDashboardStats();
  }

  @Put('admin/:id/status')
  @UseGuards(AdminGuard)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto.status);
  }

  @Put('admin/:id/confirm')
  @UseGuards(AdminGuard)
  confirmOrder(@Param('id') id: string) {
    return this.ordersService.confirmOrder(id);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelOrder(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.ordersService.cancelOrder(user.id, id);
  }

  @Get('check-ebook')
  @UseGuards(JwtAuthGuard)
  checkEbookPurchase(
    @CurrentUser() user: JwtPayload,
    @Query('bookId') bookId?: string,
  ) {
    return this.ordersService.checkEbookPurchase(user.id, bookId);
  }

  /** VNPay redirects the customer here after payment. */
  @Get('vnpay_return')
  async vnpayReturn(
    @Query() query: VnpayReturnQuery,
    @Res() res: Response,
  ): Promise<void> {
    res.redirect(await this.ordersService.handleVnpayReturn(query));
  }

  /** MoMo redirects the customer here after payment (also used as IPN URL). */
  @Get('momo_return')
  async momoReturn(
    @Query() query: MomoReturnQuery,
    @Res() res: Response,
  ): Promise<void> {
    res.redirect(await this.ordersService.handleMomoReturn(query));
  }

  /** Public lookup by `orderId` (used by the order status page). Keep last: catches `/:id`. */
  @Get(':id')
  getOrderById(@Param('id') orderId: string) {
    return this.ordersService.getOrderById(orderId);
  }
}
