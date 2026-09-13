import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(PayloadTooLargeException, BadRequestException)
export class UploadExceptionFilter implements ExceptionFilter {
  catch(
    exception: PayloadTooLargeException | BadRequestException,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof PayloadTooLargeException) {
      response
        .status(HttpStatus.PAYLOAD_TOO_LARGE)
        .json({ msg: 'File too large. Maximum size is 10MB.' });
      return;
    }

    response.status(HttpStatus.BAD_REQUEST).json({ msg: exception.message });
  }
}
