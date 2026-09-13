import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ChatbotService } from './chatbot.service';
import { ChatDto, GenerateReviewDto, SuggestBooksDto } from './dto/chatbot.dto';

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  @HttpCode(200)
  chat(@CurrentUser() user: JwtPayload, @Body() dto: ChatDto) {
    return this.chatbotService.chat(user.id, dto.message);
  }

  @Delete('history')
  clearHistory(@CurrentUser() user: JwtPayload) {
    return this.chatbotService.clearHistory(user.id);
  }

  @Post('suggestions')
  @HttpCode(200)
  suggestBooks(@CurrentUser() user: JwtPayload, @Body() dto: SuggestBooksDto) {
    return this.chatbotService.suggestBooks(user.id, dto.userPreferences);
  }

  @Post('review/generate')
  @HttpCode(200)
  generateReview(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GenerateReviewDto,
  ) {
    return this.chatbotService.generateSmartReview(user.id, dto.bookQuery);
  }
}
