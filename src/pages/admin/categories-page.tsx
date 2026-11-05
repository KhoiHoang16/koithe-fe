import { useState, useMemo, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  FolderOpen,
  Coffee,
  CheckCircle2,
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
import type { Category } from '@/shared/types/catalog.types';

function getErrorMsg(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  return fallback;
}

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.vaiTro === 'ADMIN';

  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<{ category: Category | null } | null>(null);
  const [tenDanhMuc, setTenDanhMuc] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'for-category-count'],
    queryFn: () => catalogApi.getProducts({ page: 0, size: 200 }),
  });

  const productCountByCategory = useMemo(() => {
    const counts = new Map<number, number>();
    for (const p of productsQuery.data ?? []) {
      counts.set(p.danhMucId, (counts.get(p.danhMucId) ?? 0) + 1);
    }
    return counts;
  }, [productsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const cleanName = tenDanhMuc.trim();
      if (!cleanName) throw new Error('Tên danh mục không được để trống');
      if (editor?.category) {
        return catalogApi.updateCategory(editor.category.id, { tenDanhMuc: cleanName });
      }
      return catalogApi.createCategory({
        tenDanhMuc: cleanName,
        thuTu: (categoriesQuery.data?.length || 0) + 1,
        trangThai: true,
      });
    },
    onSuccess: async () => {
      toast.success(
        editor?.category ? 'Đã cập nhật danh mục!' : 'Đã thêm danh mục mới!',
      );
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setEditor(null);
      setTenDanhMuc('');
    },
    onError: (err) => {
      toast.error(getErrorMsg(err, 'Không thể lưu danh mục. Vui lòng thử lại.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogApi.deleteCategory(id),
    onSuccess: async () => {
      toast.success('Đã xóa danh mục thành công!');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(
        getErrorMsg(err, 'Không thể xóa danh mục đang có sản phẩm liên kết.'),
      );
    },
  });

  const categories = categoriesQuery.data ?? [];
  const totalProducts = productsQuery.data?.length ?? 0;

  const filteredCategories = useMemo(() => {
    const list = categoriesQuery.data ?? [];
    const kw = search.trim().toLowerCase();
    if (!kw) return list;
    return list.filter(
      (c) =>
        c.tenDanhMuc.toLowerCase().includes(kw) || String(c.id).includes(kw),
    );
  }, [categoriesQuery.data, search]);

  const openCreateModal = () => {
    setTenDanhMuc('');
    setEditor({ category: null });
  };

  const openEditModal = (category: Category) => {
    setTenDanhMuc(category.tenDanhMuc);
    setEditor({ category });
  };

  const handleSaveSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tenDanhMuc.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý danh mục</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Phân loại các dòng sản phẩm đồ uống và món ăn kèm trên toàn hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              void categoriesQuery.refetch();
              void productsQuery.refetch();
            }}
            disabled={categoriesQuery.isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${categoriesQuery.isFetching ? 'animate-spin' : ''}`}
            />
            Làm mới
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm danh mục
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Tổng số danh mục</p>
            <p className="text-2xl font-bold mt-1">{categories.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <FolderOpen className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Tổng sản phẩm trong thực đơn</p>
            <p className="text-2xl font-bold mt-1">{totalProducts}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
            <Coffee className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Trạng thái hiển thị</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{categories.length} đang bật</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-green-500/15 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter & Table Card */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã danh mục..."
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Hiển thị <strong>{filteredCategories.length}</strong> / {categories.length} danh mục
          </p>
        </div>

        {categoriesQuery.isPending ? (
          <div role="status" className="py-12 text-center text-muted-foreground">
            Đang tải danh sách danh mục...
          </div>
        ) : categoriesQuery.isError ? (
          <div role="alert" className="py-10 text-center space-y-3">
            <p className="text-destructive">Không thể tải danh sách danh mục.</p>
            <Button variant="outline" onClick={() => void categoriesQuery.refetch()}>
              Thử lại
            </Button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div role="status" className="py-12 text-center text-muted-foreground">
            Không tìm thấy danh mục nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium whitespace-nowrap w-24">Mã DM</th>
                  <th className="p-3 font-medium whitespace-nowrap">Tên danh mục</th>
                  <th className="p-3 font-medium whitespace-nowrap text-center">
                    Số lượng sản phẩm
                  </th>
                  <th className="p-3 font-medium whitespace-nowrap text-center">Trạng thái</th>
                  <th className="p-3 font-medium whitespace-nowrap text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCategories.map((c) => {
                  const count = productCountByCategory.get(c.id) ?? c.soLuongSanPham ?? 0;
                  return (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono text-xs text-muted-foreground">#{c.id}</td>
                      <td className="p-3 font-semibold text-foreground">{c.tenDanhMuc}</td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className="font-semibold">
                          {count} sản phẩm
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="success">Đang hiển thị</Badge>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/admin/products">Xem món</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(c)}
                            title="Đổi tên danh mục"
                          >
                            <Edit3 className="h-3.5 w-3.5 mr-1" />
                            Sửa
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteTarget(c)}
                              title="Xóa danh mục"
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
              {editor?.category ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
            </DialogTitle>
            <DialogDescription>
              Nhập tên danh mục hiển thị trên thực đơn khách hàng và máy POS.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Tên danh mục *</Label>
              <Input
                id="cat-name"
                value={tenDanhMuc}
                onChange={(e) => setTenDanhMuc(e.target.value)}
                placeholder="VD: Trà Sữa Đặc Biệt, Macchiato, Đá Xay..."
                disabled={saveMutation.isPending}
                autoFocus
              />
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
                {editor?.category ? 'Lưu thay đổi' : 'Tạo danh mục'}
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
        title="Xác nhận xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${deleteTarget?.tenDanhMuc}"?`}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
