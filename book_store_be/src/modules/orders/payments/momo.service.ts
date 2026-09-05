import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { PaymentRequest } from './payment.types';

interface MomoCreateResponse {
  resultCode: number;
  message?: string;
  payUrl?: string;
}

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);

  private readonly partnerCode = 'MOMO';
  private readonly endpoint = 'https://test-payment.momo.vn/v2/gateway/api';
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly redirectUrl: string;
  private readonly ipnUrl: string;

  constructor(configService: ConfigService) {
    this.accessKey = configService.get<string>('MOMO_ACCESS_KEY') ?? '';
    this.secretKey = configService.get<string>('MOMO_SECRET_KEY') ?? '';

    const backendUrl = configService.get<string>('BACKEND_URL') ?? 'http://localhost:5000';
    this.redirectUrl = `${backendUrl}/api/order/momo_return`;
    this.ipnUrl = this.redirectUrl;
  }

  /** Creates a MoMo payment and returns the `payUrl` the customer is redirected to. */
  async buildPaymentUrl({ orderId, amount }: PaymentRequest): Promise<string> {
    const requestId = `${orderId}${Date.now()}`;
    const requestType = 'payWithMethod';
    const extraData = '';
    const orderInfo = `Thanh toán đơn hàng ${orderId}`;

    const rawSignature =
      `accessKey=${this.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${this.ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${this.partnerCode}` +
      `&redirectUrl=${this.redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
    };

    try {
      const { data } = await axios.post<MomoCreateResponse>(
        `${this.endpoint}/create`,
        requestBody,
        { headers: { 'Content-Type': 'application/json' } },
      );

      if (data.resultCode === 0 && data.payUrl) {
        return data.payUrl;
      }
      throw new Error(
        data.message || `MoMo payment creation failed with code: ${data.resultCode}`,
      );
    } catch (error) {
      const details =
        (error as AxiosError).response?.data ?? (error as Error).message;
      this.logger.error(`MoMo Create Payment Error: ${JSON.stringify(details)}`);
      throw error;
    }
  }
}
