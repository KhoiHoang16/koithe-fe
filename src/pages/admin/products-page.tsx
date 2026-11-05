import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Search, Edit3, Trash2, Sparkles, Eye, Coffee, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { ConfirmDeleteDialog } from '@/shared/components/overlay/confirm-delete-dialog';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import type { Product } from '@/shared/types/catalog.types';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => catalogApi.getProducts(),
  });

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('Đã xóa sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Không thể xóa sản phẩm');
    },
  });

  const filteredProducts = (products || []).filter((item) => {
    const matchCat = selectedCategory === 'ALL' || item.danhMucId === selectedCategory;
    const matchSearch =
      item.tenSanPham.toLowerCase().includes(search.toLowerCase()) ||
      item.maSanPham.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  useEffect(() => {
    if (filteredProducts.length === 0) {
      setSelectedProductId(null);
      return;
    }
    if (selectedProductId === null || !filteredProducts.some((p) => p.id === selectedProductId)) {
      setSelectedProductId(filteredProducts[0].id);
    }
  }, [filteredProducts, selectedProductId]);

  const { data: productDetail, isPending: isLoadingDetail } = useQuery({
    queryKey: ['admin', 'product-detail', selectedProductId],
    queryFn: () => catalogApi.getProductById(selectedProductId!),
    enabled: !!selectedProductId,
  });

  const selectedProduct =
    productDetail || filteredProducts.find((p) => p.id === selectedProductId) || null;

  if (isLoading) return <LoadingScreen message="Đang tải danh sách sản phẩm..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground text-xs">
            Chọn sản phẩm ở danh sách bên trái (DSSP) để xem chi tiết biến thể, giá bán & tồn kho (CTSP) ở sub-form bên phải
          </p>
        </div>
        <Button asChild className="gap-2 font-bold text-xs bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4" /> Thêm sản phẩm mới
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên hoặc mã SP (VD: TS-001)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Tất cả
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.tenDanhMuc}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Master-Detail Split Layout: DSSP (Left) & CTSP (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: DSSP - Danh sách sản phẩm */}
        <Card className="lg:col-span-7 overflow-hidden border">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Danh sách sản phẩm (DSSP)</h2>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredProducts.length} món
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Mã SP</th>
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3">Giá từ</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Không tìm thấy sản phẩm nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = p.id === selectedProductId;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedProductId(p.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/10 hover:bg-primary/15'
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="p-3 font-mono font-semibold text-primary">
                          <div className="flex items-center gap-1.5">
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                            )}
                            <span>#{p.maSanPham}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                              {p.hinhAnh ? (
                                <img
                                  src={p.hinhAnh}
                                  alt={p.tenSanPham}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>🧋</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-foreground flex items-center gap-1">
                                <span>{p.tenSanPham}</span>
                                {p.noiBat && (
                                  <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground line-clamp-1">
                                {p.moTa || 'Đồ uống KOI Thé'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[11px]">
                            {p.danhMucTen || 'Chưa xếp'}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-primary">{formatVND(p.giaTu)}</td>
                        <td className="p-3">
                          <Badge
                            variant="secondary"
                            className={
                              p.trangThai
                                ? 'bg-primary/20 text-primary'
                                : 'bg-destructive/20 text-destructive'
                            }
                          >
                            {p.trangThai ? 'Đang bán' : 'Tạm ngưng'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              className="h-7 text-[11px] gap-1"
                              onClick={() => setSelectedProductId(p.id)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Xem
                            </Button>
                            <Button variant="ghost" size="icon-sm" asChild>
                              <Link to={`/admin/products/${p.id}/edit`} title="Sửa sản phẩm">
                                <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Xóa sản phẩm"
                              onClick={() => setDeleteTarget(p)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* RIGHT: CTSP - Sub-form Chi tiết sản phẩm & Biến thể */}
        <Card className="lg:col-span-5 border lg:sticky lg:top-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Chi tiết sản phẩm (CTSP)</h2>
            </div>
            {selectedProduct && (
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" asChild>
                  <Link to={`/admin/products/${selectedProduct.id}/edit`}>
                    <Edit3 className="h-3.5 w-3.5" /> Sửa
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-[11px] gap-1"
                  onClick={() => setDeleteTarget(selectedProduct)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Xóa
                </Button>
              </div>
            )}
          </div>

          {!selectedProduct ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Chọn một sản phẩm ở danh sách bên trái (DSSP) để xem chi tiết.
            </div>
          ) : (
            <div className="p-4 space-y-4 text-xs">
              {/* Product Summary Header */}
              <div className="flex gap-3.5 items-start pb-3 border-b">
                <div className="h-20 w-20 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center border">
                  {selectedProduct.hinhAnh ? (
                    <img
                      src={selectedProduct.hinhAnh}
                      alt={selectedProduct.tenSanPham}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">🧋</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-bold text-primary">
                      #{selectedProduct.maSanPham}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedProduct.danhMucTen || 'Chưa xếp'}
                    </Badge>
                    {selectedProduct.noiBat && (
                      <Badge className="bg-amber-500/15 text-amber-600 gap-1 text-[10px]">
                        <Sparkles className="h-2.5 w-2.5" /> Nổi bật
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    {selectedProduct.tenSanPham}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {selectedProduct.moTa || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                  </p>
                </div>
              </div>

              {/* Variants Sub-table (CTSP) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">
                    Danh sách biến thể / Size ({productDetail?.bienTheList?.length ?? 0})
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Giá từ: <strong className="text-primary">{formatVND(selectedProduct.giaTu)}</strong>
                  </span>
                </div>

                {isLoadingDetail ? (
                  <p className="py-4 text-center text-muted-foreground" role="status">
                    Đang tải biến thể sản phẩm...
                  </p>
                ) : !productDetail?.bienTheList || productDetail.bienTheList.length === 0 ? (
                  <p className="py-4 text-center text-muted-foreground border rounded-xl">
                    Sản phẩm này chưa có biến thể nào.
                  </p>
                ) : (
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 border-b text-muted-foreground font-semibold">
                        <tr>
                          <th className="p-2.5">Mã BT</th>
                          <th className="p-2.5">Kích cỡ (Size)</th>
                          <th className="p-2.5 text-right">Giá bán</th>
                          <th className="p-2.5 text-center">Tồn kho</th>
                          <th className="p-2.5 text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {productDetail.bienTheList.map((v) => (
                          <tr key={v.id}>
                            <td className="p-2.5 font-mono text-muted-foreground">#{v.id}</td>
                            <td className="p-2.5 font-bold text-foreground">{v.tenBienThe}</td>
                            <td className="p-2.5 text-right font-bold text-primary">
                              {formatVND(v.giaBan)}
                            </td>
                            <td className="p-2.5 text-center font-semibold">
                              {v.soLuongTon ?? '—'}
                            </td>
                            <td className="p-2.5 text-right">
                              <Badge
                                variant="secondary"
                                className={
                                  v.coSan
                                    ? 'bg-emerald-500/15 text-emerald-700 text-[10px]'
                                    : 'bg-rose-500/15 text-rose-700 text-[10px]'
                                }
                              >
                                {v.coSan ? 'Còn hàng' : 'Hết hàng'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Xóa sản phẩm "${deleteTarget?.tenSanPham}"?`}
        description="Sản phẩm này sẽ bị xóa vĩnh viễn khỏi thực đơn. Thao tác này không thể hoàn tác."
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
