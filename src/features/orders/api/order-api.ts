import { httpClient } from '@/shared/api/http-client';
import type {
  Order,
  CreateOrderRequest,
  OrderStatus,
  OrderFilterParams,
  OrderDetailItem,
  SelectedTopping,
} from '@/shared/types/order.types';
import type { PageResponse } from '@/shared/types/common.types';

interface BackendOrderTopping {
  id: number;
  toppingId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface BackendOrderItem {
  id: number;
  variantId: number;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sugarLevel?: string;
  iceLevel?: string;
  note?: string;
  toppings: BackendOrderTopping[];
}

interface BackendOrder {
  id: number;
  displayCode: string;
  status: string;
  channel: string;
  serviceType: string;
  customerId?: number;
  cashierId?: number;
  shiftId?: number;
  tableId?: number;
  tenNguoiNhan?: string;
  soDienThoaiNguoiNhan?: string;
  diaChiGiaoHang?: string;
  merchandiseTotal: number;
  discount: number;
  payableTotal: number;
  createdAt: string;
  items: BackendOrderItem[];
}

const STATUS_TO_UI: Record<string, OrderStatus> = {
  CHO_XAC_NHAN: 'PENDING',
  DA_THANH_TOAN: 'CONFIRMED',
  DANG_PHA_CHE: 'PREPARING',
  SAN_SANG: 'SHIPPING',
  HOAN_THANH: 'COMPLETED',
  DA_HUY: 'CANCELLED',
};

const UI_TO_STATUS: Record<OrderStatus, string> = {
  PENDING: 'CHO_XAC_NHAN',
  CONFIRMED: 'DA_THANH_TOAN',
  PREPARING: 'DANG_PHA_CHE',
  SHIPPING: 'SAN_SANG',
  COMPLETED: 'HOAN_THANH',
  CANCELLED: 'DA_HUY',
};

const SERVICE_TO_UI: Record<string, Order['loaiDonHang']> = {
  TAI_CHO: 'AT_TABLE',
  MANG_VE: 'TAKEAWAY',
  GIAO_HANG: 'DELIVERY',
};

function mapTopping(topping: BackendOrderTopping): SelectedTopping {
  return {
    id: topping.toppingId,
    tenTopping: topping.name,
    giaBan: Number(topping.unitPrice),
  };
}

function mapOrderItem(item: BackendOrderItem): OrderDetailItem {
  return {
    id: item.id,
    productId: item.variantId,
    productName: item.productName,
    variantId: item.variantId,
    variantName: item.size,
    donGia: Number(item.unitPrice),
    soLuong: item.quantity,
    duongLevel: item.sugarLevel ?? '70%',
    daLevel: item.iceLevel ?? '50%',
    toppings: item.toppings.map(mapTopping),
    thanhTien: Number(item.lineTotal),
    ghiChu: item.note,
  };
}

function mapOrder(order: BackendOrder): Order {
  const isPaid = order.status !== 'CHO_XAC_NHAN' && order.status !== 'DA_HUY';
  return {
    id: order.id,
    maDonHang: order.displayCode,
    loaiDonHang: SERVICE_TO_UI[order.serviceType] ?? 'TAKEAWAY',
    khachHangTen: order.tenNguoiNhan ?? '',
    soDienThoai: order.soDienThoaiNguoiNhan ?? '',
    diaChiGiaoHang: order.diaChiGiaoHang,
    soBan: order.tableId != null ? String(order.tableId) : undefined,
    trangThai: STATUS_TO_UI[order.status] ?? 'PENDING',
    phuongThucThanhToan: 'COD',
    trangThaiThanhToan: isPaid ? 'SUCCESS' : 'PENDING',
    tongTienHang: Number(order.merchandiseTotal),
    phiGiaoHang: 0,
    giamGia: Number(order.discount),
    tongThanhToan: Number(order.payableTotal),
    chiTietList: order.items.map(mapOrderItem),
    createdAt: order.createdAt,
  };
}

function pageToOrders(response: PageResponse<BackendOrder>): Order[] {
  return response.content.map(mapOrder);
}

export const orderApi = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const order = (await httpClient.post('/orders', data)) as unknown as BackendOrder;
    return mapOrder(order);
  },

  getOrders: async (params?: OrderFilterParams): Promise<Order[]> => {
    const query = {
      status: params?.trangThai ? UI_TO_STATUS[params.trangThai] : undefined,
      channel: params?.loaiDonHang ? String(params.loaiDonHang) : undefined,
      page: params?.page,
      size: params?.size,
    };
    const response = (await httpClient.get('/orders', { params: query })) as unknown as PageResponse<BackendOrder>;
    return pageToOrders(response);
  },

  getMyOrders: async (params?: OrderFilterParams): Promise<Order[]> => {
    const query = { page: params?.page, size: params?.size };
    const response = (await httpClient.get('/orders/my', { params: query })) as unknown as PageResponse<BackendOrder>;
    return pageToOrders(response);
  },

  getOrderById: async (id: string | number): Promise<Order | null> => {
    const order = (await httpClient.get(`/orders/${id}`)) as unknown as BackendOrder;
    return mapOrder(order);
  },

  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    const order = (await httpClient.patch(`/orders/${orderId}/status`, {
      status: UI_TO_STATUS[status],
    })) as unknown as BackendOrder;
    return mapOrder(order);
  },

  verifyPayment: async (orderId: string | number): Promise<{ trangThai: string }> => {
    const order = (await httpClient.get(`/orders/${orderId}`)) as unknown as BackendOrder;
    const paid = order.status !== 'CHO_XAC_NHAN' && order.status !== 'DA_HUY';
    return { trangThai: paid ? 'THANH_CONG' : 'CHO_XU_LY' };
  },
};
