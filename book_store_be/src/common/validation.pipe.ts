import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

function firstMessage(errors: ValidationError[]): string {
  for (const error of errors) {
    const constraints = Object.values(error.constraints ?? {});
    if (constraints.length > 0) return constraints[0];
    if (error.children?.length) return firstMessage(error.children);
  }
  return 'Invalid request data';
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    exceptionFactory: (errors: ValidationError[]) => {
      const message = firstMessage(errors);
      return new BadRequestException({ msg: message, message });
    },
  });
}
