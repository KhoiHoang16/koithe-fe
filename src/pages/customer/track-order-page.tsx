import { useState, useId } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Clock,
  Coffee,
  Truck,
  CheckCircle2,
  XCircle,
  PackageCheck,
  AlertCircle,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Store,
  CreditCard,
  PackageSearch,
  RotateCcw,
  Loader2,
  Copy,
  Receipt,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { orderApi } from '@/features/orders/api/order-api';
import { formatCurrency, formatDateTime } from '@/shared/libs/utils';
import type { Order, OrderStatus } from '@/shared/types/order.types';
import { ApiError } from '@/shared/api/http-client';

interface TimelineStepDef {
  key: OrderStatus;
  label: string;
  getDescription: (order: Order) => string;
  icon: React.ElementType;
}

const TIMELINE_STEPS: TimelineStepDef[] = [
  {
    key: 'PENDING',
    label: 'Chờ xác nhận',
    getDescription: () => 'Đơn hàng đã được gửi thành công, đang chờ hệ thống tiếp nhận',
    icon: Clock,
  },
  {
    key: 'CONFIRMED',
    label: 'Đã thanh toán',
    getDescription: () => 'Đơn hàng đã được xác nhận thanh toán và tiếp nhận vào quầy',
    icon: CheckCircle2,
  },
  {
    key: 'PREPARING',
    label: 'Đang pha chế',
    getDescription: () => 'Barista đang chuẩn bị đồ uống theo đúng hương vị của bạn',
    icon: Coffee,
  },
  {
    key: 'SHIPPING',
    label: 'Sẵn sàng',
    getDescription: (order: Order) => {
      if (order.loaiDonHang === 'DELIVERY') {
        return 'Đồ uống đã sẵn sàng để giao tới bạn';
      }
      if (order.loaiDonHang === 'AT_TABLE') {
        return 'Đồ uống đã sẵn sàng để phục vụ tại bàn';
      }
      return 'Đồ uống đã sẵn sàng tại quầy, mời bạn tới nhận món';
    },
    icon: Truck,
  },
  {
    key: 'COMPLETED',
    label: 'Đã hoàn thành',
    getDescription: () => 'Đơn hàng đã được giao nhận thành công. Chúc bạn thưởng thức ngon miệng!',
    icon: PackageCheck,
  },
];

const STEP_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'COMPLETED'];

const PHONE_REGEX = /^0\d{9}$/;

