import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, Image } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';

const productSchema = z.object({
  maSanPham: z.string().min(2, 'Mã SP tối thiểu 2 ký tự'),
  tenSanPham: z.string().min(2, 'Tên sản phẩm tối thiểu 2 ký tự'),
  danhMucId: z.number().min(1, 'Vui lòng chọn danh mục'),
  giaTu: z.number().min(1000, 'Giá ban đầu tối thiểu 1.000đ'),
  hinhAnh: z.string().optional(),
  moTa: z.string().optional(),
  noiBat: z.boolean(),
  trangThai: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [variants, setVariants] = useState<{ id?: number; tenBienThe: string; giaBan: number }[]>([
    { tenBienThe: 'Size S', giaBan: 45000 },
    { tenBienThe: 'Size M', giaBan: 55000 },
    { tenBienThe: 'Size L', giaBan: 65000 },
  ]);

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => catalogApi.getProductById(Number(id)),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      maSanPham: `TS-00${Math.floor(Math.random() * 90 + 10)}`,
      tenSanPham: '',
      danhMucId: 1,
      giaTu: 45000,
      hinhAnh: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80',
      moTa: '',
      noiBat: false,
      trangThai: true,
    },
  });

  useEffect(() => {
    if (productData && isEdit) {
      reset({
        maSanPham: productData.maSanPham,
        tenSanPham: productData.tenSanPham,
        danhMucId: productData.danhMucId,
        giaTu: productData.giaTu,
        hinhAnh: productData.hinhAnh,
        moTa: productData.moTa,
        noiBat: productData.noiBat,
        trangThai: productData.trangThai,
      });
      if (productData.bienTheList && productData.bienTheList.length > 0) {
        setVariants(productData.bienTheList.map((v) => ({ id: v.id, tenBienThe: v.tenBienThe, giaBan: v.giaBan })));
      }
    }
  }, [productData, isEdit, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = {
        ...data,
        bienTheList: variants as any,
      };
      return isEdit ? catalogApi.updateProduct(Number(id), payload) : catalogApi.createProduct(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Đã cập nhật sản phẩm!' : 'Đã tạo sản phẩm mới!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      navigate('/admin/products');
    },
    onError: () => {
      toast.error('Không thể lưu thông tin sản phẩm');
    },
  });

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { tenBienThe: 'Size Mới', giaBan: 50000 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateVariant = (index: number, field: 'tenBienThe' | 'giaBan', value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: field === 'giaBan' ? Number(value) : value } : v)),
    );
  };

  if (isEdit && isLoading) return <LoadingScreen message="Đang tải dữ liệu sản phẩm..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <Link to="/admin/products" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách sản phẩm
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
          <p className="text-muted-foreground text-xs">Cấu hình chi tiết tên, giá, danh mục và các size biến thể</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => saveMutation.mutate(data as any))} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-5 space-y-4 border">
              <h2 className="text-sm font-bold border-b pb-2">Thông tin cơ bản</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maSanPham" className="text-xs">Mã sản phẩm *</Label>
                  <Input id="maSanPham" {...register('maSanPham')} className="mt-1 text-xs font-mono" />
                  {errors.maSanPham && <p className="text-xs text-destructive mt-1">{errors.maSanPham.message}</p>}
                </div>

                <div>
                  <Label htmlFor="danhMucId" className="text-xs">Danh mục đồ uống *</Label>
                  <select
                    id="danhMucId"
                    {...register('danhMucId')}
                    className="w-full mt-1 h-9 rounded-lg border bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                  >
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.tenDanhMuc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="tenSanPham" className="text-xs">Tên sản phẩm *</Label>
                <Input id="tenSanPham" {...register('tenSanPham')} className="mt-1 text-xs" placeholder="VD: Trà Sữa Trân Châu Hoàng Kim" />
                {errors.tenSanPham && <p className="text-xs text-destructive mt-1">{errors.tenSanPham.message}</p>}
              </div>

              <div>
                <Label htmlFor="moTa" className="text-xs">Mô tả sản phẩm</Label>
                <Textarea id="moTa" {...register('moTa')} className="mt-1 text-xs min-h-24" placeholder="Mô tả thành phần, hương vị đặc trưng..." />
              </div>
            </Card>

            {/* Dynamic Variant Matrix */}
            <Card className="p-5 border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-sm font-bold">Các kích thước / Size</h2>
                <Button type="button" variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={handleAddVariant}>
                  <Plus className="h-3.5 w-3.5" /> Thêm size
                </Button>
              </div>

              <div className="space-y-3">
                {variants.map((variant, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-xl border">
                    <Input
                      value={variant.tenBienThe}
                      onChange={(e) => handleUpdateVariant(idx, 'tenBienThe', e.target.value)}
                      placeholder="Tên Size (VD: Size M)"
                      className="text-xs h-8 flex-1"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground font-semibold">Giá:</span>
                      <Input
                        type="number"
                        value={variant.giaBan}
                        onChange={(e) => handleUpdateVariant(idx, 'giaBan', e.target.value)}
                        className="text-xs h-8 w-28 text-right font-mono"
                      />
                      <span className="text-xs text-muted-foreground">đ</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveVariant(idx)}
                      disabled={variants.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right 1 Col: Image & Status Toggles */}
          <div className="space-y-6">
            <Card className="p-5 space-y-4 border">
              <h2 className="text-sm font-bold border-b pb-2">Hình ảnh sản phẩm</h2>
              <div className="h-44 bg-muted rounded-xl border overflow-hidden flex items-center justify-center relative">
                {watch('hinhAnh') ? (
                  <img src={watch('hinhAnh')} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label htmlFor="hinhAnh" className="text-xs">URL hình ảnh</Label>
                <Input id="hinhAnh" {...register('hinhAnh')} className="mt-1 text-xs" placeholder="https://images.unsplash.com/..." />
              </div>
            </Card>

            <Card className="p-5 space-y-4 border">
              <h2 className="text-sm font-bold border-b pb-2">Cấu hình hiển thị</h2>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold">Sản phẩm nổi bật</div>
                  <div className="text-[11px] text-muted-foreground">Hiển thị icon Sparkles trên trang chủ</div>
                </div>
                <Switch
                  checked={watch('noiBat')}
                  onCheckedChange={(val) => setValue('noiBat', val)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold">Trạng thái kinh doanh</div>
                  <div className="text-[11px] text-muted-foreground">Bật để cho phép khách đặt món</div>
                </div>
                <Switch
                  checked={watch('trangThai')}
                  onCheckedChange={(val) => setValue('trangThai', val)}
                />
              </div>
            </Card>

            <Button type="submit" size="lg" className="w-full font-bold gap-2 text-sm" isLoading={saveMutation.isPending}>
              <Save className="h-4 w-4" /> {isEdit ? 'Lưu cập nhật' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
