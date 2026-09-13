import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReviewDto, EditReviewDto } from './dto/review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  getReviewsByBook(bookId: string) {
    return this.reviewModel
      .find({ bookId })
      .populate('userId')
      .populate('bookId', 'title')
      .populate('replies.adminId', 'username email');
  }

  getAllReviewsAdmin() {
    return this.reviewModel
      .find()
      .populate('userId', 'username email avatar_url')
      .populate('bookId', 'title cover_url')
      .populate('replies.adminId', 'username email')
      .sort({ createdAt: -1 });
  }

  getReviewsByUser(userId: string) {
    return this.reviewModel
      .find({ userId })
      .populate('bookId')
      .sort({ createdAt: -1 });
  }

  createReview(userId: string, dto: CreateReviewDto) {
    return new this.reviewModel({ ...dto, userId }).save();
  }

  async editReview(userId: string, id: string, dto: EditReviewDto) {
    const review = await this.findReviewOrFail(id);
    this.assertOwner(review, userId, 'edit');

    review.rating = dto.rating;
    review.comment = dto.comment;
    await review.save();

    await review.populate('userId', 'username email avatar_url');
    await review.populate('bookId', 'title cover_url');

    return { msg: 'Review updated successfully', review };
  }

  async deleteReview(userId: string, id: string) {
    const review = await this.findReviewOrFail(id);
    this.assertOwner(review, userId, 'delete');

    await this.reviewModel.findByIdAndDelete(id);
    return { msg: 'Review deleted successfully' };
  }

  async getAverageRatingByBook(bookId: string) {
    const [stats] = await this.reviewModel.aggregate<{
      avgRating: number;
      total: number;
    }>([
      { $match: { bookId: new Types.ObjectId(bookId) } },
      {
        $group: {
          _id: '$bookId',
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
        },
      },
    ]);

    return {
      bookId,
      averageRating: Number((stats?.avgRating ?? 0).toFixed(2)),
      totalReviews: stats?.total ?? 0,
    };
  }

  async createReply(adminId: string, reviewId: string, content: string) {
    const review = await this.findReviewOrFail(reviewId);

    review.replies.push({ adminId, content, createdAt: new Date() });
    await review.save();
    await review.populate('replies.adminId', 'username email');

    return {
      msg: 'Reply added successfully',
      reply: review.replies[review.replies.length - 1],
    };
  }

  async updateReply(
    adminId: string,
    reviewId: string,
    replyId: string,
    content: string,
  ) {
    const review = await this.findReviewOrFail(reviewId);
    const reply = this.findReplyOrFail(review, replyId, adminId, 'edit');

    reply.content = content;
    await review.save();
    await review.populate('replies.adminId', 'username email');

    return { msg: 'Reply updated successfully', reply };
  }

  async deleteReply(adminId: string, reviewId: string, replyId: string) {
    const review = await this.findReviewOrFail(reviewId);
    this.findReplyOrFail(review, replyId, adminId, 'delete');

    review.replies.pull(replyId);
    await review.save();

    return { msg: 'Reply deleted successfully' };
  }

  private async findReviewOrFail(id: string): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException({ msg: 'Review not found' });
    }
    return review;
  }

  private assertOwner(
    review: ReviewDocument,
    userId: string,
    action: 'edit' | 'delete',
  ): void {
    if (review.userId.toString() !== userId) {
      throw new ForbiddenException({
        msg: `You can only ${action} your own reviews`,
      });
    }
  }

  private findReplyOrFail(
    review: ReviewDocument,
    replyId: string,
    adminId: string,
    action: 'edit' | 'delete',
  ) {
    const reply = review.replies.id(replyId);
    if (!reply) {
      throw new NotFoundException({ msg: 'Reply not found' });
    }
    if (reply.adminId.toString() !== adminId) {
      throw new ForbiddenException({
        msg: `You can only ${action} your own replies`,
      });
    }
    return reply;
  }
}
