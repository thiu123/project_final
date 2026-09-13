import { OrderStatus, PaymentMethod } from '../../constants/app.constants';

/**
 * Which statuses an admin may move an order into, by payment method.
 *
 * Prepaid (VNPay/MoMo): only the gateway callback may write `Paid` or
 * `Failed`, so the admin can push fulfilment forward but never the money.
 * COD: no gateway ever reports back, so `Paid` is the admin's to set — and
 * only after `Delivered`, because nobody collects cash at a door the courier
 * has not reached.
 */
const ADMIN_TRANSITIONS: Record<
  'prepaid' | 'cod',
  Partial<Record<OrderStatus, OrderStatus[]>>
> = {
  prepaid: {
    Pending: ['Cancelled'],
    Paid: ['Confirmed', 'Cancelled'],
    Confirmed: ['In Delivery', 'Cancelled'],
    'In Delivery': ['Delivered'],
  },
  cod: {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['In Delivery', 'Cancelled'],
    'In Delivery': ['Delivered', 'Failed'],
    Delivered: ['Paid'],
  },
};

export function allowedTransitions(
  paymentMethod: PaymentMethod,
  status: OrderStatus,
): OrderStatus[] {
  const table =
    paymentMethod === 'COD' ? ADMIN_TRANSITIONS.cod : ADMIN_TRANSITIONS.prepaid;
  return table[status] ?? [];
}

// Orders whose money has actually arrived. A COD order only counts once an
// admin confirms the cash came back, not when it is delivered.
export const REVENUE_MATCH = {
  $or: [
    {
      paymentMethod: { $ne: 'COD' },
      status: { $in: ['Paid', 'Confirmed', 'In Delivery', 'Delivered'] },
    },
    { paymentMethod: 'COD', status: 'Paid' },
  ],
};
