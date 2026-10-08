import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Nhập số điện thoại để nhận OTP đặt lại mật khẩu
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="text-5xl">📱</div>
          <p className="text-muted-foreground text-sm">
            Mã OTP đã được gửi. Vui lòng kiểm tra tin nhắn.
          </p>
          <Button asChild className="w-full">
            <Link to="/login">Quay lại đăng nhập</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-phone">Số điện thoại</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="forgot-phone" type="tel" placeholder="0xxxxxxxxx" className="pl-10" />
            </div>
          </div>
          <Button className="w-full" onClick={() => setSent(true)} size="lg">
            Gửi mã OTP
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/login">Quay lại đăng nhập</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
