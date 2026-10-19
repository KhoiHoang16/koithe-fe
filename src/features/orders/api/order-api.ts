import { httpClient } from '@/shared/api/http-client';
import type { Order, CreateOrderRequest, OrderStatus, OrderFilterParams } from '@/shared/types/order.types';
import type { PageResponse } from '@/shared/types/common.types';

export const MOCK_ORDERS: Order[] = [
  {
    id: 1001,
    maDonHang: 'KOI-20261019-01',
    loaiDonHang: 'TAKEAWAY',
    khachHangTen: 'Nguyen Van A',
    soDienThoai: '0901234567',
    email: 'nguyenvana@gmail.com',
    ghiChu: 'Lấy tại quầy chi nhánh Nguyễn Huệ',
    trangThai: 'COMPLETED',
    phuongThucThanhToan: 'VNPAY',
    trangThaiThanhToan: 'SUCCESS',
    tongTienHang: 140000,
    phiGiaoHang: 0,
    giamGia: 0,
    tongThanhToan: 140000,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    chiTietList: [
      {
        id: 1,
        productId: 1,
        productName: 'Trà Sữa Trân Châu Hoàng Kim',
        productImage: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80',
        variantName: 'Size S',
        donGia: 45000,
        soLuong: 2,
        duongLevel: '70%',
        daLevel: '50%',
        toppings: [{ id: 1, tenTopping: 'Trân Châu Hoàng Kim', giaBan: 10000 }],
        thanhTien: 90000,
      },
      {
        id: 2,
        productId: 2,
        productName: 'Trà Xanh Machiato Kem Cheese',
        productImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
        variantName: 'Size S',
        donGia: 50000,
        soLuong: 1,
        duongLevel: '70%',
        daLevel: '50%',
        toppings: [],
        thanhTien: 50000,
      },
    ],
  },
  {
    id: 1002,
    maDonHang: 'KOI-20261019-02',
    loaiDonHang: 'TAKEAWAY',
    khachHangTen: 'Nguyen Van A',
    soDienThoai: '0901234567',
    trangThai: 'PREPARING',
    phuongThucThanhToan: 'MOMO',
    trangThaiThanhToan: 'SUCCESS',
    tongTienHang: 125000,
    phiGiaoHang: 0,
    giamGia: 15000,
    maVoucher: 'KOINEW',
    tongThanhToan: 110000,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    chiTietList: [
      {
        id: 3,
        productId: 3,
        productName: 'Trà Dâu Tây Cam Sả Tươi',
        productImage: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
        variantName: 'Size L',
        donGia: 65000,
        soLuong: 1,
        duongLevel: '100%',
        daLevel: '70%',
        toppings: [{ id: 3, tenTopping: 'Thạch Trái Cây', giaBan: 10000 }],
        thanhTien: 75000,
      },
      {
        id: 4,
        productId: 4,
        productName: 'Trà Ô Long Macchiato',
        productImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
        variantName: 'Size M',
        donGia: 50000,
        soLuong: 1,
        duongLevel: '50%',
        daLevel: '50%',
        toppings: [],
        thanhTien: 50000,
      },
    ],
  },
  {
    id: 1003,
    maDonHang: 'KOI-20261019-03',
    loaiDonHang: 'TAKEAWAY',
    khachHangTen: 'Nguyen Van A',
    soDienThoai: '0901234567',
    trangThai: 'COMPLETED',
    phuongThucThanhToan: 'COD',
    trangThaiThanhToan: 'SUCCESS',
    tongTienHang: 65000,
    phiGiaoHang: 0,
    giamGia: 0,
    tongThanhToan: 65000,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    chiTietList: [
      {
        id: 5,
        productId: 5,
        productName: 'Trà Sữa Khoai Môn Tươi Dẻo',
        productImage: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80',
        variantName: 'Size M',
        donGia: 55000,
        soLuong: 1,
        duongLevel: '70%',
        daLevel: '70%',
        toppings: [{ id: 2, tenTopping: 'Pudding Trứng', giaBan: 10000 }],
        thanhTien: 65000,
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
