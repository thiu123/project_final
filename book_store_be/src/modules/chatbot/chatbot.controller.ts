import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatbotService } from './chatbot.service';
import { GenerateReviewDto, SuggestBooksDto } from './dto/chatbot.dto';

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('suggestions')
  @HttpCode(200)
  suggestBooks(@Body() dto: SuggestBooksDto) {
    return this.chatbotService.suggestBooks(dto.userPreferences);
  }

  @Post('review/generate')
  @HttpCode(200)
  generateReview(@Body() dto: GenerateReviewDto) {
    return this.chatbotService.generateSmartReview(dto.bookQuery);
  }
}
