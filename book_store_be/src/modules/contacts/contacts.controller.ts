import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createContact(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.createContact(user.id, dto);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  getUserContacts(@CurrentUser() user: JwtPayload) {
    return this.contactsService.getUserContacts(user.id);
  }

  @Get()
  @UseGuards(AdminGuard)
  getAllContacts() {
    return this.contactsService.getAllContacts();
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deleteContact(@Param('id') id: string) {
    return this.contactsService.deleteContact(id);
  }
}
