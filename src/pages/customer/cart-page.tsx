import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Ticket, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { ConfirmDeleteDialog } from '@/shared/components/overlay/confirm-delete-dialog';
import { useCartStore } from '@/shared/stores/cart-store';
import { promotionApi } from '@/features/promotions/api/promotion-api';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, applyVoucher, appliedVoucher, voucherDiscount, getSubtotal, getTotal } = useCartStore();

  const [voucherCode, setVoucherCode] = useState('');
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const subtotal = getSubtotal();
  const shippingFee = subtotal > 0 ? 15000 : 0;
  const finalTotal = getTotal(shippingFee);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    setIsValidatingVoucher(true);
    try {
      const res = await promotionApi.validateVoucher(voucherCode, subtotal);
      if (res.valid && res.voucher) {
        applyVoucher(res.voucher, res.giamGia);
        toast.success(res.message || 'Đã áp dụng mã giảm giá!');
      } else {
        toast.error(res.message || 'Mã giảm giá không hợp lệ');
      }
    } catch {
      toast.error('Không thể kiểm tra mã giảm giá');
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    applyVoucher(null, 0);
    setVoucherCode('');
    toast.info('Đã hủy áp dụng mã giảm giá');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon="🧋"
          title="Giỏ hàng của bạn đang trống"
          description="Hãy khám phá danh sách đồ uống thơm ngon và thêm món ưa thích vào giỏ hàng ngay nhé!"
          action={
            <Button size="lg" asChild className="mt-4 gap-2 btn-primary rounded-xl">
              <Link to="/menu">
                <ShoppingCart className="h-4 w-4" /> Khám phá thực đơn
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giỏ hàng ({items.length} món)</h1>
          <p className="text-muted-foreground text-sm mt-1">Kiểm tra đơn hàng trước khi tiến hành thanh toán</p>
        </div>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={() => setIsClearModalOpen(true)}>
          <Trash2 className="h-4 w-4" /> Xóa tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const toppingSum = item.toppings.reduce((sum, t) => sum + t.giaBan, 0);
            const itemUnitPrice = item.price + toppingSum;
            const itemTotal = itemUnitPrice * item.quantity;

            return (
              <Card key={item.id} className="p-4 overflow-hidden border">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="h-24 w-24 rounded-xl bg-muted shrink-0 overflow-hidden flex items-center justify-center">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🧋</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-base">{item.productName}</h3>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Specs */}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[11px] font-medium">
                          {item.variantName}
                        </Badge>
                        <Badge variant="outline" className="text-[11px]">
                          Đường: {item.sugarLevel}
                        </Badge>
                        <Badge variant="outline" className="text-[11px]">
                          Đá: {item.iceLevel}
                        </Badge>
                      </div>

                      {/* Toppings list */}
                      {item.toppings.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium text-foreground">Topping: </span>
                          {item.toppings.map((t) => `${t.tenTopping} (+${formatVND(t.giaBan)})`).join(', ')}
                        </div>
                      )}

                      {/* Note */}
                      {item.note && <div className="text-xs text-muted-foreground italic mt-1">Ghi chú: "{item.note}"</div>}
                    </div>

                    {/* Bottom: Quantity & Subtotal */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
                        <Button variant="ghost" size="icon-sm" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <Button variant="ghost" size="icon-sm" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold text-primary">{formatVND(itemTotal)}</div>
                        <div className="text-[11px] text-muted-foreground">{formatVND(itemUnitPrice)} / món</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          <Link to="/menu" className="inline-flex items-center text-sm font-medium text-primary hover:underline pt-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Tiếp tục chọn thêm đồ uống
          </Link>
        </div>

        {/* Right 1 Col: Summary Sidebar */}
        <div className="space-y-6">
          {/* Voucher Box */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Ticket className="h-4 w-4 text-primary" /> Mã giảm giá / Voucher
            </h3>
            {appliedVoucher ? (
              <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-primary flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> {appliedVoucher.maVoucher}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Giảm {formatVND(voucherDiscount)}</div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleRemoveVoucher}>
                  Gỡ mã
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã voucher (VD: KOINEW)..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="text-xs"
                />
                <Button size="sm" onClick={handleApplyVoucher} isLoading={isValidatingVoucher}>
                  Áp dụng
                </Button>
              </div>
            )}
          </Card>

          {/* Order Total Breakdown */}
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-base border-b pb-3">Tóm tắt đơn hàng</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính hàng ({items.length} món)</span>
                <span className="font-medium text-foreground">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí giao hàng dự kiến</span>
                <span className="font-medium text-foreground">{formatVND(shippingFee)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Giảm giá Voucher</span>
                  <span>-{formatVND(voucherDiscount)}</span>
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            <div className="flex justify-between items-baseline">
              <div>
                <div className="text-base font-bold">Tổng thanh toán</div>
                <div className="text-[11px] text-muted-foreground">Đã bao gồm VAT</div>
              </div>
              <div className="text-2xl font-bold text-primary">{formatVND(finalTotal)}</div>
            </div>

            <Button size="lg" className="w-full text-base font-semibold gap-2 mt-4 btn-primary rounded-xl" onClick={() => navigate('/checkout')}>
              Tiến hành thanh toán <ArrowRight className="h-5 w-5" />
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={isClearModalOpen}
        onOpenChange={setIsClearModalOpen}
        title="Xóa toàn bộ giỏ hàng?"
        description="Tất cả đồ uống trong giỏ hàng sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục?"
        onConfirm={() => {
          clearCart();
          setIsClearModalOpen(false);
          toast.info('Đã xóa toàn bộ giỏ hàng');
        }}
      />
    </div>
  );
}
