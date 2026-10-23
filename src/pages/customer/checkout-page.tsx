import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Truck,
  Store,
  CreditCard,
  ShieldCheck,
  MapPin,
  User,
  Phone,
  FileText,
  Clock,
  QrCode,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useCartStore } from '@/shared/stores/cart-store';
import { useAuthStore } from '@/shared/stores/auth-store';
import { orderApi } from '@/features/orders/api/order-api';
import { paymentApi, type PaymentMethodCode } from '@/features/payment/api/payment-api';
import { CheckoutStepper } from '@/components/common/checkout-stepper';
import type { ServiceType } from '@/shared/types/order.types';

const STORES = [
  {
    id: 'store-1',
    name: 'Koi Thé - 120 Ngô Đức Kế, Bến Nghé, Quận 1',
    address: '120 Ngô Đức Kế, P. Bến Nghé, Quận 1, TP. HCM',
    hours: '08:30 – 22:00',
  },
  {
    id: 'store-2',
    name: 'Koi Thé - 220 Phan Xích Long, Phú Nhuận',
    address: '220 Phan Xích Long, Phường 2, Q. Phú Nhuận, TP. HCM',
    hours: '08:30 – 22:00',
  },
  {
    id: 'store-3',
    name: 'Koi Thé - Vincom Landmark 81, Bình Thạnh',
    address: 'Tầng B1, 720A Điện Biên Phủ, P. 22, Q. Bình Thạnh, TP. HCM',
    hours: '09:00 – 22:00',
  },
  {
    id: 'store-4',
    name: 'Koi Thé - Saigon Centre, 65 Lê Lợi, Quận 1',
    address: 'Tầng B2, 65 Lê Lợi, P. Bến Nghé, Quận 1, TP. HCM',
    hours: '09:30 – 21:30',
  },
];

const PICKUP_TIMES = [
  'Sớm nhất có thể (~15-20 phút)',
  'Sau 30 phút',
  'Sau 45 phút',
  'Sau 1 tiếng',
];

const SERVICE_TYPE_MAP: Record<'DELIVERY' | 'TAKEAWAY', ServiceType> = {
  DELIVERY: 'GIAO_HANG',
  TAKEAWAY: 'MANG_VE',
};

const PAYMENT_METHOD_MAP: Record<string, PaymentMethodCode> = {
  VNPAY: 'VNPAY',
  MOMO: 'MOMO',
  BANK_TRANSFER: 'CHUYEN_KHOAN_QR',
  COD: 'TIEN_MAT',
};

