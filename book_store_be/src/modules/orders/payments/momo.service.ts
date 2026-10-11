import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { PaymentRequest, PaymentResult } from './payment.types';

interface MomoCreateResponse {
  resultCode: number;
  message?: string;
  payUrl?: string;
}

const RESULT_SIGNATURE_FIELDS = [
  'amount',
  'extraData',
  'message',
  'orderId',
  'orderInfo',
  'orderType',
  'partnerCode',
  'payType',
  'requestId',
  'responseTime',
  'resultCode',
  'transId',
] as const;

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

    const backendUrl =
      configService.get<string>('BACKEND_URL') ?? 'http://localhost:5000';
    this.redirectUrl = `${backendUrl}/api/order/momo_return`;
    this.ipnUrl = `${backendUrl}/api/order/momo_ipn`;
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
        data.message ||
          `MoMo payment creation failed with code: ${data.resultCode}`,
      );
    } catch (error) {
      const details =
        (error as AxiosError).response?.data ?? (error as Error).message;
      this.logger.error(
        `MoMo Create Payment Error: ${JSON.stringify(details)}`,
      );
      throw error;
    }
  }

  verify(params: Record<string, unknown>): PaymentResult | null {
    const received = params.signature;
    if (
      typeof received !== 'string' ||
      params.partnerCode !== this.partnerCode
    ) {
      return null;
    }

    const rawSignature = [
      `accessKey=${this.accessKey}`,
      ...RESULT_SIGNATURE_FIELDS.map(
        (field) => `${field}=${this.stringify(params[field])}`,
      ),
    ].join('&');
    const expected = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const valid =
      received.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
    if (!valid || !params.orderId) return null;

    return {
      orderId: this.stringify(params.orderId),
      success: Number(params.resultCode) === 0,
      amount: Number(params.amount),
    };
  }

  private stringify(value: unknown): string {
    return typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : '';
  }
}
