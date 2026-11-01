import type { PaymentResponse } from '../api/payment-api';

interface PaymentSession {
  ownerId: number;
  payment: PaymentResponse;
}

export function positiveId(value: string | null): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export function savePaymentSession(ownerId: number, payment: PaymentResponse): void {
  try {
    const session = JSON.stringify({ ownerId, payment });
    sessionStorage.setItem(`koithe-payment:${ownerId}:${payment.maDonHang}`, session);
    sessionStorage.setItem(`koithe-payment-last:${ownerId}`, session);
  } catch {
    // Checkout also passes the response in navigation state when tab storage is unavailable.
  }
}

export function readPaymentSession(
  ownerId: number | undefined,
  orderId?: number | null,
): PaymentResponse | null {
  if (!ownerId) return null;
  try {
    const key = orderId ? `koithe-payment:${ownerId}:${orderId}` : `koithe-payment-last:${ownerId}`;
    const session = JSON.parse(sessionStorage.getItem(key) || 'null') as PaymentSession | null;
    if (
      session?.ownerId !== ownerId ||
      !session.payment ||
      !positiveId(String(session.payment.id)) ||
      !positiveId(String(session.payment.maDonHang)) ||
      (orderId && session.payment.maDonHang !== orderId)
    )
      return null;
    return session.payment;
  } catch {
    return null;
  }
}

export function safeGatewayUrl(value?: string): string | null {
  try {
    const url = new URL(value || '');
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

// Use the exact bank/account/content encoded in the backend's VietQR URL.
// noiDungVietqr in the current DTO contains a transaction reference, not this content.
export function parseVietQr(value: string | undefined, amount: number) {
  try {
    const url = new URL(value || '');
    const path = /^\/image\/([A-Za-z0-9]+)-(\d+)-[A-Za-z0-9]+\.png$/.exec(url.pathname);
    const content = url.searchParams.get('addInfo');
    const encodedAmount = url.searchParams.get('amount');
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'img.vietqr.io' ||
      url.port ||
      url.username ||
      url.password ||
      !path ||
      !content ||
      !encodedAmount ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      Number(encodedAmount) !== amount
    )
      return null;
    return {
      imageUrl: url.href,
      bank: path[1],
      account: path[2],
      content,
      accountName: url.searchParams.get('accountName') || '',
    };
  } catch {
    return null;
  }
}

export function isPendingPayment(status: string): boolean {
  return status === 'CHO_XU_LY' || status === 'CHO_THANH_TOAN';
}
