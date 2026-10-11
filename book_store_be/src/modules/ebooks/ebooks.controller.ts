import {
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { EbooksService } from './ebooks.service';

const MAX_EBOOK_SIZE = 10 * 1024 * 1024;

@Controller('books')
export class EbooksController {
  constructor(private readonly ebooksService: EbooksService) {}

  @Post('ebook-file')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'tmp/',
      limits: { fileSize: MAX_EBOOK_SIZE },
    }),
  )
  uploadEbook(@UploadedFile() file: Express.Multer.File | undefined) {
    return this.ebooksService.storeUpload(file);
  }

  @Get(':id/read')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, no-store')
  async read(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<StreamableFile> {
    const { stream, length } = await this.ebooksService.open(user, id);
    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: 'inline',
      length,
    });
  }
}
