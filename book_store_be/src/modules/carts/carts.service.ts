import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AddToCartDto,
  RemoveCartItemDto,
  UpdateCartItemDto,
} from './dto/cart.dto';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
  ) {}

  async getCart(userId: string) {
    const cart = await this.cartModel
      .findOne({ userId })
      .populate('items.bookId');
    return cart ?? { userId, items: [] };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const productType = dto.productType ?? 'hardbook';
    const cart =
      (await this.cartModel.findOne({ userId })) ??
      new this.cartModel({ userId, items: [] });

    // The same book in print and as an ebook are two separate lines.
    const existing = cart.items.find(
      (item) =>
        item.bookId.toString() === dto.bookId &&
        item.productType === productType,
    );

    if (existing) {
      existing.quantity += dto.quantity;
    } else {
      cart.items.push({
        bookId: dto.bookId,
        quantity: dto.quantity,
        productType,
      });
    }

    await cart.save();
    return cart;
  }

  async updateItem(userId: string, dto: UpdateCartItemDto) {
    const cart = await this.findCartOrFail(userId);
    const item = cart.items.find(
      (entry) => entry.bookId.toString() === dto.bookId,
    );

    if (!item) {
      throw new NotFoundException({ msg: 'Item not found' });
    }

    item.quantity = dto.quantity;
    await cart.save();
    return cart;
  }

  async removeItem(userId: string, dto: RemoveCartItemDto) {
    const cart = await this.findCartOrFail(userId);

    for (const item of [...cart.items]) {
      if (item.bookId.toString() === dto.bookId) cart.items.pull(item._id);
    }

    await cart.save();
    return cart;
  }

  async deleteCart(userId: string) {
    const cart = await this.cartModel.findOneAndDelete({ userId });
    if (!cart) {
      throw new NotFoundException({ msg: 'Cart not found' });
    }
    return { msg: 'Cart deleted successfully' };
  }

  private async findCartOrFail(userId: string): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException({ msg: 'Cart not found' });
    }
    return cart;
  }
}
