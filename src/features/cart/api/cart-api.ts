import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/http-client';

export interface CartTopping {
  id: number;
  toppingId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CartItemDto {
  id: number;
  variantId: number;
  productName: string;
  size: string;
  quantity: number;
  sugarLevel?: string;
  iceLevel?: string;
  note?: string;
  toppings: CartTopping[];
  unitPrice: number;
  lineTotal: number;
}

export interface CartDto {
  id: number;
  cartToken: string | null;
  items: CartItemDto[];
  total: number;
}

export interface AddCartItemRequest {
  variantId: number;
  quantity: number;
  sugarLevel?: string;
  iceLevel?: string;
  note?: string;
  toppings?: { toppingId: number; quantity: number }[];
}

export interface UpdateCartItemRequest {
  quantity?: number;
  sugarLevel?: string;
  iceLevel?: string;
}

export const cartKeys = {
  current: ['cart', 'current'] as const,
};

export const cartApi = {
  getCurrent: () => api.get<CartDto>('/carts/current'),
  addItem: (data: AddCartItemRequest) => api.post<CartDto>('/carts/items', data),
  updateItem: (id: number, data: UpdateCartItemRequest) =>
    api.patch<CartDto>(`/carts/items/${id}`, data),
  removeItem: (id: number) => api.delete<void>(`/carts/items/${id}`),
  clear: () => api.delete<void>('/carts/current'),
};

export function useCurrentCart() {
  return useQuery({
    queryKey: cartKeys.current,
    queryFn: cartApi.getCurrent,
  });
}

export function useCartMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.current }),
  });
}