const checkoutSchema = z
  .object({
    loaiDonHang: z.enum(['TAKEAWAY', 'DELIVERY']),
    khachHangTen: z.string().min(2, 'Vui lòng nhập họ tên đầy đủ'),
    soDienThoai: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
    email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')),
    diaChiGiaoHang: z.string().optional(),
    chiNhanh: z.string().optional(),
    thoiGianNhan: z.string().optional(),
    ghiChu: z.string().optional(),
    phuongThucThanhToan: z.enum(['COD', 'VNPAY', 'MOMO', 'BANK_TRANSFER']),
  })
  .refine(
    (data) => {
      if (data.loaiDonHang === 'DELIVERY' && (!data.diaChiGiaoHang || data.diaChiGiaoHang.trim().length < 5)) {
        return false;
      }
      return true;
    },
    {
      message: 'Vui lòng nhập địa chỉ giao hàng cụ thể (tối thiểu 5 ký tự)',
      path: ['diaChiGiaoHang'],
    },
  );

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
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
      loaiDonHang: 'TAKEAWAY',
      khachHangTen: user?.hoTen || '',
      soDienThoai: user?.soDienThoai || '',
      email: user?.email || '',
      diaChiGiaoHang: '',
      chiNhanh: STORES[0].name,
      thoiGianNhan: PICKUP_TIMES[0],
      ghiChu: '',
      phuongThucThanhToan: user ? 'VNPAY' : 'COD',
    },
  });

  const selectedLoaiDonHang = watch('loaiDonHang');
  const selectedPaymentMethod = watch('phuongThucThanhToan');
  const selectedThoiGianNhan = watch('thoiGianNhan');

  // Tính phí ship: Miễn phí nếu là Đến lấy, hoặc đơn giao hàng >= 150.000₫
  const isFreeShipDelivery = subtotal >= 150000;
  const shippingFee = selectedLoaiDonHang === 'TAKEAWAY' ? 0 : isFreeShipDelivery ? 0 : 15000;
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

    if (!user && data.phuongThucThanhToan !== 'COD') {
      toast.error('Vui lòng đăng nhập để thanh toán online');
      return;
    }

    setIsSubmitting(true);

    try {
      // Đã đăng nhập: backend tự lấy giỏ của tài khoản. Chỉ guest mới truyền cartToken.
      const cartToken =
        !accessToken && typeof localStorage !== 'undefined'
          ? localStorage.getItem('guest_cart_token')
          : null;
      const serviceType = SERVICE_TYPE_MAP[data.loaiDonHang] ?? 'MANG_VE';

      // Tạo chuỗi thông tin nhận hàng lưu vào backend
      const finalDeliveryAddress =
        data.loaiDonHang === 'DELIVERY'
          ? data.diaChiGiaoHang
          : `[Đến lấy] Chi nhánh: ${data.chiNhanh || STORES[0].name} | Giờ hẹn: ${data.thoiGianNhan || 'Sớm nhất'}`;

      const order = await orderApi.createOrder({
        cartToken,
        serviceType,
        channel: 'WEBSITE',
        tenNguoiNhan: data.khachHangTen,
        soDienThoaiNguoiNhan: data.soDienThoai,
        diaChiGiaoHang: finalDeliveryAddress,
      });

      const payment = user
        ? await paymentApi.create({
            maDonHang: order.id,
            phuongThucThanhToan: PAYMENT_METHOD_MAP[data.phuongThucThanhToan] ?? 'TIEN_MAT',
            soTien: order.tongThanhToan,
          })
        : await paymentApi.createGuestCash({
            maDonHang: order.id,
            cartToken: cartToken ?? '',
            soTien: order.tongThanhToan,
          });

      await clearCart();

      if (data.phuongThucThanhToan === 'COD') {
        toast.success('Đặt hàng thành công!');
        navigate(`/order-success/${order.id}`);
      } else if (payment.redirectUrl) {
        if (data.phuongThucThanhToan === 'BANK_TRANSFER') {
          navigate(`/checkout/payment?orderId=${order.id}`);
        } else {
          window.location.href = payment.redirectUrl;
        }
      } else {
        toast.info('Đang chuyển sang cổng thanh toán...');
        navigate(`/checkout/payment?orderId=${order.id}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : 'Không thể hoàn tất đặt hàng. Vui lòng thử lại.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed py-16 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-8 text-center max-w-md mx-auto shadow-sm">
          <p className="text-muted-foreground mb-4">Giỏ hàng của bạn đang trống</p>
          <Button asChild className="rounded-xl">
            <Link to="/menu">Về thực đơn</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed pb-20 animate-fade-in">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <CheckoutStepper currentStep={2} />

        <div className="mt-4 mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-stone-500 hover:text-primary transition-colors mb-1.5"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại giỏ hàng
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">
            Thanh toán & Đặt hàng
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột trái (2 cols): Thông tin nhận hàng & Thanh toán */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Chọn hình thức nhận hàng (Đến lấy vs Giao hàng) */}
              <Card className="p-5 bg-white/95 backdrop-blur-md border-white/80 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold flex items-center gap-2 text-stone-900">
                    <Store className="h-5 w-5 text-primary" /> 1. Hình thức nhận hàng
                  </h2>
                  <span className="text-[11px] text-stone-500 font-medium">Chọn phương thức phù hợp</span>
                </div>

                {/* 2 Tabs chuyển đổi trực quan */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-stone-100/80 rounded-2xl border border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => setValue('loaiDonHang', 'TAKEAWAY')}
                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedLoaiDonHang === 'TAKEAWAY'
                        ? 'bg-white text-stone-900 shadow-sm border border-stone-200/70'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Store
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        selectedLoaiDonHang === 'TAKEAWAY' ? 'text-primary' : 'text-stone-400'
                      }`}
                    />
                    <span>Đến lấy tại quán</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue('loaiDonHang', 'DELIVERY')}
                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedLoaiDonHang === 'DELIVERY'
                        ? 'bg-white text-stone-900 shadow-sm border border-stone-200/70'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Truck
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        selectedLoaiDonHang === 'DELIVERY' ? 'text-primary' : 'text-stone-400'
                      }`}
                    />
                    <span>Giao hàng tận nơi</span>
                  </button>
                </div>

                {/* Chi tiết theo từng hình thức */}
                {selectedLoaiDonHang === 'TAKEAWAY' ? (
                  <div className="space-y-4 pt-1 animate-fade-in">
                    {/* Chọn chi nhánh */}
                    <div className="space-y-1.5">
                      <Label htmlFor="chiNhanh" className="text-xs font-semibold text-stone-700">
                        Chi nhánh Koi Thé chuẩn bị món *
                      </Label>
                      <select
                        id="chiNhanh"
                        {...register('chiNhanh')}
                        className="w-full h-11 px-3 text-xs rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-stone-800 font-medium"
                      >
                        {STORES.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.hours})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        Đơn sẽ được gửi trực tiếp đến màn hình Barista tại chi nhánh này.
                      </p>
                    </div>

                    {/* Thời gian nhận món */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" /> Thời gian lấy đồ uống
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PICKUP_TIMES.map((time) => {
                          const isSelected = selectedThoiGianNhan === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setValue('thoiGianNhan', time)}
                              className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold text-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                  : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-1 animate-fade-in">
                    {/* Địa chỉ giao hàng chi tiết */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="diaChiGiaoHang" className="text-xs font-semibold text-stone-700">
                          Địa chỉ nhận hàng chi tiết *
                        </Label>
                        {isFreeShipDelivery && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                            🎉 Miễn phí giao hàng
                          </Badge>
                        )}
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                        <Textarea
                          id="diaChiGiaoHang"
                          {...register('diaChiGiaoHang')}
                          className="pl-10 text-xs min-h-20 rounded-xl border-stone-200 bg-stone-50/70 focus:bg-white"
                          placeholder="Số nhà, tên tòa nhà/tầng, tên đường, Phường/Xã, Quận/Huyện..."
                        />
                      </div>
                      {errors.diaChiGiaoHang && (
                        <p className="text-xs text-destructive mt-1">{errors.diaChiGiaoHang.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Banner gợi ý gọi món tại bàn */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                  <QrCode className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Bạn đang ngồi tại quán?</strong> Hãy dùng camera điện thoại quét mã QR dán trên bàn để gọi món tại chỗ nhanh chóng mà không cần qua bước đặt hàng này!
                  </p>
                </div>
              </Card>

              {/* 2. Thông tin liên hệ nhận hàng */}
              <Card className="p-5 space-y-4 bg-white/95 backdrop-blur-md border-white/80 rounded-2xl shadow-xs">
                <h2 className="text-base font-bold flex items-center gap-2 text-stone-900">
                  <User className="h-5 w-5 text-primary" /> 2. Thông tin người nhận
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="khachHangTen" className="text-xs font-semibold text-stone-700">
                      Họ và tên *
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        id="khachHangTen"
                        {...register('khachHangTen')}
                        className="pl-9 text-xs rounded-xl border-stone-200"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    {errors.khachHangTen && (
                      <p className="text-xs text-destructive mt-1">{errors.khachHangTen.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="soDienThoai" className="text-xs font-semibold text-stone-700">
                      Số điện thoại *
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        id="soDienThoai"
                        {...register('soDienThoai')}
                        className="pl-9 text-xs rounded-xl border-stone-200"
                        placeholder="0901234567"
                      />
                    </div>
                    {errors.soDienThoai && (
                      <p className="text-xs text-destructive mt-1">{errors.soDienThoai.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="ghiChu" className="text-xs font-semibold text-stone-700">
                    Ghi chú thêm cho barista / tài xế (Tùy chọn)
                  </Label>
                  <div className="relative mt-1">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
                      id="ghiChu"
                      {...register('ghiChu')}
                      className="pl-9 text-xs rounded-xl border-stone-200"
                      placeholder="VD: Không lấy ống hút nhựa, gọi trước khi đến..."
                    />
                  </div>
                </div>
              </Card>

              {/* 3. Phương thức thanh toán */}
              <Card className="p-5 space-y-3 bg-white/95 backdrop-blur-md border-white/80 rounded-2xl shadow-xs">
                <h2 className="text-base font-bold flex items-center gap-2 text-stone-900">
                  <CreditCard className="h-5 w-5 text-primary" /> 3. Phương thức thanh toán
                </h2>

                <div className="space-y-2">
                  {[
                    {
                      id: 'VNPAY',
                      label: 'Cổng VNPAY (QR Code / Thẻ ATM / Visa / Mastercard)',
                      desc: 'Thanh toán trực tuyến bảo mật qua cổng VNPAY',
                      icon: '💳',
                    },
                    {
                      id: 'MOMO',
                      label: 'Ví điện tử MoMo',
                      desc: 'Quét mã QR qua ứng dụng MoMo siêu tốc',
                      icon: '📱',
                    },
                    {
                      id: 'BANK_TRANSFER',
                      label: 'Chuyển khoản Ngân hàng (VietQR)',
                      desc: 'Hệ thống tự động hiển thị mã QR VietQR kèm số tiền chính xác',
                      icon: '🏦',
                    },
                    {
                      id: 'COD',
                      label:
                        selectedLoaiDonHang === 'TAKEAWAY'
                          ? 'Thanh toán tiền mặt tại quầy khi đến nhận món'
                          : 'Thanh toán khi nhận hàng (COD)',
                      desc:
                        selectedLoaiDonHang === 'TAKEAWAY'
                          ? 'Trả tiền mặt trực tiếp cho thu ngân tại chi nhánh'
                          : 'Trả tiền mặt cho tài xế giao hàng',
                      icon: '💵',
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-primary bg-primary/5 shadow-xs'
                          : 'border-stone-200/80 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={method.id}
                        disabled={!user && method.id !== 'COD'}
                        {...register('phuongThucThanhToan')}
                        className="mt-1 accent-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                          <span>{method.icon}</span>
                          <span>{method.label}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {!user && method.id !== 'COD' ? 'Đăng nhập để sử dụng phương thức này' : method.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            {/* Cột phải (1 col): Tóm tắt đơn hàng & Nút đặt */}
            <div className="space-y-6">
              <Card className="p-5 space-y-4 bg-white/95 backdrop-blur-md border-white/80 rounded-2xl shadow-sm sticky top-24">
                <h3 className="font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
                  Tóm tắt đơn hàng
                </h3>

                {/* Danh sách món trong giỏ */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs gap-2 pb-2 border-b border-stone-50">
                      <div>
                        <div className="font-bold text-stone-900">
                          {item.quantity}x {item.productName}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {item.variantName} • Đường {item.sugarLevel} • Đá {item.iceLevel}
                        </div>
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="text-[10px] text-primary mt-0.5">
                            + {item.toppings.map((t) => t.tenTopping).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-stone-900 shrink-0">
                        {formatVND(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between text-stone-600">
                    <span>Hình thức</span>
                    <span className="font-semibold text-stone-900">
                      {selectedLoaiDonHang === 'TAKEAWAY' ? 'Đến lấy mang về' : 'Giao tận nơi'}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Tiền hàng</span>
                    <span className="font-semibold text-stone-900">{formatVND(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Phí vận chuyển</span>
                    <span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-700 font-bold' : 'text-stone-900'}`}>
                      {shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}
                    </span>
                  </div>

                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-primary font-bold">
                      <span>Voucher {appliedVoucher?.maVoucher}</span>
                      <span>-{formatVND(voucherDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-stone-200" />

                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-bold text-sm text-stone-900">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-primary">{formatVND(finalTotal)}</span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-bold text-sm gap-2 mt-2 rounded-xl py-6 cursor-pointer"
                  isLoading={isSubmitting}
                >
                  <ShieldCheck className="h-5 w-5" /> Đặt hàng ngay
                </Button>

                <p className="text-[11px] text-center text-stone-400">
                  Nhấn đặt hàng đồng nghĩa bạn đồng ý với điều khoản dịch vụ Koi Thé
                </p>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
