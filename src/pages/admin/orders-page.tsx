import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Eye,
  Printer,
  User,
  Store,
  FileText,
  ShoppingBag,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { orderApi } from '@/features/orders/api/order-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import { exportToExcel } from '@/shared/libs/excel-helper';
import {
  AdvancedSearchModal,
  ActiveFilterBadges,
} from '@/shared/components/search/advanced-search-modal';
import { evaluateAdvancedFilter } from '@/shared/components/search/advanced-search-evaluator';
import type {
  AdvancedSearchFilter,
  FieldDefinition,
} from '@/shared/components/search/advanced-search-types';
import type { OrderStatus, Order } from '@/shared/types/order.types';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const STATUS_OPTIONS: { id: OrderStatus | 'ALL'; label: string; color?: string }[] = [
  { id: 'ALL', label: 'Tất cả đơn' },
  { id: 'PENDING', label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  { id: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { id: 'PREPARING', label: 'Đang pha chế', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  { id: 'SHIPPING', label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  { id: 'COMPLETED', label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  { id: 'CANCELLED', label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
];

const ORDER_SEARCH_FIELDS: FieldDefinition[] = [
  { id: 'tongThanhToan', label: 'Tổng thanh toán (VNĐ)', type: 'number' },
  { id: 'khachHangTen', label: 'Tên khách hàng', type: 'string' },
  { id: 'soDienThoai', label: 'Số điện thoại', type: 'string' },
  { id: 'maDonHang', label: 'Mã đơn hàng', type: 'string' },
  {
    id: 'loaiDonHang',
    label: 'Hình thức phục vụ',
    type: 'select',
    options: [
      { label: 'Giao hàng tận nơi (DELIVERY)', value: 'DELIVERY' },
      { label: 'Đến lấy tại quán (TAKEAWAY)', value: 'TAKEAWAY' },
      { label: 'Phục vụ tại bàn (AT_TABLE)', value: 'AT_TABLE' },
    ],
  },
  {
    id: 'trangThai',
    label: 'Trạng thái đơn hàng',
    type: 'select',
    options: [
      { label: 'Chờ xác nhận (PENDING)', value: 'PENDING' },
      { label: 'Đã xác nhận (CONFIRMED)', value: 'CONFIRMED' },
      { label: 'Đang pha chế (PREPARING)', value: 'PREPARING' },
      { label: 'Đang giao / Sẵn sàng (SHIPPING)', value: 'SHIPPING' },
      { label: 'Hoàn thành (COMPLETED)', value: 'COMPLETED' },
      { label: 'Đã hủy (CANCELLED)', value: 'CANCELLED' },
    ],
  },
  {
    id: 'trangThaiThanhToan',
    label: 'Trạng thái thanh toán',
    type: 'select',
    options: [
      { label: 'Đã thanh toán (SUCCESS)', value: 'SUCCESS' },
      { label: 'Chưa thanh toán (PENDING)', value: 'PENDING' },
    ],
  },
  { id: 'createdAt', label: 'Ngày đặt hàng', type: 'date' },
];

const ORDER_PRESETS = [
  {
    name: 'Đơn > 100.000₫ & Hoàn thành',
    filter: {
      combiner: 'AND' as const,
      rules: [
        {
          id: 'p1',
          field: 'tongThanhToan',
          operator: 'GREATER_THAN' as const,
          value: '100000',
        },
        {
          id: 'p2',
          field: 'trangThai',
          operator: 'EQUALS' as const,
          value: 'COMPLETED',
        },
      ],
    },
  },
  {
    name: 'Đơn giao hàng HOẶC Mang đi',
    filter: {
      combiner: 'OR' as const,
      rules: [
        {
          id: 'p3',
          field: 'loaiDonHang',
          operator: 'EQUALS' as const,
          value: 'DELIVERY',
        },
        {
          id: 'p4',
          field: 'loaiDonHang',
          operator: 'EQUALS' as const,
          value: 'TAKEAWAY',
        },
      ],
    },
  },
  {
    name: 'Đơn chưa thanh toán (NOT SUCCESS)',
    filter: {
      combiner: 'AND' as const,
      rules: [
        {
          id: 'p5',
          field: 'trangThaiThanhToan',
          operator: 'EQUALS' as const,
          value: 'SUCCESS',
          isNot: true, // NOT EQUALS SUCCESS
        },
      ],
    },
  },
];

export function OrdersPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Advanced search state
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [advancedFilter, setAdvancedFilter] = useState<AdvancedSearchFilter | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => orderApi.getOrders(),
    refetchInterval: 15000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      orderApi.updateOrderStatus(orderId, status),
    onSuccess: (updated) => {
      toast.success(`Đã cập nhật trạng thái đơn ${updated.maDonHang}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });

  // Áp dụng bộ lọc kết hợp: Quick search + Status tab + Advanced Search Filter (Toán tử >, <, =, AND, OR, NOT)
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      // Status tab
      const matchStatus = selectedStatus === 'ALL' || o.trangThai === selectedStatus;

      // Text search
      const kw = search.trim().toLowerCase();
      const matchSearch =
        !kw ||
        o.maDonHang.toLowerCase().includes(kw) ||
        o.soDienThoai.includes(kw) ||
        o.khachHangTen.toLowerCase().includes(kw);

      // Advanced Search Filter (AND / OR / NOT)
      const matchAdvanced = evaluateAdvancedFilter(o, advancedFilter);

      return matchStatus && matchSearch && matchAdvanced;
    });
  }, [orders, selectedStatus, search, advancedFilter]);

  // Tự động chọn đơn hàng đầu tiên
  useEffect(() => {
    if (filteredOrders.length === 0) {
      setSelectedOrderId(null);
      return;
    }
    if (selectedOrderId === null || !filteredOrders.some((o) => o.id === selectedOrderId)) {
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedOrderId]);

  const selectedOrder = filteredOrders.find((o) => o.id === selectedOrderId) || null;

  // Xuất file Excel danh sách hóa đơn hiện tại
  const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
      toast.error('Không có dữ liệu hóa đơn để xuất Excel');
      return;
    }

    try {
      exportToExcel<Order>({
        filename: `DanhSach_HoaDon_KOITHE_${new Date().toISOString().slice(0, 10)}`,
        sheetName: 'Hóa đơn',
        data: filteredOrders,
        columns: [
          { header: 'Mã đơn hàng', key: 'maDonHang', width: 16 },
          { header: 'Khách hàng', key: 'khachHangTen', width: 22, format: (v) => v || 'Khách lẻ' },
          { header: 'Số điện thoại', key: 'soDienThoai', width: 15 },
          {
            header: 'Hình thức',
            key: 'loaiDonHang',
            width: 16,
            format: (v) => (v === 'DELIVERY' ? 'Giao hàng' : v === 'TAKEAWAY' ? 'Mang đi' : 'Tại bàn'),
          },
          {
            header: 'Trạng thái đơn',
            key: 'trangThai',
            width: 18,
            format: (v) => STATUS_OPTIONS.find((s) => s.id === v)?.label || v,
          },
          {
            header: 'Thanh toán',
            key: 'phuongThucThanhToan',
            width: 15,
          },
          {
            header: 'TT Thanh toán',
            key: 'trangThaiThanhToan',
            width: 16,
            format: (v) => (v === 'SUCCESS' ? 'Đã thanh toán' : 'Chưa thanh toán'),
          },
          {
            header: 'Tiền hàng (₫)',
            key: 'tongTienHang',
            width: 15,
            format: (v) => Number(v || 0),
          },
          {
            header: 'Giảm giá (₫)',
            key: 'giamGia',
            width: 15,
            format: (v) => Number(v || 0),
          },
          {
            header: 'Tổng thanh toán (₫)',
            key: 'tongThanhToan',
            width: 20,
            format: (v) => Number(v || 0),
          },
          {
            header: 'Ngày tạo',
            key: 'createdAt',
            width: 20,
            format: (v) => (v ? new Date(v).toLocaleString('vi-VN') : ''),
          },
          {
            header: 'Địa chỉ nhận',
            key: 'diaChiGiaoHang',
            width: 30,
            format: (v) => v || '',
          },
        ],
      });

      toast.success(`Đã xuất thành công ${filteredOrders.length} hóa đơn ra file Excel!`);
    } catch {
      toast.error('Có lỗi xảy ra khi tạo file Excel');
    }
  };

  const handleRemoveRule = (ruleId: string) => {
    if (!advancedFilter) return;
    const remaining = advancedFilter.rules.filter((r) => r.id !== ruleId);
    if (remaining.length === 0) {
      setAdvancedFilter(null);
    } else {
      setAdvancedFilter({ ...advancedFilter, rules: remaining });
    }
  };

  if (isLoading) return <LoadingScreen message="Đang tải danh sách đơn hàng..." />;

  // Tính tổng tiền các hóa đơn sau khi lọc
  const totalFilteredRevenue = filteredOrders.reduce((sum, o) => sum + o.tongThanhToan, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý & Điều phối đơn hàng</h1>

        </div>

        <div className="flex items-center gap-2">
          {/* Nút Xuất Excel */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="gap-1.5 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
            title="Xuất danh sách đơn hàng hiện tại ra file Excel (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Xuất Excel ({filteredOrders.length})</span>
          </Button>

          {/* Nút Tìm kiếm nâng cao */}
          <Button
            variant={advancedFilter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsAdvancedSearchOpen(true)}
            className="gap-1.5 text-xs font-semibold relative"
          >
            <Filter className="h-4 w-4" />
            <span>Tìm kiếm nâng cao</span>
            {advancedFilter && advancedFilter.rules.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-primary font-black">
                {advancedFilter.rules.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Bar & Quick search */}
      <Card className="p-4 border space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm nhanh theo mã đơn, SĐT hoặc tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {STATUS_OPTIONS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id as OrderStatus | 'ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedStatus === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hiển thị các badge đang lọc của Tìm kiếm nâng cao */}
        <ActiveFilterBadges
          filter={advancedFilter}
          fields={ORDER_SEARCH_FIELDS}
          onRemoveRule={handleRemoveRule}
          onClearAll={() => setAdvancedFilter(null)}
        />
      </Card>

      {/* Master-Detail Split Layout: DSHD (Left) & CTHD (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: DSHD - Danh sách hóa đơn / đơn hàng */}
        <Card className="lg:col-span-7 overflow-hidden border">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Danh sách hóa đơn (DSHD)</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Tổng: <strong className="text-primary font-bold">{formatVND(totalFilteredRevenue)}</strong>
              </span>
              <Badge variant="secondary" className="text-xs font-semibold">
                {filteredOrders.length} đơn
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Mã HĐ</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Loại đơn</th>
                  <th className="p-3">Tổng tiền</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Không có đơn hàng nào khớp bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const statusMeta = STATUS_OPTIONS.find((s) => s.id === o.trangThai);
                    const isSelected = o.id === selectedOrder?.id;

                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrderId(o.id)}
                        className={`cursor-pointer transition-colors ${isSelected
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : 'hover:bg-muted/30'
                          }`}
                      >
                        <td className="p-3 font-mono font-bold text-primary">
                          <div className="flex items-center gap-1.5">
                            {isSelected && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                            <span>{o.maDonHang}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-foreground">{o.khachHangTen || 'Khách lẻ'}</div>
                          <div className="text-[11px] text-muted-foreground">{o.soDienThoai}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">
                            {o.loaiDonHang === 'DELIVERY'
                              ? 'Giao hàng'
                              : o.loaiDonHang === 'TAKEAWAY'
                                ? 'Mang đi'
                                : `Bàn ${o.soBan || ''}`}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-foreground">{formatVND(o.tongThanhToan)}</td>
                        <td className="p-3">
                          <Badge className={statusMeta?.color || 'bg-muted'}>{statusMeta?.label}</Badge>
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-[11px] gap-1"
                            onClick={() => setSelectedOrderId(o.id)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Xem
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* RIGHT: CTHD - Sub-form Chi tiết hóa đơn */}
        <Card className="lg:col-span-5 border lg:sticky lg:top-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Chi tiết hóa đơn (CTHD)</h2>
            </div>
            {selectedOrder && (
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" asChild>
                <Link to={`/admin/orders/${selectedOrder.id}`}>
                  <Printer className="h-3.5 w-3.5" /> Bản in
                </Link>
              </Button>
            )}
          </div>

          {!selectedOrder ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Chọn một hóa đơn ở danh sách bên trái (DSHD) để xem chi tiết.
            </div>
          ) : (
            <div className="p-4 space-y-4 text-xs">
              {/* Header & Quick Status Action */}
              <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold font-mono text-primary">
                      {selectedOrder.maDonHang}
                    </span>
                    <Badge
                      className={
                        STATUS_OPTIONS.find((s) => s.id === selectedOrder.trangThai)?.color ||
                        'bg-muted'
                      }
                    >
                      {STATUS_OPTIONS.find((s) => s.id === selectedOrder.trangThai)?.label}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Ngày tạo: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedOrder.trangThai === 'PENDING' && (
                    <Button
                      size="sm"
                      className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          orderId: selectedOrder.id,
                          status: 'CONFIRMED',
                        })
                      }
                    >
                      Xác nhận đơn
                    </Button>
                  )}
                  {selectedOrder.trangThai === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      className="h-7 text-[11px] bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          orderId: selectedOrder.id,
                          status: 'PREPARING',
                        })
                      }
                    >
                      Chuyển pha chế
                    </Button>
                  )}
                  {selectedOrder.trangThai === 'PREPARING' && (
                    <Button
                      size="sm"
                      className="h-7 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          orderId: selectedOrder.id,
                          status: 'SHIPPING',
                        })
                      }
                    >
                      Giao / Sẵn sàng
                    </Button>
                  )}
                  {selectedOrder.trangThai === 'SHIPPING' && (
                    <Button
                      size="sm"
                      className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          orderId: selectedOrder.id,
                          status: 'COMPLETED',
                        })
                      }
                    >
                      Hoàn thành
                    </Button>
                  )}
                </div>
              </div>

              {/* Customer & Payment Sub-grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted/40 p-3 rounded-xl space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5 mb-1">
                    <User className="h-3.5 w-3.5 text-primary" /> Khách hàng
                  </div>
                  <div>
                    <span className="text-muted-foreground">Họ tên:</span>{' '}
                    <span className="font-semibold">{selectedOrder.khachHangTen || 'Khách lẻ'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SĐT:</span>{' '}
                    <span className="font-semibold">{selectedOrder.soDienThoai || '—'}</span>
                  </div>
                  {selectedOrder.diaChiGiaoHang && (
                    <div className="break-words">
                      <span className="text-muted-foreground">Nhận tại:</span>{' '}
                      <span>{selectedOrder.diaChiGiaoHang}</span>
                    </div>
                  )}
                </div>

                <div className="bg-muted/40 p-3 rounded-xl space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5 mb-1">
                    <Store className="h-3.5 w-3.5 text-primary" /> Phục vụ & Thanh toán
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hình thức:</span>{' '}
                    <span className="font-semibold">
                      {selectedOrder.loaiDonHang === 'DELIVERY'
                        ? 'Giao hàng'
                        : selectedOrder.loaiDonHang === 'TAKEAWAY'
                          ? 'Mang đi'
                          : `Tại bàn ${selectedOrder.soBan || ''}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phương thức:</span>{' '}
                    <span className="font-semibold">{selectedOrder.phuongThucThanhToan}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TT Thanh toán:</span>{' '}
                    <span
                      className={`font-bold ${selectedOrder.trangThaiThanhToan === 'SUCCESS'
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                        }`}
                    >
                      {selectedOrder.trangThaiThanhToan === 'SUCCESS'
                        ? 'Đã thanh toán'
                        : 'Chưa thanh toán'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTHD Items Table */}
              <div className="space-y-2">
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Danh sách món trong đơn ({selectedOrder.chiTietList.length} dòng)</span>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 border-b font-semibold text-muted-foreground">
                      <tr>
                        <th className="p-2">Món & Tùy chọn</th>
                        <th className="p-2 text-center">Size</th>
                        <th className="p-2 text-center">SL</th>
                        <th className="p-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.chiTietList.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <div className="font-bold text-foreground">{item.productName}</div>
                            <div className="text-[11px] text-muted-foreground">
                              Đường {item.duongLevel} • Đá {item.daLevel}
                            </div>
                            {item.toppings && item.toppings.length > 0 && (
                              <div className="text-[11px] text-primary">
                                + {item.toppings.map((t) => t.tenTopping).join(', ')}
                              </div>
                            )}
                            {item.ghiChu && (
                              <div className="text-[11px] italic text-muted-foreground">
                                Ghi chú: "{item.ghiChu}"
                              </div>
                            )}
                          </td>
                          <td className="p-2 text-center font-medium">{item.variantName}</td>
                          <td className="p-2 text-center font-bold">{item.soLuong}</td>
                          <td className="p-2 text-right font-bold">{formatVND(item.thanhTien)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-1.5 pt-2 border-t">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tiền hàng:</span>
                  <span>{formatVND(selectedOrder.tongTienHang)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí giao hàng:</span>
                  <span>{formatVND(selectedOrder.phiGiaoHang)}</span>
                </div>
                {selectedOrder.giamGia > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá:</span>
                    <span>-{formatVND(selectedOrder.giamGia)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t pt-2 text-foreground">
                  <span>Tổng thanh toán:</span>
                  <span className="text-primary text-base">
                    {formatVND(selectedOrder.tongThanhToan)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Advanced Search Modal Dialog */}
      <AdvancedSearchModal
        open={isAdvancedSearchOpen}
        onOpenChange={setIsAdvancedSearchOpen}
        fields={ORDER_SEARCH_FIELDS}
        currentFilter={advancedFilter}
        onApply={(f) => setAdvancedFilter(f)}
        presets={ORDER_PRESETS}
      />
    </div>
  );
}
