import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { CLOUDINARY, Cloudinary } from '../../config/cloudinary/cloudinary.provider';
import { User, UserDocument } from './schemas/user.schema';

export type UploadType = 'avatar' | 'book' | 'ebook_file';

const FOLDER_MAP: Record<UploadType, string> = {
  avatar: 'avatars',
  book: 'books',
  ebook_file: 'ebook_files',
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(CLOUDINARY) private readonly cloudinary: Cloudinary,
  ) {}

  async getAllUsers() {
    return this.userModel.find().select('-password');
  }

  async deleteUser(id: string): Promise<string> {
    await this.userModel.findByIdAndDelete(id);
    return 'Deleted successfully';
  }

  /**
   * Uploads a file (image or raw ebook) to Cloudinary. Avatar uploads also
   * update the current user's `avatar_url`. The temp file is always removed.
   */
  async uploadImage(file: Express.Multer.File | undefined, uploadType: string, userId: string) {
    if (!file) {
      throw new HttpException({ msg: 'No file uploaded' }, HttpStatus.BAD_REQUEST);
    }

    const type = (uploadType || 'avatar') as UploadType;

    try {
      const result = await this.cloudinary.uploader.upload(file.path, {
        folder: FOLDER_MAP[type] || 'uploads',
        resource_type: type === 'ebook_file' ? 'raw' : 'image',
      });

      this.removeTempFile(file.path);

      let responseData: unknown = {
        url: result.secure_url,
        public_id: result.public_id,
        type,
      };

      if (type === 'avatar') {
        responseData = await this.userModel
          .findByIdAndUpdate(userId, { avatar_url: result.secure_url }, { new: true })
          .select('-password');
      } else if (type === 'book') {
        responseData = {
          url: result.secure_url,
          public_id: result.public_id,
          type: 'book',
        };
      }

      return {
        message: `Upload ${type} successfully`,
        data: responseData,
      };
    } catch (err) {
      this.logger.error(`Upload ${uploadType || 'file'} error: ${(err as Error).message}`);
      this.removeTempFile(file.path);
      throw new HttpException(
        { msg: (err as Error).message || 'Upload failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private removeTempFile(path?: string): void {
    if (!path || !fs.existsSync(path)) return;
    try {
      fs.unlinkSync(path);
    } catch (unlinkError) {
      this.logger.error(`Error deleting temp file: ${(unlinkError as Error).message}`);
    }
  }
}
