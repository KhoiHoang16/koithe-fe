import { useState, useMemo, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit3,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import {
  purchaseOrderApi,
  type ProductStockSummary,
  type StockVariant,
} from '../api/purchase-order-api';

interface StockOverviewProps {
  scope: number | undefined;
  products: ProductStockSummary[];
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  onRefetch: () => void;
  onCreatePurchaseOrder: () => void;
}

type StockStatusFilter = 'ALL' | 'GOOD' | 'LOW' | 'OUT';

export function StockOverview({
  scope,
  products,
  isPending,
  isError,
  isFetching,
  onRefetch,
  onCreatePurchaseOrder,
}: StockOverviewProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>('ALL');
  const [adjusting, setAdjusting] = useState<{
    productName: string;
    variant: StockVariant;
  } | null>(null);
  const [newStockValue, setNewStockValue] = useState('0');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.tenDanhMuc) set.add(p.tenDanhMuc);
    }
    return Array.from(set);
  }, [products]);

  const stats = useMemo(() => {
    let totalVariants = 0;
    let goodCount = 0;
    let lowCount = 0;
    let outCount = 0;
    for (const p of products) {
      for (const v of p.variants) {
        totalVariants++;
        const qty = Number(v.soLuongTon ?? 0);
        if (qty <= 0 || v.conHang === false) outCount++;
        else if (qty <= 10) lowCount++;
        else goodCount++;
      }
    }
    return { totalVariants, goodCount, lowCount, outCount };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'ALL' && p.tenDanhMuc !== categoryFilter) return false;
      if (kw && !p.tenSanPham.toLowerCase().includes(kw) && !String(p.id).includes(kw)) {
        return false;
      }
      if (statusFilter === 'OUT') {
        return p.variants.some((v) => Number(v.soLuongTon ?? 0) <= 0 || v.conHang === false);
      }
      if (statusFilter === 'LOW') {
        return p.variants.some((v) => {
          const qty = Number(v.soLuongTon ?? 0);
          return qty > 0 && qty <= 10 && v.conHang !== false;
        });
      }
      if (statusFilter === 'GOOD') {
        return p.variants.every((v) => Number(v.soLuongTon ?? 0) > 10 && v.conHang !== false);
      }
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const updateStockMutation = useMutation({
    mutationFn: async () => {
      if (!adjusting) return;
      const qty = Number(newStockValue);
      if (!Number.isFinite(qty) || qty < 0) {
        throw new Error('Số lượng tồn kho phải từ 0 trở lên');
      }
      return purchaseOrderApi.updateVariantStock(adjusting.variant.id, qty);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inventory', scope] });
      toast.success('Đã cập nhật số lượng tồn kho!');
      setAdjusting(null);
    },
    onError: () => {
      toast.error('Không thể cập nhật tồn kho. Vui lòng thử lại.');
    },
  });

  const handleAdjustSubmit = (e: FormEvent) => {
    e.preventDefault();
    const qty = Number(newStockValue);
    if (!Number.isFinite(qty) || qty < 0) {
      toast.error('Số lượng tồn kho không được âm');
      return;
    }
    updateStockMutation.mutate();
  };

  return (
    <div className="space-y-4">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Tổng biến thể (SKU)</p>
            <p className="text-2xl font-bold mt-1">{stats.totalVariants}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{products.length} sản phẩm</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Tồn kho dồi dào (&gt;10)</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.goodCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Đủ phục vụ bán hàng</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-green-500/15 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Sắp hết hàng (1–10)</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">{stats.lowCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Cần lên kế hoạch nhập</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Đã hết hàng (0)</p>
            <p className="text-2xl font-bold mt-1 text-destructive">{stats.outCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Cần nhập kho ngay</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filters & Matrix Table */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['ALL', 'Tất cả sản phẩm'],
                ['GOOD', 'Dồi dào (>10)'],
                ['LOW', `Sắp hết (${stats.lowCount})`],
                ['OUT', `Hết hàng (${stats.outCount})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setStatusFilter(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên sản phẩm..."
                className="pl-9"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onRefetch}
              disabled={isFetching}
              title="Làm mới tồn kho"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {isPending ? (
          <div role="status" className="py-12 text-center text-muted-foreground">
            Đang tải bảng tồn kho toàn bộ sản phẩm...
          </div>
        ) : isError ? (
          <div role="alert" className="py-10 text-center space-y-3">
            <p className="text-destructive">Không thể tải dữ liệu tồn kho sản phẩm.</p>
            <Button variant="outline" onClick={onRefetch}>
              Thử lại
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div role="status" className="py-12 text-center text-muted-foreground">
            Không có sản phẩm nào khớp với bộ lọc tồn kho hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium whitespace-nowrap w-20">Mã SP</th>
                  <th className="p-3 font-medium whitespace-nowrap">Sản phẩm</th>
                  <th className="p-3 font-medium whitespace-nowrap">Danh mục</th>
                  <th className="p-3 font-medium whitespace-nowrap">
                    Tồn kho chi tiết theo Size (Bấm vào Size để kiểm kê nhanh)
                  </th>
                  <th className="p-3 font-medium whitespace-nowrap text-center">Tổng tồn</th>
                  <th className="p-3 font-medium whitespace-nowrap text-center">Trạng thái</th>
                  <th className="p-3 font-medium whitespace-nowrap text-right">Nhập hàng</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => {
                  const hasOut = product.variants.some(
                    (v) => Number(v.soLuongTon ?? 0) <= 0 || v.conHang === false,
                  );
                  const hasLow = product.variants.some((v) => {
                    const q = Number(v.soLuongTon ?? 0);
                    return q > 0 && q <= 10 && v.conHang !== false;
                  });

                  return (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono text-xs text-muted-foreground">
                        #{product.id}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {product.hinhAnh ? (
                            <img
                              src={product.hinhAnh}
                              alt={product.tenSanPham}
                              className="h-10 w-10 rounded-lg object-cover border shrink-0 bg-muted"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                              KOI
                            </div>
                          )}
                          <span className="font-semibold text-foreground">
                            {product.tenSanPham}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap text-muted-foreground">
                        {product.tenDanhMuc}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {product.variants.map((v) => {
                            const qty = Number(v.soLuongTon ?? 0);
                            const isOut = qty <= 0 || v.conHang === false;
                            const isLow = !isOut && qty <= 10;

                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  setNewStockValue(String(qty));
                                  setAdjusting({
                                    productName: product.tenSanPham,
                                    variant: v,
                                  });
                                }}
                                title="Bấm để kiểm kê / điều chỉnh số lượng tồn kho"
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all hover:shadow-sm ${
                                  isOut
                                    ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                    : isLow
                                      ? 'border-amber-400/60 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                <span className="font-bold">Size {v.kichCo}:</span>
                                <span className="font-mono font-semibold">{qty}</span>
                                <Edit3 className="h-3 w-3 opacity-70" />
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        {product.totalStock}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {hasOut ? (
                          <Badge variant="destructive">Có size hết hàng</Badge>
                        ) : hasLow ? (
                          <Badge variant="warning">Sắp hết hàng</Badge>
                        ) : (
                          <Badge variant="success">Đủ hàng</Badge>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onCreatePurchaseOrder}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Tạo phiếu nhập
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

      {/* Quick Stock Adjustment Modal */}
      <Dialog
        open={!!adjusting}
        onOpenChange={(open) => {
          if (!open && !updateStockMutation.isPending) setAdjusting(null);
        }}
      >
        <DialogContent className="max-w-sm w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Kiểm kê / Điều chỉnh tồn kho</DialogTitle>
            <DialogDescription>
              Cập nhật trực tiếp số lượng tồn kho thực tế cho{' '}
              <strong>
                {adjusting?.productName} (Size {adjusting?.variant.kichCo})
              </strong>
              .
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adj-stock-input">Số lượng tồn kho thực tế *</Label>
              <Input
                id="adj-stock-input"
                type="number"
                min={0}
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                disabled={updateStockMutation.isPending}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={updateStockMutation.isPending}
                onClick={() => setAdjusting(null)}
              >
                Hủy
              </Button>
              <Button type="submit" isLoading={updateStockMutation.isPending}>
                Lưu tồn kho
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

