import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Ticket,
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  FileText,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { ConfirmDeleteDialog } from '@/shared/components/overlay/confirm-delete-dialog';
import { CheckoutStepper } from '@/components/common/checkout-stepper';
import { useCartStore } from '@/shared/stores/cart-store';
import { promotionApi } from '@/features/promotions/api/promotion-api';
import { catalogApi, MOCK_PRODUCTS } from '@/features/catalog/api/catalog-api';
import type { Product } from '@/shared/types/catalog.types';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyVoucher,
    appliedVoucher,
    voucherDiscount,
    getSubtotal,
    getTotal,
  } = useCartStore();

  const [voucherCode, setVoucherCode] = useState('');
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const subtotal = getSubtotal();
  const shippingFee = subtotal > 0 ? 15000 : 0;
  const finalTotal = getTotal(shippingFee);

  // Lấy danh sách sản phẩm gợi ý
  const { data: allProducts } = useQuery({
    queryKey: ['cart-recommended-products'],
    queryFn: () => catalogApi.getProducts(),
  });

  // Chọn 4 sản phẩm đề xuất (loại trừ các món đã có trong giỏ hàng nếu có thể)
  const recommendedProducts = useMemo(() => {
    const list = allProducts && allProducts.length > 0 ? allProducts : MOCK_PRODUCTS;
    const inCartIds = new Set(items.map((i) => i.productId));
    const available = list.filter((p) => !inCartIds.has(p.id));
    return available.length >= 4 ? available.slice(0, 4) : list.slice(0, 4);
  }, [allProducts, items]);

  const handleApplyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã ưu đãi');
      return;
    }
    setIsValidatingVoucher(true);
    try {
      const res = await promotionApi.validateVoucher(code, subtotal);
      if (res.valid && res.voucher) {
        applyVoucher(res.voucher, res.giamGia);
        setVoucherCode(code);
        toast.success(res.message || 'Đã áp dụng mã ưu đãi thành công!');
      } else {
        toast.error(res.message || 'Mã ưu đãi không hợp lệ hoặc chưa đủ điều kiện đơn hàng');
      }
    } catch {
      toast.error('Không thể kiểm tra mã ưu đãi lúc này');
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    applyVoucher(null, 0);
    setVoucherCode('');
    toast.info('Đã hủy áp dụng mã ưu đãi');
  };

  // Nút (+) thêm nhanh món gợi ý vào giỏ hàng
  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariant =
      product.bienTheList && product.bienTheList.length > 0
        ? product.bienTheList[0]
        : { id: 101, tenBienThe: 'Size M', giaBan: product.giaTu || 45000 };

    addItem({
      productId: product.id,
      productName: product.tenSanPham,
      productImage: product.hinhAnh,
      variantId: defaultVariant.id,
      variantName: defaultVariant.tenBienThe,
      price: defaultVariant.giaBan,
      sugarLevel: '70%',
      iceLevel: '50%',
      toppings: [],
      quantity: 1,
    });

    toast.success(`Đã thêm 1x ${product.tenSanPham} vào giỏ hàng!`);
  };

  // Giỏ hàng trống
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed pb-24 animate-fade-in flex flex-col justify-between">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <CheckoutStepper currentStep={1} />
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-8 sm:p-14 text-center mt-6 shadow-sm max-w-2xl mx-auto">
            <EmptyState
              icon="🧋"
              title="Giỏ hàng của bạn đang trống"
              description="Hãy khám phá thực đơn trà sữa thơm ngon từ búp trà tươi hảo hạng của KOI Thé nhé!"
              action={
                <Button size="lg" asChild className="mt-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-6 h-12 shadow-sm font-bold">
                  <Link to="/menu">
                    <ShoppingBag className="h-4 w-4" /> Khám phá thực đơn ngay
                  </Link>
                </Button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed pb-24 lg:pb-16 animate-fade-in flex flex-col justify-between">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-6xl">
        {/* 1. Header Order Process Stepper */}
        <CheckoutStepper currentStep={1} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4 sm:mt-6">
          {/* =========================================================================
              LEFT COLUMN: Cart Items List & "Có thể bạn cũng thích"
             ========================================================================= */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header & Clear Button */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">
                  Giỏ hàng ({items.length} món)
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kiểm tra đơn hàng trước khi tiến hành thanh toán
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold gap-1.5 rounded-xl transition-colors cursor-pointer"
                onClick={() => setIsClearModalOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Xóa tất cả
              </Button>
            </div>

            {/* List of Cart Items */}
            <div className="space-y-3">
              {items.map((item) => {
                const toppingSum = item.toppings.reduce((sum, t) => sum + t.giaBan, 0);
                const itemUnitPrice = item.price + toppingSum;
                const itemTotal = itemUnitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-4 sm:p-5 shadow-xs transition-all hover:border-stone-300"
                  >
                    <div className="flex gap-4 sm:gap-5 items-start">
                      {/* Product Image Square Container */}
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-[#F8F5F1] p-1.5 shrink-0 flex items-center justify-center overflow-hidden border border-stone-100">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-contain drop-shadow-xs"
                          />
                        ) : (
                          <span className="text-3xl">🧋</span>
                        )}
                        <span className="absolute bottom-1 left-1 bg-white/90 text-stone-700 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs border border-stone-200/60">
                          {item.variantName}
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          {/* Title & Delete Action */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                              {item.productName}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl shrink-0 -mt-1 -mr-1 h-7 w-7 transition-colors cursor-pointer"
                              onClick={() => removeItem(item.id)}
                              title="Xóa món"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Customization Pills (Size, Sugar, Ice) */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold px-2 py-0.5 rounded-md">
                              {item.variantName}
                            </span>
                            <span className="bg-stone-100 text-stone-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                              Đường: {item.sugarLevel}
                            </span>
                            <span className="bg-stone-100 text-stone-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                              Đá: {item.iceLevel}
                            </span>
                          </div>

                          {/* Toppings Selected */}
                          {item.toppings.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {item.toppings.map((t) => (
                                <span
                                  key={t.id}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-md"
                                >
                                  <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                                  {t.tenTopping} (+{formatVND(t.giaBan)})
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Barista Note */}
                          {item.note && (
                            <div className="bg-stone-50 border border-stone-200/80 rounded-xl px-2.5 py-1 text-xs text-stone-600 flex items-center gap-1.5 mt-2.5">
                              <FileText className="h-3 w-3 text-stone-400 shrink-0" />
                              <span className="italic truncate">Ghi chú: "{item.note}"</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom: Stepper & Price Calculation */}
                        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-stone-100">
                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-stone-200 rounded-xl p-0.5 bg-stone-50 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="h-7 w-7 rounded-lg hover:bg-stone-200/60 cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-7 text-center font-bold text-xs text-stone-800">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="h-7 w-7 rounded-lg hover:bg-stone-200/60 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Item Total Price */}
                          <div className="text-right">
                            <div className="text-base sm:text-lg font-extrabold text-primary tracking-tight">
                              {formatVND(itemTotal)}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              {formatVND(itemUnitPrice)} / món
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =========================================================================
                "CÓ THỂ BẠN CŨNG THÍCH" (Recommended Products Carousel / Grid)
               ========================================================================= */}
            <div className="pt-3 space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
                  Có thể bạn cũng thích
                </h2>
                <Link
                  to="/menu"
                  className="text-xs sm:text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  Khám phá thêm <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* 4 Drink Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {recommendedProducts.map((prod) => (
                  <Link
                    key={prod.id}
                    to={`/menu/${prod.id}`}
                    className="group bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-2 sm:p-2.5 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    {/* Top Image */}
                    <div className="w-full aspect-[4/3] rounded-xl bg-[#F8F5F1] p-2 overflow-hidden flex items-center justify-center mb-2 border border-stone-100">
                      {prod.hinhAnh ? (
                        <img
                          src={prod.hinhAnh}
                          alt={prod.tenSanPham}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                        />
                      ) : (
                        <span className="text-3xl">🧋</span>
                      )}
                    </div>

                    {/* Bottom Info & Quick Add (+) Button */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate group-hover:text-primary transition-colors" title={prod.tenSanPham}>
                        {prod.tenSanPham}
                      </h4>

                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-primary font-extrabold text-xs sm:text-sm">
                          {formatVND(prod.giaTu)}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(prod, e)}
                          className="h-7 w-7 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs shrink-0"
                          title="Thêm nhanh vào giỏ"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: Sticky Voucher & Order Summary Card
             ========================================================================= */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* Voucher Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
                  <Ticket className="h-4 w-4 text-primary" /> Mã giảm giá / Voucher
                </h3>
              </div>

              {appliedVoucher ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" /> {appliedVoucher.maVoucher}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      Giảm {formatVND(voucherDiscount)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
                    onClick={handleRemoveVoucher}
                  >
                    Gỡ mã
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã voucher (VD: KOINEW)..."
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="text-xs h-10 rounded-xl border-stone-200 bg-stone-50/50 uppercase font-semibold focus-visible:ring-primary"
                  />
                  <Button
                    size="sm"
                    onClick={handleApplyVoucher}
                    isLoading={isValidatingVoucher}
                    className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    Áp dụng
                  </Button>
                </div>
              )}
            </div>

            {/* Order Total Breakdown Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-stone-900 border-b border-stone-100 pb-3">
                Tóm tắt đơn hàng
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính hàng ({items.length} món)</span>
                  <span className="font-semibold text-stone-900">{formatVND(subtotal)}</span>
                </div>

                <div className="flex justify-between text-stone-600 items-baseline">
                  <span>Phí giao hàng dự kiến</span>
                  <span className="font-semibold text-stone-900">{formatVND(shippingFee)}</span>
                </div>

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Ticket className="h-3.5 w-3.5" /> Giảm giá Voucher
                    </span>
                    <span>-{formatVND(voucherDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-stone-100" />

              {/* Final Total */}
              <div className="flex justify-between items-baseline pt-1">
                <div>
                  <div className="text-sm font-bold text-stone-900">Tổng thanh toán</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Đã bao gồm VAT</div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
                  {formatVND(finalTotal)}
                </div>
              </div>

              {/* Checkout CTA Button */}
              <Button
                size="lg"
                className="w-full h-12 text-sm sm:text-base font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-sm transition-all active:scale-[0.99] cursor-pointer"
                onClick={() => navigate('/checkout')}
              >
                Tiến hành thanh toán <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Trust & Quality Badges */}
              <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-[10px] text-stone-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Đảm bảo chất lượng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>Giao nhanh 30 phút</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Cart Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={isClearModalOpen}
          onOpenChange={setIsClearModalOpen}
          title="Xóa toàn bộ giỏ hàng?"
          description="Tất cả đồ uống trong giỏ hàng sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục không?"
          onConfirm={() => {
            clearCart();
            setIsClearModalOpen(false);
            toast.info('Đã xóa toàn bộ giỏ hàng');
          }}
        />
      </div>
    </div>
  );
}
