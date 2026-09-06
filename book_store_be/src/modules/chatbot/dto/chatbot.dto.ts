import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * User text goes straight into a Gemini prompt, so the length cap is not
 * cosmetic: it bounds both the token bill and how much a caller can inject.
 */
const MAX_INPUT_LENGTH = 1000;

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class ChatDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Please type a message.' })
  @MaxLength(MAX_INPUT_LENGTH)
  message: string;
}

export class SuggestBooksDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Please provide your preferences.' })
  @MaxLength(MAX_INPUT_LENGTH)
  userPreferences: string;
}

export class GenerateReviewDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Please provide the book title or subject.' })
  @MaxLength(MAX_INPUT_LENGTH)
  bookQuery: string;
}
