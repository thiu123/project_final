import { Body, Controller, Delete, Get, HttpCode, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CartsService } from './carts.service';
import { AddToCartDto, RemoveCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  getCart(@CurrentUser() user: JwtPayload) {
    return this.cartsService.getCart(user.id);
  }

  @Post('add')
  @HttpCode(200)
  addToCart(@CurrentUser() user: JwtPayload, @Body() dto: AddToCartDto) {
    return this.cartsService.addToCart(user.id, dto);
  }

  @Put('update')
  updateItem(@CurrentUser() user: JwtPayload, @Body() dto: UpdateCartItemDto) {
    return this.cartsService.updateItem(user.id, dto);
  }

  @Delete('delete')
  removeItem(@CurrentUser() user: JwtPayload, @Body() dto: RemoveCartItemDto) {
    return this.cartsService.removeItem(user.id, dto);
  }

  @Delete('deleteCart')
  deleteCart(@CurrentUser() user: JwtPayload) {
    return this.cartsService.deleteCart(user.id);
  }
}
