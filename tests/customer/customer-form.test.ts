import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerPermissions,
  customerId,
} from '../../src/features/customer/schema/customer-form.ts';

test('create validates and normalizes the fields supported by the customer API', () => {
  assert.deepEqual(
    createCustomerSchema.parse({
      hoVaTen: '  QA Khách hàng  ',
      soDienThoai: ' 0910280401 ',
      email: ' qa@example.invalid ',
    }),
    { hoVaTen: 'QA Khách hàng', soDienThoai: '0910280401', email: 'qa@example.invalid' },
  );
  for (const phone of ['', '123', '1234567890', '09102804011', '+84910280401', '0110280401']) {
    assert.equal(
      createCustomerSchema.safeParse({ hoVaTen: 'QA', soDienThoai: phone, email: '' }).success,
      false,
    );
  }
  assert.equal(
    createCustomerSchema.safeParse({ hoVaTen: ' ', soDienThoai: '0910280401', email: '' }).success,
    false,
  );
  assert.equal(
    createCustomerSchema.safeParse({
      hoVaTen: 'A'.repeat(101),
      soDienThoai: '0910280401',
      email: '',
    }).success,
    false,
  );
  assert.equal(
    createCustomerSchema.safeParse({ hoVaTen: 'QA', soDienThoai: '0910280401', email: 'not-email' })
      .success,
    false,
  );
});

test('edit accepts the existing read-only phone, including legacy +84 numbers', () => {
  assert.equal(
    updateCustomerSchema.safeParse({ hoVaTen: 'QA', soDienThoai: '+84910280401', email: '' })
      .success,
    true,
  );
});

test('role permissions restrict edit/delete while allowing cashier read/create', () => {
  assert.deepEqual(customerPermissions('ADMIN'), {
    read: true,
    create: true,
    update: true,
    delete: true,
  });
  assert.deepEqual(customerPermissions('MANAGER'), {
    read: true,
    create: true,
    update: true,
    delete: false,
  });
  assert.deepEqual(customerPermissions('CASHIER'), {
    read: true,
    create: true,
    update: false,
    delete: false,
  });
  for (const role of [undefined, 'CUSTOMER', 'BARISTA', 'unknown']) {
    assert.deepEqual(customerPermissions(role), {
      read: false,
      create: false,
      update: false,
      delete: false,
    });
  }
});

test('detail rejects missing or malformed IDs instead of requesting a default customer', () => {
  for (const id of [undefined, '', '0', '-1', '1.2', '1e2', 'abc', '9007199254740992'])
    assert.equal(customerId(id), null);
  assert.equal(customerId('12'), 12);
});
