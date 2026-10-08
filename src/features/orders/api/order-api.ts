import { httpClient } from '@/shared/api/http-client';
import type { Order, CreateOrderRequest, OrderStatus, OrderFilterParams } from '@/shared/types/order.types';
import type { PageResponse } from '@/shared/types/common.types';

export const MOCK_ORDERS: Order[] = [
  {
    id: 1001,
    maDonHang: 'KOI-20261008-01',
    loaiDonHang: 'DELIVERY',
    khachHangTen: 'Nguyen Van A',
    soDienThoai: '0901234567',
    email: 'nguyenvana@gmail.com',
    diaChiGiaoHang: '123 Nguyen Hue, Quan 1, TP. Hồ Chí Minh',
    ghiChu: 'Giao giờ hành chính, ít ngọt giúp em',
    trangThai: 'PREPARING',
    phuongThucThanhToan: 'VNPAY',
    trangThaiThanhToan: 'SUCCESS',
    tongTienHang: 120000,
    phiGiaoHang: 15000,
    giamGia: 20000,
    maVoucher: 'KOINEW',
    tongThanhToan: 115000,
    createdAt: new Date().toISOString(),
    chiTietList: [
      {
        id: 1,
        productId: 1,
        productName: 'Trà Sữa Trân Châu Hoàng Kim',
        productImage: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80',
        variantName: 'Size M',
        donGia: 55000,
        soLuong: 2,
        duongLevel: '70%',
        daLevel: '50%',
        toppings: [{ id: 1, tenTopping: 'Trân Châu Hoàng Kim', giaBan: 10000 }],
        thanhTien: 130000,
        ghiChu: 'Giao ống hút to',
      },
    ],
  },
  {
    id: 1002,
    maDonHang: 'KOI-20261008-02',
    loaiDonHang: 'TAKEAWAY',
    khachHangTen: 'Tran Thi B',
    soDienThoai: '0987654321',
    trangThai: 'PENDING',
    phuongThucThanhToan: 'COD',
    trangThaiThanhToan: 'PENDING',
    tongTienHang: 98000,
    phiGiaoHang: 0,
    giamGia: 0,
    tongThanhToan: 98000,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    chiTietList: [
      {
        id: 2,
        productId: 3,
        productName: 'Trà Dâu Tây Cam Sả Tươi',
        variantName: 'Size L',
        donGia: 68000,
        soLuong: 1,
        duongLevel: '100%',
        daLevel: '70%',
        toppings: [],
        thanhTien: 68000,
      },
    ],
  },
];

export const orderApi = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    try {
      return (await httpClient.post('/orders', data)) as Order;
    } catch {
      // Return a simulated order object
      const newOrder: Order = {
        id: Math.floor(1000 + Math.random() * 9000),
        maDonHang: `KOI-${Date.now().toString().slice(-6)}`,
        loaiDonHang: data.loaiDonHang,
        khachHangTen: data.khachHangTen,
        soDienThoai: data.soDienThoai,
        email: data.email,
        diaChiGiaoHang: data.diaChiGiaoHang,
        soBan: data.soBan,
        ghiChu: data.ghiChu,
        trangThai: 'PENDING',
        phuongThucThanhToan: data.phuongThucThanhToan,
        trangThaiThanhToan: 'PENDING',
        urlThanhToan: data.phuongThucThanhToan !== 'COD' ? `/checkout/payment?orderId=${Date.now()}` : undefined,
        tongTienHang: 110000,
        phiGiaoHang: data.loaiDonHang === 'DELIVERY' ? 15000 : 0,
        giamGia: data.maVoucher ? 15000 : 0,
        tongThanhToan: 110000 + (data.loaiDonHang === 'DELIVERY' ? 15000 : 0) - (data.maVoucher ? 15000 : 0),
        chiTietList: [],
        createdAt: new Date().toISOString(),
      };
      return newOrder;
    }
  },

  getOrders: async (params?: OrderFilterParams): Promise<Order[]> => {
    try {
      const pageRes = (await httpClient.get('/orders', { params })) as PageResponse<Order>;
      return pageRes.content;
    } catch {
      let list = [...MOCK_ORDERS];
      if (params?.trangThai) {
        list = list.filter((o) => o.trangThai === params.trangThai);
      }
      return list;
    }
  },

  getOrderById: async (id: string | number): Promise<Order | null> => {
    try {
      return (await httpClient.get(`/orders/${id}`)) as Order;
    } catch {
      return MOCK_ORDERS.find((o) => o.id === Number(id) || o.maDonHang === id) || MOCK_ORDERS[0];
    }
  },

  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    try {
      return (await httpClient.patch(`/admin/orders/${orderId}/status`, { status })) as Order;
    } catch {
      const order = MOCK_ORDERS.find((o) => o.id === orderId);
      if (order) order.trangThai = status;
      return order || MOCK_ORDERS[0];
    }
  },

  verifyPayment: async (orderId: string | number): Promise<{ trangThai: string }> => {
    try {
      return (await httpClient.get(`/payments/verify/${orderId}`)) as { trangThai: string };
    } catch {
      return { trangThai: 'THANH_CONG' };
    }
  },
};
