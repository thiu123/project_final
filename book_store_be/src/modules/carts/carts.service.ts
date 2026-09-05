import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddToCartDto, RemoveCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartsService {
  constructor(@InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>) {}

  async getCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId }).populate('items.bookId');
    if (!cart) {
      return { userId, items: [] };
    }
    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const { bookId, quantity } = dto;
    const type = dto.productType || 'hardbook';

    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = new this.cartModel({
        userId,
        items: [{ bookId, quantity, productType: type }],
      });
    } else {
      // Same book AND same product type: bump quantity, otherwise add a new line
      const existing = cart.items.find(
        (item) => item.bookId.toString() === bookId && item.productType === type,
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ bookId, quantity, productType: type });
      }
    }

    await cart.save();
    return cart;
  }

  async updateItem(userId: string, dto: UpdateCartItemDto) {
    const { bookId, quantity } = dto;
    if (!bookId || quantity < 1) {
      throw new HttpException({ msg: 'Invalid bookId or quantity' }, HttpStatus.BAD_REQUEST);
    }

    const cart = await this.findCartOrFail(userId);
    const item = cart.items.find((entry) => entry.bookId.toString() === bookId);
    if (!item) {
      throw new HttpException({ msg: 'Item not found' }, HttpStatus.NOT_FOUND);
    }

    item.quantity = quantity;
    await cart.save();
    return cart;
  }

  async removeItem(userId: string, dto: RemoveCartItemDto) {
    const { bookId } = dto;
    if (!bookId) {
      throw new HttpException({ msg: 'Invalid bookId' }, HttpStatus.BAD_REQUEST);
    }

    const cart = await this.findCartOrFail(userId);
    const toRemove = cart.items.filter((item) => item.bookId.toString() === bookId);
    for (const item of toRemove) {
      cart.items.pull(item._id);
    }
    await cart.save();
    return cart;
  }

  async deleteCart(userId: string) {
    const cart = await this.cartModel.findOneAndDelete({ userId });
    if (!cart) {
      throw new HttpException({ msg: 'Cart not found' }, HttpStatus.NOT_FOUND);
    }
    return { msg: 'Cart deleted successfully' };
  }

  private async findCartOrFail(userId: string): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new HttpException({ msg: 'Cart not found' }, HttpStatus.NOT_FOUND);
    }
    return cart;
  }
}
