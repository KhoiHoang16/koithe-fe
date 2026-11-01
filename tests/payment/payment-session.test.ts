import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isPendingPayment,
  parseVietQr,
  positiveId,
  readPaymentSession,
  safeGatewayUrl,
  savePaymentSession,
} from '../../src/features/payment/services/payment-session.ts';
import type { PaymentResponse } from '../../src/features/payment/api/payment-api';

test('only positive safe integer identifiers are accepted', () => {
  for (const value of [null, '', '0', '-1', '1.5', '1e2', '1001foo', '9007199254740992']) {
    assert.equal(positiveId(value), null);
  }
  assert.equal(positiveId('8'), 8);
});

test('QR details come from the backend URL and must match the transaction amount', () => {
  const url =
    'https://img.vietqr.io/image/MB-123456-compact2.png?amount=35000&addInfo=DH2026008&accountName=QA+STORE';
  assert.deepEqual(parseVietQr(url, 35000), {
    imageUrl: url,
    bank: 'MB',
    account: '123456',
    content: 'DH2026008',
    accountName: 'QA STORE',
  });
  assert.equal(parseVietQr(url, 45000), null);
  assert.equal(parseVietQr(url.replace('img.vietqr.io', 'img.vietqr.io.example.com'), 35000), null);
  assert.equal(parseVietQr(url.replace('https:', 'http:'), 35000), null);
  assert.equal(parseVietQr(url.replace('amount=35000', 'amount=bad'), 35000), null);
  assert.equal(parseVietQr(url.replace('addInfo=DH2026008', 'addInfo='), 35000), null);
  assert.equal(parseVietQr(undefined, 35000), null);
});

test('gateway navigation rejects script URLs and credentials embedded in URLs', () => {
  assert.equal(safeGatewayUrl('javascript:alert(1)'), null);
  assert.equal(safeGatewayUrl('https://user:password@example.com/pay'), null);
  assert.equal(safeGatewayUrl('http://example.com/pay'), null);
  assert.equal(safeGatewayUrl('https://example.com/pay?id=8'), 'https://example.com/pay?id=8');
});

test('only pending statuses continue polling', () => {
  assert.equal(isPendingPayment('CHO_XU_LY'), true);
  assert.equal(isPendingPayment('CHO_THANH_TOAN'), true);
  for (const status of ['THANH_CONG', 'THAT_BAI', 'DA_HUY', '', 'UNKNOWN'])
    assert.equal(isPendingPayment(status), false);
});

test('tab cache is isolated by owner and order and survives a reload without creating payments', () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      setItem: (key: string, value: string) => values.set(key, value),
      getItem: (key: string) => values.get(key) ?? null,
    },
  });
  const payment: PaymentResponse = {
    id: 8,
    maDonHang: 12,
    soTien: 35000,
    phuongThucThanhToan: 'CHUYEN_KHOAN_QR',
    trangThai: 'CHO_XU_LY',
    redirectUrl: 'https://example.com/qr',
  };
  savePaymentSession(1, payment);
  assert.deepEqual(readPaymentSession(1, 12), payment);
  assert.deepEqual(readPaymentSession(1), payment);
  assert.equal(readPaymentSession(2, 12), null);
  assert.equal(readPaymentSession(1, 13), null);
  values.set('koithe-payment:1:12', '{broken');
  assert.equal(readPaymentSession(1, 12), null);
});

test('unavailable tab storage never prevents completing checkout', () => {
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    get() {
      throw new Error('blocked');
    },
  });
  assert.doesNotThrow(() =>
    savePaymentSession(1, {
      id: 8,
      maDonHang: 12,
      soTien: 35000,
      phuongThucThanhToan: 'VNPAY',
      trangThai: 'CHO_XU_LY',
    }),
  );
  assert.equal(readPaymentSession(1, 12), null);
});
