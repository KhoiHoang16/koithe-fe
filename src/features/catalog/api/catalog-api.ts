import { httpClient } from '@/shared/api/http-client';
import type { Category, Topping, Product, ProductFilterParams } from '@/shared/types/catalog.types';
import type { PageResponse } from '@/shared/types/common.types';

// ============================================================
// MOCK DATA FALLBACK (Khi backend offline hoặc dev UI)
// ============================================================
export const MOCK_TOPPINGS: Topping[] = [
  { id: 1, tenTopping: 'Trân Châu Hoàng Kim', giaBan: 10000, coSan: true, trangThai: true },
  { id: 2, tenTopping: 'Trân Châu Sương Mai', giaBan: 10000, coSan: true, trangThai: true },
  { id: 3, tenTopping: 'Pudding Trứng', giaBan: 12000, coSan: true, trangThai: true },
  { id: 4, tenTopping: 'Thạch Trái Cây', giaBan: 10000, coSan: true, trangThai: true },
  { id: 5, tenTopping: 'Kem Cheese Hoàng Gia', giaBan: 15000, coSan: true, trangThai: true },
  { id: 6, tenTopping: 'Thạch Đen Dừa', giaBan: 8000, coSan: true, trangThai: true },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, tenDanhMuc: 'Trà Sữa Đặc Biệt', moTa: 'Dòng trà sữa béo ngậy chuẩn vị Koi Thé', thuTu: 1, trangThai: true, soLuongSanPham: 8 },
  { id: 2, tenDanhMuc: 'Trà Trái Cây Tươi', moTa: 'Giải nhiệt cực đã với hoa quả tự nhiên', thuTu: 2, trangThai: true, soLuongSanPham: 6 },
  { id: 3, tenDanhMuc: 'Cà Phê Phin & Espresso', moTa: 'Cà phê rang xay nguyên chất đậm đà', thuTu: 3, trangThai: true, soLuongSanPham: 5 },
  { id: 4, tenDanhMuc: 'Machiato & Cream', moTa: 'Lớp kem béo mịn quyến rũ trên nền trà thơm', thuTu: 4, trangThai: true, soLuongSanPham: 4 },
  { id: 5, tenDanhMuc: 'Đá Xay & Smoothie', moTa: 'Xay cùng trái cây & sữa chua mát lạnh', thuTu: 5, trangThai: true, soLuongSanPham: 4 },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    maSanPham: 'TS-001',
    tenSanPham: 'Trà Sữa Trân Châu Hoàng Kim',
    moTa: 'Hương vị trà đen Assam thượng hạng hòa quyện cùng sữa tươi béo ngậy và trân châu hoàng kim dai giòn.',
    hinhAnh: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80',
    giaTu: 45000,
    trangThai: true,
    noiBat: true,
    danhMucId: 1,
    danhMucTen: 'Trà Sữa Đặc Biệt',
    danhGiaTrungBinh: 4.9,
    soLuotDanhGia: 320,
    soLuongBan: 1420,
    bienTheList: [
      { id: 101, tenBienThe: 'Size S', giaBan: 45000, coSan: true },
      { id: 102, tenBienThe: 'Size M', giaBan: 55000, coSan: true },
      { id: 103, tenBienThe: 'Size L', giaBan: 65000, coSan: true },
    ],
    toppingList: MOCK_TOPPINGS,
  },
  {
    id: 2,
    maSanPham: 'TS-002',
    tenSanPham: 'Trà Xanh Machiato Kem Cheese',
    moTa: 'Trà xanh nhài thanh mát phủ lớp kem cheese phô mai béo ngậy mặn mặn đậm vị.',
    hinhAnh: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    giaTu: 50000,
    trangThai: true,
    noiBat: true,
    danhMucId: 4,
    danhMucTen: 'Machiato & Cream',
    danhGiaTrungBinh: 4.8,
    soLuotDanhGia: 210,
    soLuongBan: 980,
    bienTheList: [
      { id: 201, tenBienThe: 'Size S', giaBan: 50000, coSan: true },
      { id: 202, tenBienThe: 'Size M', giaBan: 60000, coSan: true },
      { id: 203, tenBienThe: 'Size L', giaBan: 70000, coSan: true },
    ],
    toppingList: MOCK_TOPPINGS,
  },
  {
    id: 3,
    maSanPham: 'TC-001',
    tenSanPham: 'Trà Dâu Tây Cam Sả Tươi',
    moTa: 'Hương vị chua ngọt bùng nổ từ dâu tây tươi hòa quyện cùng tép cam vàng tươi và hương sả nồng nàn.',
    hinhAnh: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    giaTu: 48000,
    trangThai: true,
    noiBat: true,
    danhMucId: 2,
    danhMucTen: 'Trà Trái Cây Tươi',
    danhGiaTrungBinh: 4.7,
    soLuotDanhGia: 180,
    soLuongBan: 750,
    bienTheList: [
      { id: 301, tenBienThe: 'Size S', giaBan: 48000, coSan: true },
      { id: 302, tenBienThe: 'Size M', giaBan: 58000, coSan: true },
      { id: 303, tenBienThe: 'Size L', giaBan: 68000, coSan: true },
    ],
    toppingList: MOCK_TOPPINGS,
  },
  {
    id: 4,
    maSanPham: 'CP-001',
    tenSanPham: 'Cà Phê Muối Kem Béo KOI',
    moTa: 'Sự kết hợp hoàn hảo giữa cà phê phin nguyên chất đậm vị và lớp màng kem muối biển ngậy thơm.',
    hinhAnh: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    giaTu: 39000,
    trangThai: true,
    noiBat: true,
    danhMucId: 3,
    danhMucTen: 'Cà Phê Phin & Espresso',
    danhGiaTrungBinh: 4.9,
    soLuotDanhGia: 410,
    soLuongBan: 2100,
    bienTheList: [
      { id: 401, tenBienThe: 'Size S', giaBan: 39000, coSan: true },
      { id: 402, tenBienThe: 'Size M', giaBan: 49000, coSan: true },
      { id: 403, tenBienThe: 'Size L', giaBan: 59000, coSan: true },
    ],
    toppingList: MOCK_TOPPINGS,
  },
  {
    id: 5,
    maSanPham: 'DX-001',
    tenSanPham: 'Smoothie Xoài Sữa Chua Tuyết',
    moTa: 'Xoài chín mọng xay đá tuyết mát lạnh cùng sữa chua lên men tự nhiên bổ dưỡng.',
    hinhAnh: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
    giaTu: 55000,
    trangThai: true,
    noiBat: false,
    danhMucId: 5,
    danhMucTen: 'Đá Xay & Smoothie',
    danhGiaTrungBinh: 4.6,
    soLuotDanhGia: 95,
    soLuongBan: 430,
    bienTheList: [
      { id: 501, tenBienThe: 'Size S', giaBan: 55000, coSan: true },
      { id: 502, tenBienThe: 'Size M', giaBan: 65000, coSan: true },
      { id: 503, tenBienThe: 'Size L', giaBan: 75000, coSan: true },
    ],
    toppingList: MOCK_TOPPINGS,
  },
  {
    id: 6,
    maSanPham: 'TS-003',
    tenSanPham: 'Trà Sữa Oolong Nướng Pudding',
    moTa: 'Lá trà Oolong nướng thơm lừng kết hợp pudding trứng mềm mịn tan chảy trong miệng.',
    hinhAnh: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80',
    giaTu: 49000,
    trangThai: true,
    noiBat: false,
    danhMucId: 1,
    danhMucTen: 'Trà Sữa Đặc Biệt',
    danhGiaTrungBinh: 4.8,
    soLuotDanhGia: 160,
    soLuongBan: 820,
    bienTheList: [
      { id: 601, tenBienThe: 'Size S', giaBan: 49000, coSan: true },
      { id: 602, tenBienThe: 'Size M', giaBan: 59000, coSan: true },
      { id: 603, tenBienThe: 'Size L', giaBan: 69000, coSan: true },
    ],
    toppingList: MOCK_TOPPINGS,
  },
];

