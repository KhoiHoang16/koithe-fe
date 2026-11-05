import { useState, useMemo, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Tag,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
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
import { ConfirmDeleteDialog } from '@/shared/components/overlay/confirm-delete-dialog';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { useAuthStore } from '@/shared/stores/auth-store';
import { ApiError } from '@/shared/api/http-client';
import type { Topping } from '@/shared/types/catalog.types';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function getErrorMsg(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  return fallback;
}

export function ToppingsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.vaiTro === 'ADMIN';

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'AVAILABLE' | 'OUT'>('ALL');
  const [editor, setEditor] = useState<{ topping: Topping | null } | null>(null);
  const [tenTopping, setTenTopping] = useState('');
  const [giaBan, setGiaBan] = useState('10000');
  const [soLuongTon, setSoLuongTon] = useState('100');
  const [deleteTarget, setDeleteTarget] = useState<Topping | null>(null);

  const toppingsQuery = useQuery({
    queryKey: ['admin', 'toppings'],
    queryFn: () => catalogApi.getToppings(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const cleanName = tenTopping.trim();
      const priceNum = Number(giaBan);
      const stockNum = Number(soLuongTon);
      if (!cleanName) throw new Error('Tên topping không được để trống');
      if (!Number.isFinite(priceNum) || priceNum <= 0) throw new Error('Đơn giá phải lớn hơn 0');
      if (!Number.isFinite(stockNum) || stockNum < 0)
        throw new Error('Số lượng tồn kho không hợp lệ');

      if (editor?.topping) {
        return catalogApi.updateTopping(editor.topping.id, {
          tenTopping: cleanName,
          giaBan: priceNum,
          soLuongTon: stockNum,
        });
      }
      return catalogApi.createTopping({
        tenTopping: cleanName,
        giaBan: priceNum,
        soLuongTon: stockNum,
        coSan: stockNum > 0,
        trangThai: true,
      });
    },
    onSuccess: async () => {
      toast.success(
        editor?.topping ? 'Đã cập nhật thông tin topping!' : 'Đã thêm topping mới!',
      );
      await queryClient.invalidateQueries({ queryKey: ['admin', 'toppings'] });
      setEditor(null);
    },
    onError: (err) => {
      toast.error(getErrorMsg(err, 'Không thể lưu thông tin topping. Vui lòng thử lại.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogApi.deleteTopping(id),
    onSuccess: async () => {
      toast.success('Đã xóa topping thành công!');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'toppings'] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(getErrorMsg(err, 'Không thể xóa topping này.'));
    },
  });

  const toppings = toppingsQuery.data ?? [];
  const availableCount = toppings.filter((t) => t.coSan !== false && (t.soLuongTon ?? 1) > 0).length;
  const outOfStockCount = toppings.length - availableCount;
  const avgPrice =
    toppings.length > 0
      ? Math.round(toppings.reduce((sum, t) => sum + t.giaBan, 0) / toppings.length)
      : 0;

  const filteredToppings = useMemo(() => {
    const list = toppingsQuery.data ?? [];
    const kw = search.trim().toLowerCase();
    return list.filter((t) => {
      const isAvail = t.coSan !== false && (t.soLuongTon ?? 1) > 0;
      if (stockFilter === 'AVAILABLE' && !isAvail) return false;
      if (stockFilter === 'OUT' && isAvail) return false;
      if (kw && !t.tenTopping.toLowerCase().includes(kw) && !String(t.id).includes(kw)) {
        return false;
      }
      return true;
    });
  }, [toppingsQuery.data, search, stockFilter]);

  const openCreateModal = () => {
    setTenTopping('');
    setGiaBan('10000');
    setSoLuongTon('100');
    setEditor({ topping: null });
  };

  const openEditModal = (t: Topping) => {
    setTenTopping(t.tenTopping);
    setGiaBan(String(t.giaBan));
    setSoLuongTon(String(t.soLuongTon ?? 100));
    setEditor({ topping: t });
  };

  const handleSaveSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tenTopping.trim()) {
      toast.error('Vui lòng nhập tên topping');
      return;
    }
    if (Number(giaBan) <= 0) {
      toast.error('Đơn giá phải lớn hơn 0');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Topping</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cấu hình các loại topping ăn kèm, đơn giá bán và số lượng tồn kho phục vụ pha chế
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void toppingsQuery.refetch()}
            disabled={toppingsQuery.isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${toppingsQuery.isFetching ? 'animate-spin' : ''}`}
            />
            Làm mới
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm Topping
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Tổng loại Topping</p>
            <p className="text-2xl font-bold mt-1">{toppings.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Tag className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Đang sẵn sàng</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{availableCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-green-500/15 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Tạm hết hàng</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">{outOfStockCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Đơn giá trung bình</p>
            <p className="text-2xl font-bold mt-1">{formatVND(avgPrice)}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter & Table Card */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['ALL', 'Tất cả'],
                ['AVAILABLE', 'Còn hàng'],
                ['OUT', 'Hết hàng'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setStockFilter(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  stockFilter === id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên topping..."
              className="pl-9"
            />
          </div>
        </div>

        {toppingsQuery.isPending ? (
          <div role="status" className="py-12 text-center text-muted-foreground">
            Đang tải danh sách topping...
          </div>
        ) : toppingsQuery.isError ? (
          <div role="alert" className="py-10 text-center space-y-3">
            <p className="text-destructive">Không thể tải danh sách topping.</p>
            <Button variant="outline" onClick={() => void toppingsQuery.refetch()}>
              Thử lại
            </Button>
          </div>
        ) : filteredToppings.length === 0 ? (
          <div role="status" className="py-12 text-center text-muted-foreground">
            Không tìm thấy loại topping nào khớp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium whitespace-nowrap w-20">Mã</th>
                  <th className="p-3 font-medium whitespace-nowrap">Tên Topping</th>
                  <th className="p-3 font-medium whitespace-nowrap text-right">Đơn giá</th>
                  <th className="p-3 font-medium whitespace-nowrap text-center">Tồn kho</th>
                  <th className="p-3 font-medium whitespace-nowrap text-center">Tình trạng kho</th>
                  <th className="p-3 font-medium whitespace-nowrap text-center">Trạng thái</th>
                  <th className="p-3 font-medium whitespace-nowrap text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredToppings.map((t) => {
                  const isAvailable = t.coSan !== false && (t.soLuongTon ?? 1) > 0;
                  return (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono text-xs text-muted-foreground">#{t.id}</td>
                      <td className="p-3 font-semibold text-foreground">{t.tenTopping}</td>
                      <td className="p-3 text-right font-bold text-primary font-mono whitespace-nowrap">
                        {formatVND(t.giaBan)}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {t.soLuongTon !== undefined ? t.soLuongTon : '—'}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={isAvailable ? 'outline' : 'warning'}>
                          {isAvailable ? 'Sẵn sàng' : 'Tạm hết'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="success">Đang bán</Badge>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(t)}
                            title="Sửa giá / tồn kho topping"
                          >
                            <Edit3 className="h-3.5 w-3.5 mr-1" />
                            Sửa
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteTarget(t)}
                              title="Xóa topping"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Dialog
        open={!!editor}
        onOpenChange={(open) => {
          if (!open && !saveMutation.isPending) setEditor(null);
        }}
      >
        <DialogContent className="max-w-md w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>
              {editor?.topping ? 'Cập nhật Topping' : 'Thêm Topping mới'}
            </DialogTitle>
            <DialogDescription>
              Thiết lập tên gọi, đơn giá bán kèm và số lượng tồn kho hiện tại.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="top-name">Tên Topping *</Label>
              <Input
                id="top-name"
                value={tenTopping}
                onChange={(e) => setTenTopping(e.target.value)}
                placeholder="VD: Trân châu hoàng kim, Kem phô mai..."
                disabled={saveMutation.isPending}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="top-price">Đơn giá (VNĐ) *</Label>
                <Input
                  id="top-price"
                  type="number"
                  min={1000}
                  step={1000}
                  value={giaBan}
                  onChange={(e) => setGiaBan(e.target.value)}
                  disabled={saveMutation.isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="top-stock">Số lượng tồn kho *</Label>
                <Input
                  id="top-stock"
                  type="number"
                  min={0}
                  value={soLuongTon}
                  onChange={(e) => setSoLuongTon(e.target.value)}
                  disabled={saveMutation.isPending}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={saveMutation.isPending}
                onClick={() => setEditor(null)}
              >
                Hủy
              </Button>
              <Button type="submit" isLoading={saveMutation.isPending}>
                {editor?.topping ? 'Lưu thay đổi' : 'Tạo Topping'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Xác nhận xóa Topping"
        description={`Bạn có chắc chắn muốn xóa topping "${deleteTarget?.tenTopping}" khỏi thực đơn?`}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
