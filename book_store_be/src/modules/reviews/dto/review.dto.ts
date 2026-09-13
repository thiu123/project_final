import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

const RATING_RULE = { message: 'Rating must be between 1 and 5' };

export class CreateReviewDto {
  @IsMongoId({ message: 'Missing bookId' })
  bookId: string;

  @IsInt(RATING_RULE)
  @Min(1, RATING_RULE)
  @Max(5, RATING_RULE)
  rating: number;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Comment is required' })
  comment: string;
}

export class EditReviewDto {
  @IsInt(RATING_RULE)
  @Min(1, RATING_RULE)
  @Max(5, RATING_RULE)
  rating: number;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Comment is required' })
  comment: string;
}

export class ReplyDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Reply content is required' })
  content: string;
}