// ============================================================
// CATALOG API SERVICE (Tự động fallback mock nếu API 404/offline)
// ============================================================
export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    try {
      return (await httpClient.get('/catalog/categories')) as Category[];
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  getProducts: async (params?: ProductFilterParams): Promise<Product[]> => {
    try {
      const pageRes = (await httpClient.get('/catalog/products', { params })) as PageResponse<Product>;
      return pageRes.content;
    } catch {
      let list = [...MOCK_PRODUCTS];
      if (params?.danhMucId) {
        list = list.filter((p) => p.danhMucId === params.danhMucId);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter((p) => p.tenSanPham.toLowerCase().includes(q) || p.maSanPham.toLowerCase().includes(q));
      }
      if (params?.noiBat) {
        list = list.filter((p) => p.noiBat);
      }
      return list;
    }
  },

  getProductById: async (id: number): Promise<Product | null> => {
    try {
      return (await httpClient.get(`/catalog/products/${id}`)) as Product;
    } catch {
      return MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
    }
  },

  getToppings: async (): Promise<Topping[]> => {
    try {
      return (await httpClient.get('/catalog/toppings')) as Topping[];
    } catch {
      return MOCK_TOPPINGS;
    }
  },

  // ADMIN OPERATIONS
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    return (await httpClient.post('/admin/products', data)) as Product;
  },

  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    return (await httpClient.put(`/admin/products/${id}`, data)) as Product;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await httpClient.delete(`/admin/products/${id}`);
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    return (await httpClient.post('/admin/categories', data)) as Category;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await httpClient.delete(`/admin/categories/${id}`);
  },

  createTopping: async (data: Partial<Topping>): Promise<Topping> => {
    return (await httpClient.post('/admin/toppings', data)) as Topping;
  },
};
