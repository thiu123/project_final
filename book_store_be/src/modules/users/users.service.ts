import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import {
  CLOUDINARY,
  Cloudinary,
} from '../../config/cloudinary/cloudinary.provider';
import { User, UserDocument } from './schemas/user.schema';

export type UploadType = 'avatar' | 'book' | 'ebook_file';

const FOLDERS: Record<UploadType, string> = {
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

  getAllUsers() {
    return this.userModel.find().select('-password');
  }

  async deleteUser(id: string): Promise<string> {
    await this.userModel.findByIdAndDelete(id);
    return 'Deleted successfully';
  }

  async uploadImage(
    file: Express.Multer.File | undefined,
    uploadType: string,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException({ msg: 'No file uploaded' });
    }

    const type = (uploadType || 'avatar') as UploadType;

    try {
      const result = await this.cloudinary.uploader.upload(file.path, {
        folder: FOLDERS[type] ?? 'uploads',
        resource_type: type === 'ebook_file' ? 'raw' : 'image',
      });

      const data =
        type === 'avatar'
          ? await this.userModel
              .findByIdAndUpdate(
                userId,
                { avatar_url: result.secure_url },
                { new: true },
              )
              .select('-password')
          : { url: result.secure_url, public_id: result.public_id, type };

      return { message: `Upload ${type} successfully`, data };
    } catch (error) {
      this.logger.error(`Upload ${type} error: ${(error as Error).message}`);
      throw new InternalServerErrorException({
        msg: (error as Error).message || 'Upload failed',
      });
    } finally {
      this.removeTempFile(file.path);
    }
  }

  private removeTempFile(path?: string): void {
    if (!path || !fs.existsSync(path)) return;
    try {
      fs.unlinkSync(path);
    } catch (error) {
      this.logger.error(
        `Error deleting temp file: ${(error as Error).message}`,
      );
    }
  }
}
