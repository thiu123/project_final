import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreateReviewDto, EditReviewDto, ReplyDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('create')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  createReview(@CurrentUser() user: JwtPayload, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(user.id, dto);
  }

  /** User: edit their own review */
  @Put('edit/:id')
  @UseGuards(JwtAuthGuard)
  editReview(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: EditReviewDto,
  ) {
    return this.reviewsService.editReview(user.id, id, dto);
  }

  @Get('user/reviews')
  @UseGuards(JwtAuthGuard)
  getReviewsByUser(@CurrentUser() user: JwtPayload) {
    return this.reviewsService.getReviewsByUser(user.id);
  }

  @Get('average/:id')
  getAverageRatingByBook(@Param('id') bookId: string) {
    return this.reviewsService.getAverageRatingByBook(bookId);
  }

  // ========== ADMIN ROUTES ==========
  @Get('admin/all')
  @UseGuards(AdminGuard)
  getAllReviewsAdmin() {
    return this.reviewsService.getAllReviewsAdmin();
  }

  /** All reviews of a book (`:id` is the bookId) */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getReviewsByBook(@Param('id') bookId: string) {
    return this.reviewsService.getReviewsByBook(bookId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteReview(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.reviewsService.deleteReview(user.id, id);
  }

  // ========== ADMIN REPLY ROUTES ==========
  @Post(':reviewId/reply')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  createReply(
    @CurrentUser() user: JwtPayload,
    @Param('reviewId') reviewId: string,
    @Body() dto: ReplyDto,
  ) {
    return this.reviewsService.createReply(user.id, reviewId, dto.content);
  }

  @Put(':reviewId/reply/:replyId')
  @UseGuards(AdminGuard)
  updateReply(
    @CurrentUser() user: JwtPayload,
    @Param('reviewId') reviewId: string,
    @Param('replyId') replyId: string,
    @Body() dto: ReplyDto,
  ) {
    return this.reviewsService.updateReply(user.id, reviewId, replyId, dto.content);
  }

  @Delete(':reviewId/reply/:replyId')
  @UseGuards(AdminGuard)
  deleteReply(
    @CurrentUser() user: JwtPayload,
    @Param('reviewId') reviewId: string,
    @Param('replyId') replyId: string,
  ) {
    return this.reviewsService.deleteReply(user.id, reviewId, replyId);
  }
}
