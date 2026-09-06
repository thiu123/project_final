import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ChatbotService } from './chatbot.service';
import { ChatDto, GenerateReviewDto, SuggestBooksDto } from './dto/chatbot.dto';

/**
 * Trims and length-checks the prompt inputs. Scoped to this controller because
 * the app has no global pipe and other modules rely on current behaviour.
 */
const bodyPipe = new ValidationPipe({ transform: true, whitelist: true });

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /** Conversational endpoint: remembers the thread and can query the catalogue. */
  @Post('chat')
  @HttpCode(200)
  chat(@CurrentUser() user: JwtPayload, @Body(bodyPipe) dto: ChatDto) {
    return this.chatbotService.chat(user.id, dto.message);
  }

  /** Starts a fresh conversation for the current user. */
  @Delete('history')
  clearHistory(@CurrentUser() user: JwtPayload) {
    return this.chatbotService.clearHistory(user.id);
  }

  @Post('suggestions')
  @HttpCode(200)
  suggestBooks(
    @CurrentUser() user: JwtPayload,
    @Body(bodyPipe) dto: SuggestBooksDto,
  ) {
    return this.chatbotService.suggestBooks(user.id, dto.userPreferences);
  }

  @Post('review/generate')
  @HttpCode(200)
  generateReview(
    @CurrentUser() user: JwtPayload,
    @Body(bodyPipe) dto: GenerateReviewDto,
  ) {
    return this.chatbotService.generateSmartReview(user.id, dto.bookQuery);
  }
}
