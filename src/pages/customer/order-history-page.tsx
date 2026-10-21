import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  Package,
  Coffee,
  CheckCircle2,
  XCircle,
  Sparkles,
  PhoneCall,
  Store,
  ArrowLeft,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import { orderApi } from '@/features/orders/api/order-api';
import { useCartStore } from '@/shared/stores/cart-store';
import type { OrderStatus } from '@/shared/types/order.types';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: 'bg-amber-50 text-amber-900 border-amber-300/80',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'bg-blue-50 text-blue-900 border-blue-300/80',
    icon: CheckCircle2,
  },
  PREPARING: {
    label: 'Đang pha chế',
    color: 'bg-purple-50 text-purple-900 border-purple-300/80',
    icon: Coffee,
  },
  SHIPPING: {
    label: 'Sẵn sàng nhận',
    color: 'bg-sky-50 text-sky-900 border-sky-300/80',
    icon: Store,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'bg-emerald-50 text-emerald-900 border-emerald-300/80',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-rose-50 text-rose-900 border-rose-300/80',
    icon: XCircle,
  },
};

const STATUS_TABS = [
  { id: 'ALL', label: 'Tất cả đơn hàng', icon: Package },
  { id: 'PREPARING', label: 'Đang pha chế', icon: Coffee },
  { id: 'COMPLETED', label: 'Đã hoàn thành', icon: CheckCircle2 },
] as const;

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [activeTab, setActiveTab] = useState<'ALL' | OrderStatus>('ALL');
  const [search, setSearch] = useState('');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<number, boolean>>({});

  const { data: orders, isLoading } = useQuery({
    queryKey: ['customer', 'orders'],
    queryFn: () => orderApi.getMyOrders(),
  });

  // Lọc danh sách đơn hàng
  const filteredOrders = (orders || []).filter((order) => {
    const matchStatus = activeTab === 'ALL' || order.trangThai === activeTab;
    const matchSearch =
      search.trim() === '' ||
      order.maDonHang.toLowerCase().includes(search.toLowerCase()) ||
      order.chiTietList.some((item) =>
        item.productName.toLowerCase().includes(search.toLowerCase()),
      );
    return matchStatus && matchSearch;
  });

  // Trạng thái mở rộng: Mặc định mở các đơn CHƯA hoàn thành/hủy, thu gọn các đơn đã xong
  const isOrderExpanded = (order: (typeof filteredOrders)[0]) => {
    if (expandedOrderIds[order.id] !== undefined) {
      return expandedOrderIds[order.id];
    }
    return order.trangThai !== 'COMPLETED' && order.trangThai !== 'CANCELLED';
  };

  const toggleExpand = (orderId: number, current: boolean) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !current,
    }));
  };

  // Xử lý đặt lại đơn này
  const handleReorder = async (order: (typeof filteredOrders)[0]) => {
    try {
      for (const item of order.chiTietList) {
        await addItem({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          variantId: item.variantId || item.id || 101,
          variantName: item.variantName || 'Size M',
          price: item.donGia,
          sugarLevel: item.duongLevel || '70%',
          iceLevel: item.daLevel || '50%',
          toppings: item.toppings || [],
          quantity: item.soLuong,
          note: item.ghiChu,
        });
      }
      toast.success(`Đã thêm ${order.chiTietList.length} món vào giỏ hàng!`);
      navigate('/cart');
    } catch {
      toast.error('Không thể thêm lại vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  if (isLoading) return <LoadingScreen message="Đang tải lịch sử đơn hàng..." />;

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed py-8 sm:py-12 animate-fade-in">
      <div className="container mx-auto px-4 max-w-6xl space-y-6 sm:space-y-8">
        {/* ============================================================== */}
        {/* HEADER TRANG (TINH GIẢN GỌN GÀNG)                             */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="text-stone-500 hover:text-stone-900 transition-colors p-1 -ml-1 rounded-lg hover:bg-white/60"
            title="Quay lại trang cá nhân"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            Lịch sử đơn hàng
          </h1>
        </div>

        {/* ============================================================== */}
        {/* MAIN 2-COLUMN LAYOUT                                           */}
        {/* CỘT TRÁI: BỘ LỌC CỐ ĐỊNH (STICKY SIDEBAR)                     */}
        {/* CỘT PHẢI: FEED DANH SÁCH ĐƠN HÀNG                             */}
        {/* ============================================================== */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* ============================================================ */}
          {/* CỘT TRÁI (STICKY SIDEBAR - BỘ LỌC ĐƠN HÀNG)                  */}
          {/* ============================================================ */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4 lg:sticky lg:top-24 self-start">
            <Card className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-5 shadow-sm space-y-5">
              {/* Tiêu đề bộ lọc */}
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm pb-2 border-b border-stone-100">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>Bộ lọc đơn hàng</span>
              </div>

              {/* Ô tìm kiếm mã đơn / tên món */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <Input
                    placeholder="Mã đơn hoặc tên món..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-8 h-10 text-xs rounded-xl border-stone-200 bg-stone-50/70 focus:bg-white"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-full"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Danh sách lọc trạng thái đơn (Dọc, chỉ phục vụ tại quầy) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                  Trạng thái đơn
                </label>
                <div className="space-y-1">
                  {STATUS_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? 'text-primary-foreground' : 'text-stone-500'
                          }`}
                        />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Thông tin hỗ trợ khách hàng */}
              <div className="pt-3 border-t border-stone-100 text-xs text-stone-500 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <PhoneCall className="h-3.5 w-3.5 text-primary" />
                  <span>Hỗ trợ tại quầy</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Hotline: <strong className="text-stone-900 font-bold">1900 636 123</strong>
                </p>
                <p className="text-[10px] text-stone-400">Giờ hoạt động: 08:30 – 22:00 hàng ngày</p>
              </div>
            </Card>
          </aside>

          {/* ============================================================ */}
          {/* CỘT PHẢI (FEED DANH SÁCH ĐƠN HÀNG)                           */}
          {/* ============================================================ */}
          <main className="flex-1 w-full space-y-4">
            {/* Nút xóa bộ lọc khi đang tìm kiếm hoặc lọc */}
            {(search || activeTab !== 'ALL') && (
              <div className="flex justify-end text-xs text-stone-500 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setActiveTab('ALL');
                  }}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Trạng thái danh sách rỗng */}
            {filteredOrders.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-10 shadow-sm text-center">
                <EmptyState
                  icon="📦"
                  title="Không tìm thấy đơn hàng nào"
                  description="Không có đơn hàng nào khớp với điều kiện lọc hoặc từ khóa tìm kiếm của bạn."
                  action={
                    <Button
                      size="sm"
                      onClick={() => {
                        setSearch('');
                        setActiveTab('ALL');
                      }}
                      className="mt-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
                    >
                      Xem tất cả đơn hàng
                    </Button>
                  }
                />
              </Card>
            ) : (
              /* Danh sách các đơn hàng */
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusInfo = STATUS_MAP[order.trangThai] || STATUS_MAP.PENDING;
                  const StatusIcon = statusInfo.icon;
                  const isExpanded = isOrderExpanded(order);

                  return (
                    <Card
                      key={order.id}
                      className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-5 sm:p-6 shadow-sm hover:border-stone-300 transition-all space-y-4"
                    >
                      {/* ==================================================== */}
                      {/* 1. HEADER ĐƠN HÀNG                                   */}
                      {/* ==================================================== */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono font-black text-sm sm:text-base text-stone-900">
                              #{order.maDonHang}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              <span>{statusInfo.label}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium text-stone-700">
                              <Store className="h-3.5 w-3.5 text-primary" />
                              <span>Phục vụ tại quầy</span>
                            </span>
                          </div>
                        </div>

                        {/* Bên phải: Phương thức thanh toán */}
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider block">
                            Thanh toán
                          </span>
                          <span className="text-xs font-bold text-stone-800">
                            {order.phuongThucThanhToan}
                          </span>
                        </div>
                      </div>

                      {/* ==================================================== */}
                      {/* TRẠNG THÁI THU GỌN: DÒNG TÓM TẮT MÓN VÀ TỔNG TIỀN     */}
                      {/* ==================================================== */}
                      {!isExpanded && (
                        <div
                          onClick={() => toggleExpand(order.id, isExpanded)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5 cursor-pointer group"
                        >
                          {/* Hàng ảnh thu nhỏ (Mini Thumbnails Stack) */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex -space-x-2 shrink-0">
                              {order.chiTietList.slice(0, 3).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="h-11 w-11 rounded-xl bg-[#F8F5F1] p-1 border-2 border-white shadow-2xs overflow-hidden flex items-center justify-center"
                                >
                                  {item.productImage ? (
                                    <img
                                      src={item.productImage}
                                      alt={item.productName}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-sm">🧋</span>
                                  )}
                                </div>
                              ))}
                              {order.chiTietList.length > 3 && (
                                <div className="h-11 w-11 rounded-xl bg-stone-100 border-2 border-white shadow-2xs flex items-center justify-center text-[10px] font-bold text-stone-600">
                                  +{order.chiTietList.length - 3}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-stone-800 truncate group-hover:text-primary transition-colors">
                                {order.chiTietList
                                  .map((i) => `${i.soLuong}x ${i.productName}`)
                                  .join(', ')}
                              </p>
                              <p className="text-[11px] text-stone-400">
                                Nhấn để xem chi tiết {order.chiTietList.length} món nước
                              </p>
                            </div>
                          </div>

                          {/* Tổng tiền & Nút Chi tiết đơn to bản (thay thế nút đặt lại) */}
                          <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-stone-400 block sm:inline mr-1">
                                Tổng tiền:
                              </span>
                              <span className="text-base font-extrabold text-primary">
                                {formatVND(order.tongThanhToan)}
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(order.id, isExpanded);
                              }}
                              className="h-9 px-4 rounded-xl text-xs font-semibold border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900 gap-1.5 cursor-pointer shadow-2xs transition-all"
                            >
                              <span>Chi tiết đơn</span>
                              <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* ==================================================== */}
                      {/* TRẠNG THÁI MỞ RỘNG: DANH SÁCH MÓN ĐẦY ĐỦ + FOOTER    */}
                      {/* ==================================================== */}
                      {isExpanded && (
                        <div className="space-y-4 pt-1 animate-fade-in">
                          {/* 2. DANH SÁCH MÓN NƯỚC (CHUẨN STYLE CARD BÊN GIỎ HÀNG) */}
                          <div className="space-y-3">
                            {order.chiTietList.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className="bg-[#FFFDF9] rounded-2xl border border-stone-200/80 p-3.5 sm:p-4 shadow-2xs hover:border-stone-300 transition-all"
                              >
                                <div className="flex gap-3.5 sm:gap-4 items-start">
                                  {/* Khung ảnh vuông sản phẩm bo tròn nền be `#F8F5F1` */}
                                  <div className="relative h-20 w-20 sm:h-22 sm:w-22 rounded-2xl bg-[#F8F5F1] p-1.5 shrink-0 flex items-center justify-center overflow-hidden border border-stone-100">
                                    {item.productImage ? (
                                      <img
                                        src={item.productImage}
                                        alt={item.productName}
                                        className="w-full h-full object-contain drop-shadow-xs"
                                      />
                                    ) : (
                                      <span className="text-3xl">🧋</span>
                                    )}
                                    {/* Badge kích cỡ góc dưới ảnh giống như bên giỏ hàng */}
                                    <span className="absolute bottom-1 left-1 bg-white/95 text-stone-800 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs border border-stone-200/60">
                                      {item.variantName || 'Size M'}
                                    </span>
                                  </div>

                                  {/* Thông tin món nước & các chip tùy chỉnh */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                                    <div>
                                      {/* Tên món nước */}
                                      <h3 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                                        {item.productName}
                                      </h3>

                                      {/* Dải chip tùy chỉnh: Size, Lượng Đường, Lượng Đá */}
                                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                        <span className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold px-2 py-0.5 rounded-md">
                                          {item.variantName || 'Size M'}
                                        </span>
                                        <span className="bg-stone-100 text-stone-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                                          Đường: {item.duongLevel || '70%'}
                                        </span>
                                        <span className="bg-stone-100 text-stone-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                                          Đá: {item.daLevel || '50%'}
                                        </span>
                                      </div>

                                      {/* Chip Toppings đi kèm (nếu có) */}
                                      {item.toppings && item.toppings.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                          {item.toppings.map((t) => (
                                            <span
                                              key={t.id}
                                              className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-md"
                                            >
                                              <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                                              <span>{t.tenTopping}</span>
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      {/* Lời dặn cho Barista (nếu có) */}
                                      {item.ghiChu && (
                                        <p className="text-[11px] text-stone-500 italic mt-1.5 bg-stone-50/80 px-2 py-1 rounded-md border border-stone-200/50">
                                          Lời dặn: "{item.ghiChu}"
                                        </p>
                                      )}
                                    </div>

                                    {/* Hàng hiển thị số lượng & giá tiền */}
                                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100/80">
                                      {/* Badge số lượng đơn hàng */}
                                      <span className="text-xs font-bold text-stone-700 bg-stone-100/90 px-2.5 py-1 rounded-lg">
                                        Số lượng: {item.soLuong}
                                      </span>

                                      {/* Giá tiền to bản + đơn giá */}
                                      <div className="text-right">
                                        <div className="text-base sm:text-lg font-extrabold text-primary">
                                          {formatVND(item.thanhTien)}
                                        </div>
                                        <div className="text-[10px] text-stone-400">
                                          {formatVND(item.donGia)} / món
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 3. FOOTER TỔNG TIỀN & CÁC NÚT HÀNH ĐỘNG */}
                          <div className="pt-3.5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Tóm tắt tài chính (Không có phí giao hàng) */}
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 text-xs text-stone-500">
                                <span>Tiền hàng: {formatVND(order.tongTienHang)}</span>
                                {order.giamGia > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-600 font-semibold">
                                      Giảm giá: -{formatVND(order.giamGia)}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-semibold text-stone-700">
                                  Tổng thanh toán:
                                </span>
                                <span className="text-lg sm:text-xl font-extrabold text-primary">
                                  {formatVND(order.tongThanhToan)}
                                </span>
                              </div>
                            </div>

                            {/* Các nút hành động: Đặt lại đơn sang trái, Thu gọn sang phải */}
                            <div className="flex items-center gap-2.5">
                              {/* Nút đặt lại đơn này (trái) */}
                              <Button
                                size="sm"
                                onClick={() => handleReorder(order)}
                                className="h-10 px-5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs cursor-pointer"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Đặt lại đơn này</span>
                              </Button>

                              {/* Nút thu gọn ở cuối danh sách món (phải) */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleExpand(order.id, isExpanded)}
                                className="h-10 px-4 rounded-xl text-xs font-semibold border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900 gap-1.5 cursor-pointer"
                              >
                                <ChevronDown className="h-3.5 w-3.5 rotate-180 text-stone-400" />
                                <span>Thu gọn</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
