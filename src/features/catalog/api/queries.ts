import { useQuery } from '@tanstack/react-query';
import { catalogApi } from './catalog-api';
import type { ProductFilterParams } from '@/shared/types/catalog.types';

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  products: (params?: ProductFilterParams) => [...catalogKeys.all, 'products', params] as const,
  productDetail: (id: number) => [...catalogKeys.all, 'productDetail', id] as const,
  toppings: () => [...catalogKeys.all, 'toppings'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogApi.getCategories(),
  });
}

export function useProducts(params?: ProductFilterParams) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogApi.getProducts(params),
  });
}

export function useProductDetail(id: number) {
  return useQuery({
    queryKey: catalogKeys.productDetail(id),
    queryFn: () => catalogApi.getProductById(id),
    enabled: !!id,
  });
}

export function useToppings() {
  return useQuery({
    queryKey: catalogKeys.toppings(),
    queryFn: () => catalogApi.getToppings(),
  });
}
