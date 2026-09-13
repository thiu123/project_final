import { IsString, MinLength } from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class CreateContactDto {
  @Trim()
  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  message: string;
}
