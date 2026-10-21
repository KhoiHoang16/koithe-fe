// ============================================================
// ORDER TYPES - CartItem, Order, OrderDetail, Payment, Tracking
// ============================================================

export interface SelectedTopping {
  id: number;
  tenTopping: string;
  giaBan: number;
}

export interface CartItem {
  id: string; // Unique cart item identifier (hash/uuid or timestamp)
  productId: number;
  productName: string;
  productImage?: string;
  variantId: number;
  variantName: string; // e.g., "Size M"
  price: number; // Base price + variant price increment
  sugarLevel: string; // "0%", "30%", "50%", "70%", "100%"
  iceLevel: string; // "0%", "30%", "50%", "70%", "100%"
  toppings: SelectedTopping[];
  quantity: number;
  note?: string;
}

export type OrderType = 'DELIVERY' | 'TAKEAWAY' | 'AT_TABLE';

export type OrderStatus =
  | 'PENDING' // Chờ xác nhận
  | 'CONFIRMED' // Đã xác nhận
  | 'PREPARING' // Đang pha chế
  | 'SHIPPING' // Đang giao
  | 'COMPLETED' // Hoàn thành
  | 'CANCELLED'; // Đã hủy

export type PaymentMethod = 'COD' | 'VNPAY' | 'MOMO' | 'BANK_TRANSFER';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface OrderDetailItem {
  id?: number;
  productId: number;
  productName: string;
  productImage?: string;
  variantId?: number;
  variantName: string;
  donGia: number;
  soLuong: number;
  duongLevel: string;
  daLevel: string;
  toppings: SelectedTopping[];
  thanhTien: number;
  ghiChu?: string;
}

export interface Order {
  id: number;
  maDonHang: string;
  loaiDonHang: OrderType;
  khachHangTen: string;
  soDienThoai: string;
  email?: string;
  diaChiGiaoHang?: string;
  soBan?: string;
  ghiChu?: string;
  trangThai: OrderStatus;
  phuongThucThanhToan: PaymentMethod;
  trangThaiThanhToan: PaymentStatus;
  maGiaoDichThanhToan?: string;
  urlThanhToan?: string;
  tongTienHang: number;
  phiGiaoHang: number;
  giamGia: number;
  maVoucher?: string;
  tongThanhToan: number;
  chiTietList: OrderDetailItem[];
  createdAt: string;
  updatedAt?: string;
}

export type ServiceType = 'TAI_CHO' | 'MANG_VE' | 'GIAO_HANG';

export type OrderChannel = 'WEBSITE' | 'UNG_DUNG_APP' | 'QUET_QR_BAN' | 'TAI_QUAY_POS';

export interface CreateOrderRequest {
  cartToken?: string | null;
  customerId?: number;
  serviceType: ServiceType;
  channel: OrderChannel;
  tableId?: number;
  tenNguoiNhan?: string;
  soDienThoaiNguoiNhan?: string;
  diaChiGiaoHang?: string;
}

export interface OrderStatusHistory {
  trangThai: OrderStatus;
  thoiGian: string;
  ghiChu?: string;
}

export interface OrderFilterParams {
  trangThai?: OrderStatus;
  loaiDonHang?: OrderType;
  phuongThucThanhToan?: PaymentMethod;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
