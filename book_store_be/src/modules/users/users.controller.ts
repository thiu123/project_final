import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UploadExceptionFilter } from './upload-exception.filter';
import { UsersService } from './users.service';

// Files are stored temporarily then pushed to Cloudinary.
// 10MB is the maximum for the Cloudinary free plan.
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /api/users — admin only */
  @Get()
  @UseGuards(AdminGuard)
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /** DELETE /api/users/:id — admin or the user themself */
  @Delete(':id')
  @UseGuards(AdminGuard)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  /** POST /api/users/upload-images?type=avatar|book|ebook_file */
  @Post('upload-images')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', { dest: 'tmp/', limits: { fileSize: MAX_UPLOAD_SIZE } }),
  )
  @UseFilters(UploadExceptionFilter)
  uploadImages(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('type') queryType: string | undefined,
    @Body('type') bodyType: string | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.uploadImage(file, queryType || bodyType || 'avatar', user.id);
  }
}
