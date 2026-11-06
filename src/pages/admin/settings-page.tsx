import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Store,
  CreditCard,
  Truck,
  Crown,
  Server,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { env } from '@/shared/libs/env';

interface StoreSettingsState {
  storeName: string;
  branchAddress: string;
  hotline: string;
  openHours: string;
  shippingFee: string;
  freeShipThreshold: string;
  pointsPerTenThousand: string;
}

const STORAGE_KEY = 'koithe_admin_store_settings';

function loadInitialSettings(): StoreSettingsState {
  const defaults: StoreSettingsState = {
    storeName: 'KOI Thé Vietnam — Chi nhánh Ngô Đức Kế',
    branchAddress: '120 Ngô Đức Kế, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    hotline: '1900 636 936',
    openHours: '09:00 - 22:30 (Tất cả các ngày trong tuần)',
    shippingFee: '15000',
    freeShipThreshold: '150000',
    pointsPerTenThousand: '1',
  };
  if (typeof localStorage === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<StoreSettingsState>) };
  } catch {
    return defaults;
  }
}

export function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettingsState>(loadInitialSettings);

  // Kiểm tra kết nối trực tiếp tới Backend API
  const healthCheckQuery = useQuery({
    queryKey: ['admin', 'system-health-check'],
    queryFn: async () => {
      const categories = await catalogApi.getCategories();
      return {
        connected: true,
        categoryCount: categories.length,
        checkedAt: new Date().toLocaleTimeString('vi-VN'),
      };
    },
    retry: false,
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    toast.success('Đã lưu cấu hình vận hành hệ thống!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cấu hình hệ thống</h1>

        </div>
        <Button
          variant="outline"
          onClick={() => void healthCheckQuery.refetch()}
          disabled={healthCheckQuery.isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 mr-1.5 ${healthCheckQuery.isFetching ? 'animate-spin' : ''}`}
          />
          Kiểm tra kết nối API
        </Button>
      </div>

      {/* Trạng thái kết nối Backend API */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Trạng thái máy chủ & Dịch vụ tích hợp</CardTitle>
          </div>
          {healthCheckQuery.isPending ? (
            <Badge variant="secondary">Đang kiểm tra...</Badge>
          ) : healthCheckQuery.isError ? (
            <Badge variant="destructive">Mất kết nối API</Badge>
          ) : (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Hoạt động bình thường
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-xs text-muted-foreground">API Base Endpoint</p>
              <p className="font-mono font-semibold mt-1">{env.VITE_API_BASE_URL}</p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-xs text-muted-foreground">Đồng bộ Catalog</p>
              <p className="font-semibold mt-1">
                {healthCheckQuery.data
                  ? `${healthCheckQuery.data.categoryCount} danh mục đang kích hoạt`
                  : 'Đang đồng bộ...'}
              </p>
            </div>
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-xs text-muted-foreground">Lần kiểm tra gần nhất</p>
              <p className="font-semibold mt-1">
                {healthCheckQuery.data?.checkedAt ?? 'Vừa xong'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thông tin cửa hàng */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Thông tin cửa hàng chính</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cfg-store-name">Tên thương hiệu / Chi nhánh</Label>
                <Input
                  id="cfg-store-name"
                  value={settings.storeName}
                  onChange={(e) => setSettings((s) => ({ ...s, storeName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg-address">Địa chỉ cửa hàng</Label>
                <Input
                  id="cfg-address"
                  value={settings.branchAddress}
                  onChange={(e) => setSettings((s) => ({ ...s, branchAddress: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cfg-hotline">Hotline CSKH</Label>
                  <Input
                    id="cfg-hotline"
                    value={settings.hotline}
                    onChange={(e) => setSettings((s) => ({ ...s, hotline: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cfg-hours">Khung giờ mở cửa</Label>
                  <Input
                    id="cfg-hours"
                    value={settings.openHours}
                    onChange={(e) => setSettings((s) => ({ ...s, openHours: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chính sách vận chuyển & Tích điểm */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Vận chuyển & Tích điểm thành viên</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cfg-ship-fee">Phí giao hàng tiêu chuẩn (VNĐ)</Label>
                  <Input
                    id="cfg-ship-fee"
                    type="number"
                    min={0}
                    value={settings.shippingFee}
                    onChange={(e) => setSettings((s) => ({ ...s, shippingFee: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cfg-freeship">Ngưỡng Freeship đơn từ (VNĐ)</Label>
                  <Input
                    id="cfg-freeship"
                    type="number"
                    min={0}
                    value={settings.freeShipThreshold}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, freeShipThreshold: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cfg-points">Tỷ lệ tích điểm (Số điểm / 10.000đ chi tiêu)</Label>
                <Input
                  id="cfg-points"
                  type="number"
                  min={1}
                  value={settings.pointsPerTenThousand}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, pointsPerTenThousand: e.target.value }))
                  }
                />
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2">
                <Crown className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Hệ thống tự động nâng hạng thành viên: <strong>ĐỒNG (BRONZE)</strong> →{' '}
                  <strong>BẠC (SILVER)</strong> → <strong>VÀNG (GOLD)</strong> →{' '}
                  <strong>KIM CƯƠNG (DIAMOND)</strong> dựa trên tổng điểm tích lũy khi đơn hàng hoàn tất.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cổng thanh toán */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Phương thức thanh toán đang kích hoạt</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  code: 'TIEN_MAT',
                  name: 'Tiền mặt (POS & COD)',
                  desc: 'Thu tiền tại quầy hoặc khi giao hàng, hỗ trợ đối soát ca thu ngân.',
                },
                {
                  code: 'CHUYEN_KHOAN_QR',
                  name: 'Chuyển khoản VietQR',
                  desc: 'Tự động sinh mã QR theo số tiền và nội dung đơn hàng.',
                },
                {
                  code: 'VNPAY',
                  name: 'Cổng thanh toán VNPay',
                  desc: 'Hỗ trợ thẻ ATM nội địa, QR ngân hàng và xác thực chữ ký HMAC-SHA512.',
                },
                {
                  code: 'MOMO',
                  name: 'Ví điện tử MoMo',
                  desc: 'Redirect cổng thanh toán MoMo kèm callback cập nhật trạng thái tức thì.',
                },
              ].map((method) => (
                <div key={method.code} className="rounded-xl border p-4 space-y-2 bg-card">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {method.code}
                    </span>
                    <Badge variant="success">Đang bật</Badge>
                  </div>
                  <p className="font-semibold text-sm">{method.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{method.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="h-4 w-4 mr-1.5" />
            Lưu cấu hình
          </Button>
        </div>
      </form>
    </div>
  );
}
