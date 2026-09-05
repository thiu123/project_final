import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReviewDto, EditReviewDto } from './dto/review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>) {}

  /** All reviews of one book. */
  async getReviewsByBook(bookId: string) {
    if (!bookId) {
      throw new HttpException({ message: 'Missing bookId' }, HttpStatus.BAD_REQUEST);
    }

    return this.reviewModel
      .find({ bookId })
      .populate('userId')
      .populate('bookId', 'title')
      .populate('replies.adminId', 'username email');
  }

  /** Admin: every review across all books. */
  async getAllReviewsAdmin() {
    return this.reviewModel
      .find()
      .populate('userId', 'username email avatar_url')
      .populate('bookId', 'title cover_url')
      .populate('replies.adminId', 'username email')
      .sort({ createdAt: -1 });
  }

  async getReviewsByUser(userId: string) {
    return this.reviewModel.find({ userId }).populate('bookId').sort({ createdAt: -1 });
  }

  async createReview(userId: string, dto: CreateReviewDto) {
    const review = new this.reviewModel({ ...dto, userId });
    await review.save();
    return review;
  }

  async editReview(userId: string, id: string, dto: EditReviewDto) {
    const { rating, comment } = dto;

    if (!rating || !comment) {
      throw new HttpException({ msg: 'Rating and comment are required' }, HttpStatus.BAD_REQUEST);
    }
    if (rating < 1 || rating > 5) {
      throw new HttpException({ msg: 'Rating must be between 1 and 5' }, HttpStatus.BAD_REQUEST);
    }

    const review = await this.findReviewOrFail(id);
    if (review.userId.toString() !== userId) {
      throw new HttpException({ msg: 'You can only edit your own reviews' }, HttpStatus.FORBIDDEN);
    }

    review.rating = rating;
    review.comment = comment.trim();
    review.updatedAt = new Date();
    await review.save();

    await review.populate('userId', 'username email avatar_url');
    await review.populate('bookId', 'title cover_url');

    return { msg: 'Review updated successfully', review };
  }

  async deleteReview(userId: string, id: string) {
    const review = await this.findReviewOrFail(id);
    if (review.userId.toString() !== userId) {
      throw new HttpException(
        { msg: 'You can only delete your own reviews' },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.reviewModel.findByIdAndDelete(id);
    return { msg: 'Review deleted successfully' };
  }

  async getAverageRatingByBook(bookId: string) {
    if (!bookId) {
      throw new HttpException({ msg: 'Missing bookId parameter' }, HttpStatus.BAD_REQUEST);
    }

    const [stats] = await this.reviewModel.aggregate<{ avgRating: number; total: number }>([
      { $match: { bookId: new Types.ObjectId(bookId) } },
      {
        $group: {
          _id: '$bookId',
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
        },
      },
    ]);

    const average = stats?.avgRating || 0;
    return {
      bookId,
      averageRating: parseFloat(average.toFixed(2)),
      totalReviews: stats?.total || 0,
    };
  }

  // ---------------------------------------------------------------------
  // Admin replies
  // ---------------------------------------------------------------------

  async createReply(adminId: string, reviewId: string, content?: string) {
    const trimmed = this.requireContent(content);
    const review = await this.findReviewOrFail(reviewId);

    review.replies.push({ adminId, content: trimmed, createdAt: new Date() });
    await review.save();
    await review.populate('replies.adminId', 'username email');

    return {
      msg: 'Reply added successfully',
      reply: review.replies[review.replies.length - 1],
    };
  }

  async updateReply(adminId: string, reviewId: string, replyId: string, content?: string) {
    const trimmed = this.requireContent(content);
    const review = await this.findReviewOrFail(reviewId);
    const reply = this.findReplyOrFail(review, replyId, adminId, 'edit');

    reply.content = trimmed;
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

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  private requireContent(content?: string): string {
    if (!content || content.trim() === '') {
      throw new HttpException({ msg: 'Reply content is required' }, HttpStatus.BAD_REQUEST);
    }
    return content.trim();
  }

  private async findReviewOrFail(id: string): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new HttpException({ msg: 'Review not found' }, HttpStatus.NOT_FOUND);
    }
    return review;
  }

  private findReplyOrFail(
    review: ReviewDocument,
    replyId: string,
    adminId: string,
    action: 'edit' | 'delete',
  ) {
    const reply = review.replies.id(replyId);
    if (!reply) {
      throw new HttpException({ msg: 'Reply not found' }, HttpStatus.NOT_FOUND);
    }
    if (reply.adminId.toString() !== adminId) {
      throw new HttpException(
        { msg: `You can only ${action} your own replies` },
        HttpStatus.FORBIDDEN,
      );
    }
    return reply;
  }
}
