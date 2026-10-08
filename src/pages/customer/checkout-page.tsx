import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Truck, Store, QrCode, CreditCard, ShieldCheck, MapPin, User, Phone, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card } from '@/shared/components/ui/card';
import { useCartStore } from '@/shared/stores/cart-store';
import { useAuthStore } from '@/shared/stores/auth-store';
import { orderApi } from '@/features/orders/api/order-api';
import type { OrderType, PaymentMethod } from '@/shared/types/order.types';

const checkoutSchema = z.object({
  loaiDonHang: z.enum(['DELIVERY', 'TAKEAWAY', 'AT_TABLE']),
  khachHangTen: z.string().min(2, 'Vui lòng nhập họ tên đầy đủ'),
  soDienThoai: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')),
  diaChiGiaoHang: z.string().optional(),
  soBan: z.string().optional(),
  ghiChu: z.string().optional(),
  phuongThucThanhToan: z.enum(['COD', 'VNPAY', 'MOMO', 'BANK_TRANSFER']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { items, appliedVoucher, voucherDiscount, getSubtotal, getTotal, clearCart } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      loaiDonHang: 'DELIVERY',
      khachHangTen: user?.hoTen || '',
      soDienThoai: user?.soDienThoai || '',
      email: user?.email || '',
      diaChiGiaoHang: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      soBan: '',
      ghiChu: '',
      phuongThucThanhToan: 'VNPAY',
    },
  });

  const selectedLoaiDonHang = watch('loaiDonHang');
  const selectedPaymentMethod = watch('phuongThucThanhToan');

  const shippingFee = selectedLoaiDonHang === 'DELIVERY' ? 15000 : 0;
  const finalTotal = getTotal(shippingFee);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    if (data.loaiDonHang === 'DELIVERY' && !data.diaChiGiaoHang?.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await orderApi.createOrder({
        loaiDonHang: data.loaiDonHang as OrderType,
        khachHangTen: data.khachHangTen,
        soDienThoai: data.soDienThoai,
        email: data.email,
        diaChiGiaoHang: data.diaChiGiaoHang,
        soBan: data.soBan,
        ghiChu: data.ghiChu,
        phuongThucThanhToan: data.phuongThucThanhToan as PaymentMethod,
        maVoucher: appliedVoucher?.maVoucher,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          duongLevel: item.sugarLevel,
          daLevel: item.iceLevel,
          toppingIds: item.toppings.map((t) => t.id),
          soLuong: item.quantity,
          ghiChu: item.note,
        })),
      });

      clearCart();

      if (data.phuongThucThanhToan === 'COD') {
        toast.success('Đặt hàng thành công!');
        navigate(`/order-success/${order.id}`);
      } else {
        toast.info('Đang chuyển sang cổng thanh toán...');
        navigate(`/checkout/payment?orderId=${order.id}`);
      }
    } catch {
      toast.error('Không thể hoàn tất đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Giỏ hàng của bạn đang trống</p>
        <Button asChild>
          <Link to="/menu">Về thực đơn</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-5xl">
      <Link to="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại giỏ hàng
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Thanh toán & Đặt hàng</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Order Type Selection */}
            <Card className="p-5">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" /> 1. Hình thức nhận hàng
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('loaiDonHang', 'DELIVERY')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                    selectedLoaiDonHang === 'DELIVERY' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-input hover:bg-accent'
                  }`}
                >
                  <Truck className="h-5 w-5" />
                  <span className="text-xs">Giao hàng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('loaiDonHang', 'TAKEAWAY')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                    selectedLoaiDonHang === 'TAKEAWAY' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-input hover:bg-accent'
                  }`}
                >
                  <Store className="h-5 w-5" />
                  <span className="text-xs">Mang đi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('loaiDonHang', 'AT_TABLE')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                    selectedLoaiDonHang === 'AT_TABLE' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-input hover:bg-accent'
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  <span className="text-xs">Uống tại bàn</span>
                </button>
              </div>
            </Card>

            {/* 2. Customer Contact Info */}
            <Card className="p-5 space-y-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> 2. Thông tin người nhận
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="khachHangTen" className="text-xs">Họ và tên *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="khachHangTen" {...register('khachHangTen')} className="pl-9 text-xs" placeholder="Nguyễn Văn A" />
                  </div>
                  {errors.khachHangTen && <p className="text-xs text-destructive mt-1">{errors.khachHangTen.message}</p>}
                </div>

                <div>
                  <Label htmlFor="soDienThoai" className="text-xs">Số điện thoại *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="soDienThoai" {...register('soDienThoai')} className="pl-9 text-xs" placeholder="0901234567" />
                  </div>
                  {errors.soDienThoai && <p className="text-xs text-destructive mt-1">{errors.soDienThoai.message}</p>}
                </div>
              </div>

              {selectedLoaiDonHang === 'DELIVERY' && (
                <div>
                  <Label htmlFor="diaChiGiaoHang" className="text-xs">Địa chỉ giao hàng chi tiết *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea id="diaChiGiaoHang" {...register('diaChiGiaoHang')} className="pl-9 text-xs min-h-20" placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..." />
                  </div>
                </div>
              )}

              {selectedLoaiDonHang === 'AT_TABLE' && (
                <div>
                  <Label htmlFor="soBan" className="text-xs">Số bàn *</Label>
                  <Input id="soBan" {...register('soBan')} className="mt-1 text-xs" placeholder="VD: Bàn 05" />
                </div>
              )}

              <div>
                <Label htmlFor="ghiChu" className="text-xs">Ghi chú thêm cho tài xế/barista (Tùy chọn)</Label>
                <div className="relative mt-1">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="ghiChu" {...register('ghiChu')} className="pl-9 text-xs" placeholder="Ghi chú thêm..." />
                </div>
              </div>
            </Card>

            {/* 3. Payment Method */}
            <Card className="p-5 space-y-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> 3. Phương thức thanh toán
              </h2>

              <div className="space-y-2">
                {[
                  { id: 'VNPAY', label: 'Thanh toán VNPAY (QR / ATM / Visa)', desc: 'Thanh toán trực tuyến qua cổng VNPAY an toàn', icon: '💳' },
                  { id: 'MOMO', label: 'Ví MoMo', desc: 'Quét mã QR MoMo nhanh chóng', icon: '📱' },
                  { id: 'BANK_TRANSFER', label: 'Chuyển khoản QR Ngân hàng (VietQR)', desc: 'Tự động tạo mã VietQR chính xác', icon: '🏦' },
                  { id: 'COD', label: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt cho shipper hoặc thu ngân', icon: '💵' },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-input hover:bg-accent/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={method.id}
                      {...register('phuongThucThanhToan')}
                      className="mt-1 accent-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span>{method.icon}</span>
                        <span>{method.label}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* Right 1 Col: Summary & Submit */}
          <div className="space-y-6">
            <Card className="p-5 space-y-4">
              <h3 className="font-bold text-base border-b pb-3">Tóm tắt đơn hàng</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs gap-2">
                    <div>
                      <div className="font-semibold">{item.quantity}x {item.productName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.variantName} • Đường {item.sugarLevel} • Đá {item.iceLevel}
                      </div>
                    </div>
                    <div className="font-semibold shrink-0">{formatVND(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tiền hàng</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí giao hàng</span>
                  <span>{formatVND(shippingFee)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>Voucher {appliedVoucher?.maVoucher}</span>
                    <span>-{formatVND(voucherDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-border" />

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-sm">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary">{formatVND(finalTotal)}</span>
              </div>

              <Button type="submit" size="lg" className="w-full font-bold text-base gap-2 mt-4 btn-primary rounded-xl" isLoading={isSubmitting}>
                <ShieldCheck className="h-5 w-5" /> Đặt hàng ngay
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
