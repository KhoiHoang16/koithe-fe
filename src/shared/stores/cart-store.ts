import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, SelectedTopping } from '@/shared/types/order.types';
import type { Voucher } from '@/shared/types/promotion.types';

interface CartState {
  items: CartItem[];
  appliedVoucher: Voucher | null;
  voucherDiscount: number;
  guestCartToken: string | null;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  applyVoucher: (voucher: Voucher | null, discountAmount: number) => void;
  setGuestCartToken: (token: string | null) => void;

  // Computed getters
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: (shippingFee?: number) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [
        {
          id: 'demo-cart-item-1',
          productId: 1,
          productName: 'Trà Sữa Trân Châu Hoàng Kim',
          productImage: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80',
          variantId: 102,
          variantName: 'Size M',
          price: 55000,
          sugarLevel: '70%',
          iceLevel: '50%',
          toppings: [{ id: 1, tenTopping: 'Trân Châu Hoàng Kim', giaBan: 10000 }],
          quantity: 2,
          note: 'Cho ống hút to giúp em',
        },
      ],
      appliedVoucher: null,
      voucherDiscount: 0,
      guestCartToken: null,

      addItem: (newItem) => {
        const currentItems = get().items;
        // Compare item uniqueness (same productId, variantId, sugar, ice, toppings)
        const toppingIds = newItem.toppings.map((t) => t.id).sort().join(',');
        const existingIndex = currentItems.findIndex(
          (i) =>
            i.productId === newItem.productId &&
            i.variantId === newItem.variantId &&
            i.sugarLevel === newItem.sugarLevel &&
            i.iceLevel === newItem.iceLevel &&
            i.toppings.map((t) => t.id).sort().join(',') === toppingIds,
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += newItem.quantity;
          set({ items: updated });
        } else {
          const uniqueId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          set({ items: [...currentItems, { ...newItem, id: uniqueId }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, delta) => {
        const items = get().items;
        const target = items.find((i) => i.id === id);
        if (!target) return;

        const newQty = target.quantity + delta;
        if (newQty <= 0) {
          set({ items: items.filter((i) => i.id !== id) });
        } else {
          set({
            items: items.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)),
          });
        }
      },

      clearCart: () => set({ items: [], appliedVoucher: null, voucherDiscount: 0 }),

      applyVoucher: (voucher, discountAmount) => set({ appliedVoucher: voucher, voucherDiscount: discountAmount }),

      setGuestCartToken: (token) => set({ guestCartToken: token }),

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((acc, item) => {
          const toppingTotal = item.toppings.reduce((sum: number, t: SelectedTopping) => sum + t.giaBan, 0);
          return acc + (item.price + toppingTotal) * item.quantity;
        }, 0);
      },

      getTotal: (shippingFee = 0) => {
        const subtotal = get().getSubtotal();
        const discount = get().voucherDiscount;
        return Math.max(0, subtotal + shippingFee - discount);
      },
    }),
    {
      name: 'koithe-cart-storage',
    },
  ),
);
