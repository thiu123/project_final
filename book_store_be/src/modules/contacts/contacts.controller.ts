import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ContactsService } from './contacts.service';

@Controller('contact')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createContact(
    @CurrentUser() user: JwtPayload & { username?: string },
    @Body('message') message?: string,
  ) {
    return this.contactsService.createContact(user.id, user.username, message);
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getContactById(@Param('id') id: string) {
    return this.contactsService.getContactById(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deleteContact(@Param('id') id: string) {
    return this.contactsService.deleteContact(id);
  }
}
