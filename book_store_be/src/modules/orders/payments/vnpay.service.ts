import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { dateFormat, HashAlgorithm, ignoreLogger, ProductCode, VNPay, VnpLocale } from 'vnpay';
import { PaymentRequest } from './payment.types';

@Injectable()
export class VnpayService {
  private readonly logger = new Logger(VnpayService.name);
  private readonly vnpay: VNPay;
  private readonly returnUrl: string;

  constructor(configService: ConfigService) {
    const backendUrl = configService.get<string>('BACKEND_URL') ?? 'http://localhost:5000';
    this.returnUrl = `${backendUrl}/api/order/vnpay_return`;

    // Sandbox credentials are the defaults so the dev flow keeps working without extra env.
    this.vnpay = new VNPay({
      tmnCode: configService.get<string>('VNPAY_TMN_CODE') ?? 'PLQTSFX0',
      secureSecret:
        configService.get<string>('VNPAY_SECURE_SECRET') ?? 'QJII36JEMAK9961SUTIL54JLJG9IY58H',
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      enableLog: true,
      loggerFn: ignoreLogger,
    });
  }

  /** Builds the redirect URL that sends the customer to the VNPay checkout page. */
  async buildPaymentUrl({ orderId, amount }: PaymentRequest): Promise<string> {
    const vnpAmount = Math.round(Number(amount));

    try {
      return await this.vnpay.buildPaymentUrl({
        vnp_Amount: vnpAmount,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_IpAddr: '127.0.0.1',
        vnp_Locale: VnpLocale.VN,
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: this.returnUrl,
        vnp_TxnRef: orderId,
      });
    } catch (error) {
      this.logger.error(`VNPay Error: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
