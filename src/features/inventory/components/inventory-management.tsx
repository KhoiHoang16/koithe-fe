import { useState, useEffect, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package, FileSpreadsheet, Plus, Eye, FileText } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  purchaseOrderApi,
  type PurchaseFilters,
  type PurchaseInput,
} from '../api/purchase-order-api';
import { supplierApi } from '../api/supplier-api';
import { dateBounds, purchaseStatus } from '../lib/purchase';
import { ErrorNotice, Modal, Pager } from './shared';
import { control, money } from '../lib/presentation';
import { PurchaseForm } from './purchase-form';
import { PurchaseDetail } from './purchase-detail';
import { ProductPicker } from './product-picker';
import { StockOverview } from './stock-overview';

export function InventoryManagement() {
  const user = useAuthStore((s) => s.user);
  const allowed = user?.vaiTro === 'ADMIN' || user?.vaiTro === 'MANAGER';
  const client = useQueryClient();
  const [activeTab, setActiveTab] = useState<'STOCK' | 'PURCHASES'>('STOCK');
  const [filters, setFilters] = useState<PurchaseFilters>({ page: 0 });
  const [filterError, setFilterError] = useState<Error | null>(null);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const [stock, setStock] = useState(false);

  const allStockQuery = useQuery({
    queryKey: ['inventory', user?.id, 'all-products-stock'],
    queryFn: () => purchaseOrderApi.allProductsWithStock(),
    enabled: allowed,
  });

  const query = useQuery({
    queryKey: ['inventory', user?.id, 'purchases', filters],
    queryFn: () => purchaseOrderApi.list(filters),
    enabled: allowed,
    retry: false,
  });

  const suppliers = useQuery({
    queryKey: ['inventory', user?.id, 'supplier-options'],
    queryFn: supplierApi.options,
    enabled: allowed,
    retry: false,
  });

  useEffect(() => {
    const content = query.data?.content ?? [];
    if (content.length === 0) {
      setDetail(null);
      return;
    }
    if (detail === null || !content.some((o) => o.id === detail)) {
      setDetail(content[0].id);
    }
  }, [query.data, detail]);

  const create = useMutation({
    mutationFn: (input: PurchaseInput) => purchaseOrderApi.create(input),
    onSuccess: async (order) => {
      setCreating(false);
      setActiveTab('PURCHASES');
      setDetail(order.id);
      setFilters((f) => ({ ...f, page: 0 }));
      await client.invalidateQueries({ queryKey: ['inventory', user?.id] });
      toast.success('Đã tạo phiếu chờ duyệt.');
    },
  });

  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilterError(null);
    try {
      const data = new FormData(event.currentTarget);
      setFilters({
        page: 0,
        supplierId: Number(data.get('supplier')) || undefined,
        trangThai: String(data.get('status')) || undefined,
        ...dateBounds(String(data.get('from')), String(data.get('to'))),
      });
    } catch (e) {
      setFilterError(e instanceof Error ? e : new Error('Bộ lọc không hợp lệ.'));
    }
  }

  if (!allowed) return <p role="alert">Bạn không có quyền quản lý nhập hàng.</p>;

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Phiếu nhập hàng & Tồn kho</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi số lượng tồn kho toàn bộ biến thể sản phẩm, kiểm kê nhanh và quản lý phiếu nhập kho (DSPN & CTPN)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setStock(!stock)}>
            {stock ? 'Ẩn tra cứu lẻ' : 'Xem tồn kho'}
          </Button>
          <Button
            onClick={() => {
              create.reset();
              setCreating(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tạo phiếu nhập
          </Button>
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <Button
          type="button"
          variant={activeTab === 'STOCK' ? 'default' : 'outline'}
          onClick={() => setActiveTab('STOCK')}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          Tồn kho tất cả sản phẩm ({allStockQuery.data?.length ?? 0})
        </Button>
        <Button
          type="button"
          variant={activeTab === 'PURCHASES' ? 'default' : 'outline'}
          onClick={() => setActiveTab('PURCHASES')}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Danh sách Phiếu nhập kho ({query.data?.totalElements ?? query.data?.content.length ?? 0})
        </Button>
      </div>

      {stock && (
        <section className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Tồn kho theo biến thể sản phẩm</h2>
          <ProductPicker scope={user?.id} stock />
        </section>
      )}

      {/* TAB 1: ALL PRODUCTS STOCK MATRIX */}
      {activeTab === 'STOCK' && (
        <StockOverview
          scope={user?.id}
          products={allStockQuery.data ?? []}
          isPending={allStockQuery.isPending}
          isError={allStockQuery.isError}
          isFetching={allStockQuery.isFetching}
          onRefetch={() => void allStockQuery.refetch()}
          onCreatePurchaseOrder={() => {
            create.reset();
            setCreating(true);
          }}
        />
      )}

      {/* TAB 2: PURCHASE ORDERS (Master-Detail: DSPN Left + CTPN Right) */}
      {activeTab === 'PURCHASES' && (
        <div className="space-y-4">
          <form
            onSubmit={filter}
            className="grid items-end gap-3 rounded-lg border bg-card p-4 md:grid-cols-5"
          >
            <label className="text-sm font-medium">
              Nhà cung cấp
              <select name="supplier" className={control} defaultValue="">
                <option value="">Tất cả</option>
                {suppliers.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.tenNhaCungCap}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Từ ngày
              <input type="date" name="from" className={control} />
            </label>
            <label className="text-sm font-medium">
              Đến ngày
              <input type="date" name="to" className={control} />
            </label>
            <label className="text-sm font-medium">
              Trạng thái
              <select name="status" className={control} defaultValue="">
                <option value="">Tất cả</option>
                <option value="CHO_DUYET">Chờ duyệt</option>
                <option value="DA_NHAP_KHO">Đã nhập kho</option>
                <option value="DA_HUY">Đã hủy</option>
              </select>
            </label>
            <Button type="submit">Lọc phiếu</Button>
          </form>
          {suppliers.isPending && <p role="status">Đang tải bộ lọc nhà cung cấp...</p>}
          {suppliers.isError && (
            <ErrorNotice error={suppliers.error} retry={() => void suppliers.refetch()} />
          )}
          {filterError && <ErrorNotice error={filterError} />}
          {query.isPending ? (
            <p role="status">Đang tải phiếu nhập...</p>
          ) : query.isError ? (
            <ErrorNotice error={query.error} retry={() => void query.refetch()} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: DSPN - Danh sách phiếu nhập */}
              <div className="lg:col-span-7 space-y-3">
                <Card className="overflow-hidden border">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-bold">Danh sách phiếu nhập (DSPN)</h2>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {query.data.totalElements ?? query.data.content.length} phiếu
                    </Badge>
                  </div>
                  {!query.data.content.length ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                      Không có phiếu nhập phù hợp.
                    </p>
                  ) : (
                    <div className="overflow-x-auto" data-lenis-prevent>
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-muted/50 border-b text-muted-foreground">
                          <tr>
                            {['Mã phiếu', 'Ngày nhập', 'Tổng tiền', 'Trạng thái', 'Chi tiết'].map(
                              (s) => (
                                <th key={s} className="p-3 font-medium">
                                  {s}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {query.data.content.map((order) => {
                            const isSelected = order.id === detail;
                            return (
                              <tr
                                key={order.id}
                                onClick={() => setDetail(order.id)}
                                className={`border-t cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-primary/10 hover:bg-primary/15'
                                    : 'hover:bg-muted/20'
                                }`}
                              >
                                <td className="p-3 font-mono font-semibold text-primary">
                                  <div className="flex items-center gap-1.5">
                                    {isSelected && (
                                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                    )}
                                    <span>{order.maPhieuNhap}</span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  {new Date(order.ngayNhap).toLocaleString('vi-VN')}
                                </td>
                                <td className="p-3 font-semibold">{money(order.tongTien)}</td>
                                <td className="p-3">{purchaseStatus(order.trangThai)}</td>
                                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    size="sm"
                                    variant={isSelected ? 'default' : 'outline'}
                                    className="h-7 text-xs gap-1"
                                    onClick={() => setDetail(order.id)}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Xem
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                <Pager
                  page={filters.page}
                  total={query.data.totalPages}
                  pending={query.isFetching}
                  change={(page) => setFilters((f) => ({ ...f, page }))}
                />
              </div>

              {/* RIGHT: CTPN - Sub-form Chi tiết phiếu nhập */}
              <div className="lg:col-span-5 lg:sticky lg:top-4">
                {detail !== null ? (
                  <PurchaseDetail
                    key={detail}
                    id={detail}
                    scope={user?.id}
                    inline
                    close={() => {
                      setDetail(null);
                      void allStockQuery.refetch();
                    }}
                  />
                ) : (
                  <Card className="border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                      <FileText className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-bold">Chi tiết phiếu nhập (CTPN)</h2>
                    </div>
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      Chọn một phiếu nhập ở danh sách bên trái (DSPN) để xem chi tiết mặt hàng và duyệt phiếu.
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {creating && (
        <Modal
          title="Tạo phiếu nhập hàng"
          description="Chọn nhà cung cấp và các biến thể cần nhập. Tạo phiếu chưa làm tăng tồn kho."
          close={() => setCreating(false)}
          busy={create.isPending}
        >
          <PurchaseForm
            scope={user?.id}
            pending={create.isPending}
            error={create.error}
            save={(input) => {
              if (allowed) create.mutate(input);
            }}
          />
        </Modal>
      )}
    </section>
  );
}
