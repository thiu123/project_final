import { IsMongoId } from 'class-validator';

export class ToggleFavoriteDto {
  @IsMongoId({ message: 'Book ID is required' })
  bookId: string;
}
