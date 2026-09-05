import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';

const MIN_MESSAGE_LENGTH = 10;

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private readonly contactModel: Model<ContactDocument>,
  ) {}

  async createContact(userId: string, username: string | undefined, message?: string) {
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      throw new HttpException(
        { success: false, message: 'Message must be at least 10 characters' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const contact = await new this.contactModel({ user: userId, username, message }).save();

    return {
      success: true,
      message: 'Contact message sent successfully',
      data: contact,
    };
  }

  /** Admin: every contact message, newest first. */
  async getAllContacts() {
    const contacts = await this.contactModel
      .find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    return { success: true, data: contacts };
  }

  async getUserContacts(userId: string) {
    const contacts = await this.contactModel.find({ user: userId }).sort({ createdAt: -1 });
    return { success: true, data: contacts };
  }

  async getContactById(id: string) {
    const contact = await this.contactModel.findById(id).populate('user', 'username email');
    if (!contact) {
      throw new HttpException(
        { success: false, message: 'Contact not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return { success: true, data: contact };
  }

  async deleteContact(id: string) {
    const contact = await this.contactModel.findByIdAndDelete(id);
    if (!contact) {
      throw new HttpException(
        { success: false, message: 'Contact not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return { success: true, message: 'Contact deleted successfully' };
  }
}
