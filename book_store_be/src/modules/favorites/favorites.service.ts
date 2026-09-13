import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
  ) {}

  async toggleFavorite(userId: string, bookId: string) {
    const existing = await this.favoriteModel.findOne({ userId, bookId });

    if (existing) {
      await this.favoriteModel.findByIdAndDelete(existing._id);
    } else {
      await new this.favoriteModel({ userId, bookId }).save();
    }

    return this.getFavoritesForUser(userId);
  }

  getFavoritesForUser(userId: string) {
    return this.favoriteModel.find({ userId }).populate('bookId');
  }
}
