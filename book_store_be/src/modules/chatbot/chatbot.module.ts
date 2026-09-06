import { Module } from '@nestjs/common';
import { RateLimitService } from '../../common/services/rate-limit.service';
import { BooksModule } from '../books/books.module';
import { ChatHistoryService } from './chat-history.service';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ChatbotToolsService } from './chatbot.tools';
import { GeminiService } from './gemini.service';

@Module({
  imports: [BooksModule],
  controllers: [ChatbotController],
  providers: [
    ChatbotService,
    ChatbotToolsService,
    ChatHistoryService,
    GeminiService,
    RateLimitService,
  ],
})
export class ChatbotModule {}
