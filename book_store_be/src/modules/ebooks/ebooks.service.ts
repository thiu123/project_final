import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import * as fs from 'fs';
import { Model, isValidObjectId } from 'mongoose';
import { Readable } from 'stream';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import {
  CLOUDINARY,
  Cloudinary,
} from '../../config/cloudinary/cloudinary.provider';
import { PAID_ORDER_STATUSES } from '../../constants/app.constants';
import { Book, BookDocument } from '../books/schemas/book.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { EbookPreview, buildPreview } from './ebook-preview';

const EBOOK_FOLDER = 'ebook_files';
const PREVIEW_FOLDER = 'ebook_previews';
const CLOUDINARY_ORIGIN = 'https://res.cloudinary.com/';

export interface StoredEbook {
  url: string;
  preview_url: string | null;
  pages: number;
}

export interface EbookFile {
  stream: Readable;
  length?: number;
}

@Injectable()
export class EbooksService {
  private readonly logger = new Logger(EbooksService.name);

  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @Inject(CLOUDINARY) private readonly cloudinary: Cloudinary,
  ) {}

  async hasPurchased(userId: string, bookId: string): Promise<boolean> {
    if (!isValidObjectId(bookId)) return false;

    const order = await this.orderModel.exists({
      userId,
      status: { $in: PAID_ORDER_STATUSES },
      items: { $elemMatch: { bookId, productType: 'ebook' } },
    });
    return order !== null;
  }

  async open(user: JwtPayload, bookId: string): Promise<EbookFile> {
    const book = isValidObjectId(bookId)
      ? await this.bookModel.findById(bookId).select('+pdf_url').lean()
      : null;

    if (!book?.pdf_url?.startsWith(CLOUDINARY_ORIGIN)) {
      throw new NotFoundException({ msg: 'This book has no ebook file' });
    }

    if (!user.admin && !(await this.hasPurchased(user.id, bookId))) {
      throw new ForbiddenException({
        msg: 'Buy the ebook to read the full book',
      });
    }

    try {
      const response = await axios.get<Readable>(book.pdf_url, {
        responseType: 'stream',
      });
      const length = Number(response.headers['content-length']);
      return {
        stream: response.data,
        length: Number.isFinite(length) ? length : undefined,
      };
    } catch (error) {
      this.logger.error(
        `Ebook ${bookId} could not be fetched: ${(error as Error).message}`,
      );
      throw new BadGatewayException({
        msg: 'The ebook file is unavailable right now',
      });
    }
  }

  async storeUpload(
    file: Express.Multer.File | undefined,
  ): Promise<StoredEbook> {
    if (!file) {
      throw new BadRequestException({ msg: 'No file uploaded' });
    }

    try {
      return await this.store(file.path);
    } finally {
      await fs.promises.rm(file.path, { force: true });
    }
  }

  async store(path: string): Promise<StoredEbook> {
    const { pages, preview } = await this.readPdf(path);

    try {
      const full = await this.cloudinary.uploader.upload(path, {
        folder: EBOOK_FOLDER,
        resource_type: 'raw',
      });
      const previewUpload = preview
        ? await this.uploadBuffer(preview, {
            folder: PREVIEW_FOLDER,
            resource_type: 'raw',
          })
        : null;

      return {
        url: full.secure_url,
        preview_url: previewUpload?.secure_url ?? null,
        pages,
      };
    } catch (error) {
      this.logger.error(`Ebook upload failed: ${JSON.stringify(error)}`);
      throw new InternalServerErrorException({ msg: 'Ebook upload failed' });
    }
  }

  private async readPdf(path: string): Promise<EbookPreview> {
    try {
      return await buildPreview(await fs.promises.readFile(path));
    } catch {
      throw new BadRequestException({
        msg: 'The file is not a readable PDF, or it needs a password to open',
      });
    }
  }

  private uploadBuffer(
    data: Uint8Array,
    options: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(options, (error, result) =>
          result ? resolve(result) : reject(error),
        )
        .end(Buffer.from(data));
    });
  }
}
