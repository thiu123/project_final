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
import { ChatDto } from './dto/chatbot.dto';

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
}
