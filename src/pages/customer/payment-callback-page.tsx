import { PaymentPage } from './payment-page';

// Query parameters locate the transaction; only the backend can confirm success.
export function PaymentCallbackPage() {
  return <PaymentPage callback />;
}
