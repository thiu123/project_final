import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContactDto } from './dto/contact.dto';
import { Contact, ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async createContact(userId: string, dto: CreateContactDto) {
    const contact = await new this.contactModel({
      user: userId,
      message: dto.message,
    }).save();

    return {
      success: true,
      message: 'Contact message sent successfully',
      data: contact,
    };
  }

  async getAllContacts() {
    const contacts = await this.contactModel
      .find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    return { success: true, data: contacts };
  }

  async getUserContacts(userId: string) {
    const contacts = await this.contactModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    return { success: true, data: contacts };
  }

  async deleteContact(id: string) {
    const contact = await this.contactModel.findByIdAndDelete(id);
    if (!contact) {
      throw new NotFoundException({
        success: false,
        message: 'Contact not found',
      });
    }

    return { success: true, message: 'Contact deleted successfully' };
  }
}
