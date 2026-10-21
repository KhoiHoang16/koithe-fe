import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi, type CartDto } from '@/features/cart/api/cart-api';
import type { CartItem } from '@/shared/types/order.types';
import type { Voucher } from '@/shared/types/promotion.types';

function mapCartItems(cart: CartDto): CartItem[] {
  return cart.items.map((item) => ({
    id: String(item.id),
    productId: item.variantId,
    productName: item.productName,
    productImage: undefined,
    variantId: item.variantId,
    variantName: item.size,
    price: Number(item.unitPrice),
    sugarLevel: item.sugarLevel ?? '70%',
    iceLevel: item.iceLevel ?? '50%',
    toppings: item.toppings.map((topping) => ({
      id: topping.toppingId,
      tenTopping: topping.name,
      giaBan: Number(topping.unitPrice),
    })),
    quantity: item.quantity,
    note: item.note,
  }));
}

function readGuestCartToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('guest_cart_token');
}

interface CartState {
  items: CartItem[];
  appliedVoucher: Voucher | null;
  voucherDiscount: number;
  guestCartToken: string | null;

  hydrate: () => Promise<void>;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyVoucher: (voucher: Voucher | null, discountAmount: number) => void;
  setGuestCartToken: (token: string | null) => void;

  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: (shippingFee?: number) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedVoucher: null,
      voucherDiscount: 0,
      guestCartToken: null,

      hydrate: async () => {
        try {
          const cart = await cartApi.getCurrent();
          set({ items: mapCartItems(cart), guestCartToken: readGuestCartToken() });
        } catch {
          set({ guestCartToken: readGuestCartToken() });
        }
      },

      addItem: async (item) => {
        const cart = await cartApi.addItem({
          variantId: item.variantId,
          quantity: item.quantity,
          sugarLevel: item.sugarLevel,
          iceLevel: item.iceLevel,
          note: item.note,
          toppings: item.toppings.map((topping) => ({ toppingId: topping.id, quantity: 1 })),
        });
        set({ items: mapCartItems(cart), guestCartToken: readGuestCartToken() });
      },

      removeItem: async (id) => {
        await cartApi.removeItem(Number(id));
        const cart = await cartApi.getCurrent();
        set({ items: mapCartItems(cart), guestCartToken: readGuestCartToken() });
      },

      updateQuantity: async (id, delta) => {
        const target = get().items.find((item) => item.id === id);
        if (!target) return;
        const newQuantity = target.quantity + delta;
        if (newQuantity <= 0) {
          await cartApi.removeItem(Number(id));
        } else {
          await cartApi.updateItem(Number(id), { quantity: newQuantity });
        }
        const cart = await cartApi.getCurrent();
        set({ items: mapCartItems(cart), guestCartToken: readGuestCartToken() });
      },

      clearCart: async () => {
        await cartApi.clear();
        const cart = await cartApi.getCurrent();
        set({ items: mapCartItems(cart), guestCartToken: readGuestCartToken(), appliedVoucher: null, voucherDiscount: 0 });
      },

      applyVoucher: (voucher, discountAmount) =>
        set({ appliedVoucher: voucher, voucherDiscount: discountAmount }),

      setGuestCartToken: (token) => set({ guestCartToken: token }),

      getItemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((acc, item) => {
          const toppingTotal = item.toppings.reduce((sum, topping) => sum + topping.giaBan, 0);
          return acc + (item.price + toppingTotal) * item.quantity;
        }, 0),

      getTotal: (shippingFee = 0) => {
        const subtotal = get().getSubtotal();
        const discount = get().voucherDiscount;
        return Math.max(0, subtotal + shippingFee - discount);
      },
    }),
    {
      name: 'koithe-cart-storage',
      partialize: (state) => ({
        appliedVoucher: state.appliedVoucher,
        voucherDiscount: state.voucherDiscount,
      }),
    },
  ),
);
