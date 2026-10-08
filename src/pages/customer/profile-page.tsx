import { useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Phone, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useAuthStore } from '@/shared/stores/auth-store';
import { getInitials } from '@/shared/libs/utils';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const [hoTen, setHoTen] = useState(user?.hoTen || 'Nguyễn Văn A');
  const [email, setEmail] = useState(user?.email || 'nguyenvana@gmail.com');
  const [soDienThoai, setSoDienThoai] = useState(user?.soDienThoai || '0901234567');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        setUser({ ...user, hoTen, email, soDienThoai });
      }
      toast.success('Đã cập nhật thông tin cá nhân thành công!');
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tài khoản của tôi</h1>
        <p className="text-muted-foreground text-sm">Quản lý thông tin hồ sơ và bảo mật tài khoản</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 border-b pb-6 mb-6">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={user?.anhDaiDien} alt={hoTen} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">{getInitials(hoTen)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold">{hoTen}</h2>
            <p className="text-xs text-muted-foreground">{email}</p>
            <span className="inline-block mt-1 text-[11px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full">
              Thành viên Vàng (Gold Member)
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div>
            <Label htmlFor="hoTen" className="text-xs">Họ và tên</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="hoTen" value={hoTen} onChange={(e) => setHoTen(e.target.value)} className="pl-9 text-xs" />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-xs">Email liên hệ</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 text-xs" />
            </div>
          </div>

          <div>
            <Label htmlFor="soDienThoai" className="text-xs">Số điện thoại</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="soDienThoai" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="pl-9 text-xs" />
            </div>
          </div>

          <Button type="submit" size="sm" className="gap-2 font-bold mt-2" isLoading={isSaving}>
            <Save className="h-4 w-4" /> Lưu thay đổi
          </Button>
        </form>
      </Card>
    </div>
  );
}
