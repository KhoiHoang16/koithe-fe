import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import type { Address } from '@/shared/types/common.types';

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 1,
    tenNguoiNhan: 'Nguyễn Văn A',
    soDienThoai: '0901234567',
    diaChiChiTiet: '123 Nguyễn Huệ',
    phuongXa: 'Phường Bến Nghé',
    quanHuyen: 'Quận 1',
    tinhThanh: 'TP. Hồ Chí Minh',
    macDinh: true,
  },
  {
    id: 2,
    tenNguoiNhan: 'Nguyễn Văn A (Cơ quan)',
    soDienThoai: '0901234567',
    diaChiChiTiet: 'Tòa nhà Bitexco, 2 Hải Triều',
    phuongXa: 'Phường Bến Nghé',
    quanHuyen: 'Quận 1',
    tinhThanh: 'TP. Hồ Chí Minh',
    macDinh: false,
  },
];

export function AddressBookPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);

  const handleSetDefault = (id: number) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, macDinh: a.id === id })));
    toast.success('Đã đặt làm địa chỉ mặc định!');
  };

  const handleDelete = (id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.info('Đã xóa địa chỉ');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Sổ địa chỉ giao hàng</h1>
          <p className="text-muted-foreground text-sm">Quản lý các địa chỉ nhận hàng thường dùng</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-semibold">
          <Plus className="h-4 w-4" /> Thêm địa chỉ mới
        </Button>
      </div>

      <div className="space-y-4">
        {addresses.map((addr) => (
          <Card key={addr.id} className="p-5 border flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{addr.tenNguoiNhan}</span>
                <span className="text-xs text-muted-foreground">• {addr.soDienThoai}</span>
                {addr.macDinh && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] gap-1">
                    <Check className="h-3 w-3" /> Mặc định
                  </Badge>
                )}
              </div>
              <div className="text-xs text-foreground mt-1">
                {addr.diaChiChiTiet}, {addr.phuongXa}, {addr.quanHuyen}, {addr.tinhThanh}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!addr.macDinh && (
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => handleSetDefault(addr.id)}>
                  Đặt mặc định
                </Button>
              )}
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(addr.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
