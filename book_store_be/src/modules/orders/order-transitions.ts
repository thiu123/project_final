import { OrderStatus, PaymentMethod } from '../../constants/app.constants';

/**
 * Which statuses an admin may move an order into, by payment method.
 *
 * The single `status` enum carries two different things at once: whether the
 * money has arrived, and how far the parcel has got. Who owns the money half
 * depends entirely on how the order is paid, which is why this map is split.
 *
 * Prepaid (VNPay/MoMo): the gateway callback writes `Pending`, `Paid` and
 * `Failed`. An admin who could type `Paid` by hand would be recording money the
 * bank never sent — and because that path never commits inventory, the stock,
 * the voucher and the buyer's cart would all stay untouched while the order
 * claimed to be settled. So the admin only ever pushes fulfilment forward.
 *
 * COD: no gateway will ever report anything, so `Paid` is the admin's to set.
 * It sits after `Delivered` because nobody can collect cash at a door the
 * courier has not reached yet; the gap between the two is the money in transit
 * back from the courier.
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

/** Statuses an admin may move this order into next. Empty means terminal. */
export const allowedTransitions = (
  paymentMethod: PaymentMethod,
  status: OrderStatus,
): OrderStatus[] =>
  ADMIN_TRANSITIONS[paymentMethod === 'COD' ? 'cod' : 'prepaid'][status] ?? [];

/**
 * Matches orders whose money has actually arrived.
 *
 * A prepaid order is settled the moment the gateway says so, and every later
 * fulfilment state inherits that. A COD order is not: it is only paid once an
 * admin has confirmed the cash came back, so counting it any earlier would put
 * money on the dashboard that nobody has received.
 */
export const REVENUE_MATCH = {
  $or: [
    {
      paymentMethod: { $ne: 'COD' },
      status: { $in: ['Paid', 'Confirmed', 'In Delivery', 'Delivered'] },
    },
    { paymentMethod: 'COD', status: 'Paid' },
  ],
};
