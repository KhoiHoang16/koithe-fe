import { httpClient } from '@/shared/api/http-client';
import type { Category, Topping, Product, ProductFilterParams, ProductVariant } from '@/shared/types/catalog.types';
import type { PageResponse } from '@/shared/types/common.types';

interface BackendCategory {
  id: number;
  tenDanhMuc: string;
}

interface BackendTopping {
  id: number;
  tenTopping: string;
  giaBan: number;
  soLuongTon: number;
  conHang: boolean;
}

interface BackendVariant {
  id: number;
  maSanPham: number;
  kichCo: string;
  giaBan: number;
  soLuongTon: number;
  conHang: boolean;
}

interface BackendProduct {
  id: number;
  maDanhMuc: number;
  tenDanhMuc: string;
  tenSanPham: string;
  moTa?: string;
  hinhAnh?: string;
  noiBat: boolean;
  giaTu?: number;
}

type ProductWriteData = Partial<Product> & { danhMucId?: number; maDanhMuc?: number };

function mapCategory(category: BackendCategory): Category {
  return {
    id: category.id,
    tenDanhMuc: category.tenDanhMuc,
    thuTu: category.id,
    trangThai: true,
  };
}

function mapTopping(topping: BackendTopping): Topping {
  return {
    id: topping.id,
    tenTopping: topping.tenTopping,
    giaBan: Number(topping.giaBan),
    coSan: topping.conHang,
    trangThai: true,
  };
}

function mapVariant(variant: BackendVariant): ProductVariant {
  return {
    id: variant.id,
    tenBienThe: variant.kichCo,
    giaBan: Number(variant.giaBan),
    coSan: variant.conHang,
  };
}

function mapProduct(product: BackendProduct, bienTheList: ProductVariant[] = [], toppingList: Topping[] = []): Product {
  const priceFromVariants = bienTheList.length > 0
    ? Math.min(...bienTheList.map((variant) => variant.giaBan))
    : 0;
  return {
    id: product.id,
    maSanPham: String(product.id),
    tenSanPham: product.tenSanPham,
    moTa: product.moTa,
    hinhAnh: product.hinhAnh,
    giaTu: Number(product.giaTu ?? priceFromVariants),
    trangThai: bienTheList.length === 0 || bienTheList.some((variant) => variant.coSan),
    noiBat: product.noiBat,
    danhMucId: product.maDanhMuc,
    danhMucTen: product.tenDanhMuc,
    bienTheList,
    toppingList,
  };
}

function productWritePayload(data: ProductWriteData) {
  return {
    maDanhMuc: data.danhMucId ?? data.maDanhMuc,
    tenSanPham: data.tenSanPham,
    moTa: data.moTa,
    hinhAnh: data.hinhAnh,
    noiBat: data.noiBat ?? false,
  };
}

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = (await httpClient.get('/categories')) as unknown as BackendCategory[];
    return response.map(mapCategory);
  },

  getProducts: async (params?: ProductFilterParams): Promise<Product[]> => {
    const query = {
      categoryId: params?.danhMucId,
      keyword: params?.search,
      page: params?.page,
      size: params?.size,
      sort: params?.sort,
    };
    const response = (await httpClient.get('/products', { params: query })) as unknown as PageResponse<BackendProduct>;
    return response.content.map((product) => mapProduct(product));
  },

  getProductById: async (id: number): Promise<Product | null> => {
    const product = (await httpClient.get(`/products/${id}`)) as unknown as BackendProduct;
    const [variants, toppings] = await Promise.all([
      httpClient.get(`/products/${id}/variants`) as unknown as Promise<BackendVariant[]>,
      httpClient.get('/toppings') as unknown as Promise<BackendTopping[]>,
    ]);
    return mapProduct(product, variants.map(mapVariant), toppings.map(mapTopping));
  },

  getToppings: async (): Promise<Topping[]> => {
    const response = (await httpClient.get('/toppings')) as unknown as BackendTopping[];
    return response.map(mapTopping);
  },

  createProduct: async (data: ProductWriteData): Promise<Product> => {
    const product = (await httpClient.post('/products', productWritePayload(data))) as unknown as BackendProduct;
    return mapProduct(product);
  },

  updateProduct: async (id: number, data: ProductWriteData): Promise<Product> => {
    const product = (await httpClient.put(`/products/${id}`, productWritePayload(data))) as unknown as BackendProduct;
    return mapProduct(product);
  },

  deleteProduct: (id: number): Promise<void> => httpClient.delete(`/products/${id}`) as unknown as Promise<void>,

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const category = (await httpClient.post('/categories', { tenDanhMuc: data.tenDanhMuc })) as unknown as BackendCategory;
    return mapCategory(category);
  },

  deleteCategory: (id: number): Promise<void> => httpClient.delete(`/categories/${id}`) as unknown as Promise<void>,

  createTopping: async (data: Partial<Topping>): Promise<Topping> => {
    const topping = (await httpClient.post('/toppings', {
      tenTopping: data.tenTopping,
      giaBan: data.giaBan,
      soLuongTon: 0,
    })) as unknown as BackendTopping;
    return mapTopping(topping);
  },
};
