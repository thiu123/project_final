import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

// User text goes straight into a Gemini prompt, so the cap bounds both the
// token bill and how much a caller can inject.
const MAX_INPUT_LENGTH = 1000;

export class ChatDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Please type a message.' })
  @MaxLength(MAX_INPUT_LENGTH)
  message: string;
}
