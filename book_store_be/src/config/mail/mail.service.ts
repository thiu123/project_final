import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;
  private readonly isProduction: boolean;

  constructor(configService: ConfigService) {
    const host = configService.get<string>('MAIL_HOST');
    const user = configService.get<string>('MAIL_USER');
    const pass = configService.get<string>('MAIL_PASSWORD');
    const port = Number(configService.get<string>('MAIL_PORT') ?? 587);

    this.isProduction = configService.get<string>('NODE_ENV') === 'production';
    this.from = configService.get<string>('MAIL_FROM') || user || '';
    this.transporter =
      host && user && pass
        ? createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          })
        : null;

    if (!this.transporter) {
      this.logger.warn(
        'MAIL_HOST / MAIL_USER / MAIL_PASSWORD not set: emails will not be sent',
      );
    }
  }

  async send(message: MailMessage): Promise<boolean> {
    if (!this.transporter) {
      if (!this.isProduction) {
        this.logger.warn(
          `[mail disabled] To: ${message.to} | ${message.subject}\n${message.text}`,
        );
      }
      return false;
    }

    try {
      await this.transporter.sendMail({ from: this.from, ...message });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send "${message.subject}" to ${message.to}: ${(error as Error).message}`,
      );
      return false;
    }
  }
}