export function TrackOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderCode, setOrderCode] = useState(initialCode);
  const [phone, setPhone] = useState(initialPhone);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [lastSearched, setLastSearched] = useState<{ code: string; phone: string } | null>(null);

  const codeInputId = useId();
  const phoneInputId = useId();

  const trackMutation = useMutation<Order, ApiError, { code: string; phone: string }>({
    mutationFn: ({ code, phone: phoneParam }) => orderApi.trackOrder(code, phoneParam),
    onSuccess: (_data, variables) => {
      setLastSearched(variables);
      // Chỉ giữ mã đơn trên URL, không thêm số điện thoại nhận hàng.
      setSearchParams({ code: variables.code }, { replace: true });
      toast.success('Đã tìm thấy thông tin đơn hàng!');
    },
    onError: (error, variables) => {
      setLastSearched(variables);
      if (error.code === 404 || error.message?.toLowerCase().includes('không tìm thấy')) {
        toast.error('Không tìm thấy đơn hàng với thông tin đã nhập.');
      } else if (error.code === 400) {
        toast.error(error.message || 'Thông tin tra cứu không hợp lệ.');
      } else {
        toast.error('Có lỗi xảy ra khi tra cứu. Vui lòng thử lại sau.');
      }
    },
  });

  const validateForm = (): boolean => {
    let isValid = true;
    const cleanCode = orderCode.trim();
    const cleanPhone = phone.trim();

    if (!cleanCode) {
      setCodeError('Vui lòng nhập mã đơn hàng');
      isValid = false;
    } else {
      setCodeError(null);
    }

    if (!cleanPhone) {
      setPhoneError('Vui lòng nhập số điện thoại');
      isValid = false;
    } else if (!PHONE_REGEX.test(cleanPhone)) {
      setPhoneError('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0');
      isValid = false;
    } else {
      setPhoneError(null);
    }

    return isValid;
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (trackMutation.isPending || !validateForm()) return;
    trackMutation.mutate({
      code: orderCode.trim(),
      phone: phone.trim(),
    });
  };

  const handleReset = () => {
    setOrderCode('');
    setPhone('');
    setCodeError(null);
    setPhoneError(null);
    setLastSearched(null);
    setSearchParams({});
    trackMutation.reset();
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Đã sao chép mã đơn hàng');
    } catch {
      toast.error('Không thể sao chép mã đơn hàng. Vui lòng sao chép thủ công.');
    }
  };

  const order = trackMutation.data;
  const isCancelled = order?.trangThai === 'CANCELLED';
  const currentStepIndex = order ? STEP_ORDER.indexOf(order.trangThai) : -1;

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed py-10 sm:py-14 animate-fade-in flex flex-col justify-center">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 shadow-sm mb-3">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            Tra cứu đơn hàng
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Nhập mã đơn hàng và số điện thoại nhận hàng để kiểm tra trạng thái mới nhất
          </p>
        </div>

        {/* Search Card */}
        <Card className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 shadow-md">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSearch} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor={codeInputId} className="text-xs font-semibold text-stone-700">
                    Mã đơn hàng <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id={codeInputId}
                    placeholder="VD: DH-2026-006 hoặc DH001"
                    value={orderCode}
                    disabled={trackMutation.isPending}
                    aria-invalid={!!codeError}
                    onChange={(e) => {
                      setOrderCode(e.target.value);
                      if (codeError) setCodeError(null);
                    }}
                    className={`h-11 rounded-xl border bg-stone-50/50 text-xs sm:text-sm transition-colors ${
                      codeError ? 'border-rose-400 focus-visible:ring-rose-400' : 'border-stone-200'
                    }`}
                  />
                  {codeError && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {codeError}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={phoneInputId} className="text-xs font-semibold text-stone-700">
                    Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id={phoneInputId}
                    type="tel"
                    placeholder="VD: 0901234567"
                    value={phone}
                    disabled={trackMutation.isPending}
                    aria-invalid={!!phoneError}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    className={`h-11 rounded-xl border bg-stone-50/50 text-xs sm:text-sm transition-colors ${
                      phoneError ? 'border-rose-400 focus-visible:ring-rose-400' : 'border-stone-200'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  id="btn-track-order"
                  type="submit"
                  disabled={trackMutation.isPending}
                  className="flex-1 h-11 font-bold text-sm rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer transition-all active:scale-[0.99]"
                >
                  {trackMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tra cứu thông tin...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Kiểm tra đơn hàng
                    </>
                  )}
                </Button>

                {(order || trackMutation.isError) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={trackMutation.isPending}
                    className="h-11 rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-xs sm:text-sm"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Tra cứu đơn khác
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {!order && trackMutation.isIdle && (
          <p className="mt-6 text-center text-sm text-stone-600" role="status">
            Chưa có thông tin đơn hàng. Vui lòng nhập mã đơn và số điện thoại để tra cứu.
          </p>
        )}

        {/* Error / Not Found State */}
        {trackMutation.isError && (
          <Card className="mt-6 animate-fade-in bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-md">
            <CardContent className="p-6 sm:p-8 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 text-rose-500 mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              {trackMutation.error?.code === 404 ||
              trackMutation.error?.message?.toLowerCase().includes('không tìm thấy') ? (
                <>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    Không tìm thấy đơn hàng
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                    Không tìm thấy đơn hàng khớp với mã{' '}
                    <span className="font-mono font-semibold text-stone-900">
                      {lastSearched?.code}
                    </span>{' '}
                    và số điện thoại{' '}
                    <span className="font-semibold text-stone-900">{lastSearched?.phone}</span>.
                  </p>
                  <div className="text-xs text-stone-500 bg-stone-50 rounded-xl p-3 max-w-md mx-auto text-left space-y-1">
                    <p className="font-medium text-stone-700">Mẹo kiểm tra:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-stone-500">
                      <li>Kiểm tra lại chữ hoa/thường trong mã đơn (ví dụ: DH-2026-001).</li>
                      <li>Đảm bảo số điện thoại đúng với số đã dùng khi đặt hàng.</li>
                      <li>Nếu đơn vừa mới đặt, vui lòng đợi 1-2 phút rồi thử lại.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-base sm:text-lg font-bold text-rose-700">
                    Không thể tra cứu đơn hàng
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                    {trackMutation.error?.code === 400
                      ? 'Thông tin tra cứu không hợp lệ. Vui lòng kiểm tra mã đơn và số điện thoại.'
                      : 'Hiện chưa thể tra cứu đơn hàng. Vui lòng kiểm tra kết nối và thử lại sau.'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Result Found */}
        {order && (
          <div className="mt-6 space-y-6 animate-fade-in">
            {/* Main Order Card */}
            <Card className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 shadow-md overflow-hidden">
              {/* Header: Code, Badges, Date */}
              <div className="p-6 sm:p-8 border-b border-stone-100 bg-linear-to-r from-stone-50/50 to-white">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
                        Mã đơn hàng
                      </span>
                      <button
                        type="button"
                        onClick={() => copyCode(order.maDonHang)}
                        title="Sao chép mã đơn hàng"
                        className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h2 className="font-mono text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                      #{order.maDonHang}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    {isCancelled ? (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Đã hủy
                      </Badge>
                    ) : order.trangThai === 'COMPLETED' ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                        <PackageCheck className="w-3.5 h-3.5" />
                        Hoàn thành
                      </Badge>
                    ) : order.trangThai === 'PREPARING' ? (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5" />
                        Đang pha chế
                      </Badge>
                    ) : order.trangThai === 'SHIPPING' ? (
                      <Badge className="bg-sky-100 text-sky-800 border-sky-200 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        Sẵn sàng
                      </Badge>
                    ) : order.trangThai === 'CONFIRMED' ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã thanh toán
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Chờ xác nhận
                      </Badge>
                    )}

                    {/* Service Type Badge */}
                    {order.loaiDonHang === 'DELIVERY' ? (
                      <Badge variant="outline" className="border-stone-300 text-stone-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-stone-500" />
                        Giao tận nơi
                      </Badge>
                    ) : order.loaiDonHang === 'AT_TABLE' ? (
                      <Badge variant="outline" className="border-amber-300 bg-amber-50/50 text-amber-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-amber-600" />
                        Tại bàn {order.soBan || ''}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-stone-300 text-stone-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                        Đến lấy mang về
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Thời gian đặt: {formatDateTime(order.createdAt)}</span>
                </div>
              </div>

              {/* Progress Timeline or Cancelled Alert */}
              <div className="p-6 sm:p-8 border-b border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  Tiến trình đơn hàng
                </h3>

                {isCancelled ? (
                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-4 text-rose-900">
                    <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm sm:text-base">Đơn hàng này đã bị hủy</h4>
                      <p className="text-xs sm:text-sm text-rose-700 leading-relaxed">
                        Đơn hàng của bạn đã bị hủy trên hệ thống. Nếu có thắc mắc hoặc cần hoàn tiền, vui lòng liên hệ hotline chăm sóc khách hàng để được xử lý nhanh nhất.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Desktop / Tablet Timeline */}
                    <div className="relative">
                      <div className="space-y-6">
                        {TIMELINE_STEPS.map((step, index) => {
                          const Icon = step.icon;
                          const isDone = currentStepIndex > index;
                          const isCurrent = currentStepIndex === index;
                          const isUpcoming = currentStepIndex < index;

                          return (
                            <div key={step.key} className="flex items-start gap-4 relative">
                              {/* Connector line between steps */}
                              {index < TIMELINE_STEPS.length - 1 && (
                                <div
                                  className={`absolute left-5 top-10 bottom-0 w-0.5 -mb-6 transition-colors ${
                                    currentStepIndex > index ? 'bg-primary' : 'bg-stone-200'
                                  }`}
                                />
                              )}

                              {/* Circle Icon */}
                              <div
                                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  isDone
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : isCurrent
                                    ? 'bg-primary/10 text-primary ring-4 ring-primary/20 font-bold'
                                    : 'bg-stone-100 text-stone-400'
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                  <Icon className="w-5 h-5" />
                                )}
                              </div>

                              {/* Text info */}
                              <div className="pt-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4
                                    className={`text-sm font-bold ${
                                      isDone || isCurrent ? 'text-stone-900' : 'text-stone-400'
                                    }`}
                                  >
                                    {step.label}
                                  </h4>
                                  {isCurrent && (
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-xs mt-0.5 leading-relaxed ${
                                    isCurrent
                                      ? 'text-stone-700 font-medium'
                                      : isUpcoming
                                      ? 'text-stone-400'
                                      : 'text-stone-500'
                                  }`}
                                >
                                  {step.getDescription(order)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recipient & Delivery Information */}
              <div className="p-6 sm:p-8 border-b border-stone-100 bg-stone-50/40">
                <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Thông tin nhận hàng
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <span className="text-stone-500 flex items-center gap-1.5 text-xs">
                      <User className="w-3.5 h-3.5 text-stone-400" /> Người nhận:
                    </span>
                    <p className="font-semibold text-stone-900">
                      {order.khachHangTen || 'Khách vãng lai'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-500 flex items-center gap-1.5 text-xs">
                      <Phone className="w-3.5 h-3.5 text-stone-400" /> Số điện thoại:
                    </span>
                    <p className="font-mono font-semibold text-stone-900">
                      {order.soDienThoai}
                    </p>
                  </div>

                  {order.loaiDonHang === 'DELIVERY' && order.diaChiGiaoHang && (
                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-stone-500 flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" /> Địa chỉ giao hàng:
                      </span>
                      <p className="font-medium text-stone-900 leading-relaxed">
                        {order.diaChiGiaoHang}
                      </p>
                    </div>
                  )}

                  {order.loaiDonHang === 'AT_TABLE' && order.soBan && (
                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-stone-500 flex items-center gap-1.5 text-xs">
                        <Store className="w-3.5 h-3.5 text-stone-400" /> Phục vụ tại bàn:
                      </span>
                      <p className="font-bold text-amber-900">
                        Bàn {order.soBan}
                      </p>
                    </div>
                  )}

                  {order.ghiChu && (
                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-stone-500 text-xs">Ghi chú đơn hàng:</span>
                      <p className="italic text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200">
                        "{order.ghiChu}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items List */}
              <div className="p-6 sm:p-8 border-b border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-primary" />
                  Danh sách món ({order.chiTietList.length} món)
                </h3>

                <div className="divide-y divide-stone-100">
                  {order.chiTietList.map((item, idx) => (
                    <div key={item.id ?? idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-stone-900 text-xs sm:text-sm">
                            {item.productName}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-md border-stone-200 text-stone-600">
                            Size {item.variantName || 'M'}
                          </Badge>
                          <span className="text-xs font-semibold text-primary">
                            x{item.soLuong}
                          </span>
                        </div>

                        {/* Options: Sugar, Ice */}
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 flex-wrap">
                          <span>Đường: {item.duongLevel || '70%'}</span>
                          <span>•</span>
                          <span>Đá: {item.daLevel || '50%'}</span>
                        </div>

                        {/* Toppings */}
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="text-[11px] text-stone-600 bg-stone-50 p-1.5 rounded-lg space-y-0.5">
                            <span className="font-medium text-stone-500">Topping: </span>
                            {item.toppings.map((tp, tIdx) => (
                              <span key={tp.id ?? tIdx} className="inline-block mr-2">
                                +{tp.tenTopping} ({formatCurrency(tp.giaBan)})
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Item note */}
                        {item.ghiChu && (
                          <p className="text-[11px] italic text-stone-400">
                            Ghi chú: {item.ghiChu}
                          </p>
                        )}
                      </div>

                      {/* Line total */}
                      <div className="text-right shrink-0">
                        <span className="font-bold text-stone-900 text-xs sm:text-sm">
                          {formatCurrency(item.thanhTien)}
                        </span>
                        {item.soLuong > 1 && (
                          <p className="text-[10px] text-stone-400">
                            {formatCurrency(item.donGia)} / ly
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-6 sm:p-8 bg-stone-50/60">
                <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Chi tiết thanh toán
                </h3>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Tạm tính tiền hàng</span>
                    <span className="font-medium">{formatCurrency(order.tongTienHang)}</span>
                  </div>

                  {order.giamGia > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Giảm giá khuyến mãi</span>
                      <span className="font-medium">-{formatCurrency(order.giamGia)}</span>
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-stone-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-stone-900 text-sm sm:text-base">
                        Tổng thanh toán
                      </span>
                      {!isCancelled && order.trangThai !== 'PENDING' && (
                        <div className="mt-1">
                          <Badge className="bg-emerald-100 text-emerald-800 border-none text-[11px] px-2 py-0.5">
                            Đã thanh toán
                          </Badge>
                        </div>
                      )}
                    </div>
                    <span className="font-black text-primary text-lg sm:text-xl">
                      {formatCurrency(order.tongThanhToan)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                variant="outline"
                asChild
                className="w-full sm:w-auto h-11 rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-xs sm:text-sm"
              >
                <Link to="/menu">
                  Tiếp tục đặt món
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
