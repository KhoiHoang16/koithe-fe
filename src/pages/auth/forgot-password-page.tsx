import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-black text-foreground tracking-tight">Quên mật khẩu</h1>
        <p className="text-neutral-500 text-xs sm:text-sm mt-1 font-light">
          Nhập số điện thoại để nhận mã OTP khôi phục tài khoản
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4 py-4">
          <div className="text-5xl">📱</div>
          <p className="text-neutral-600 text-sm font-light">
            Mã OTP đã được gửi đến số điện thoại của bạn. Vui lòng kiểm tra tin nhắn.
          </p>
          <Button
            asChild
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-sm"
          >
            <Link to="/login">Quay lại đăng nhập</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-phone" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Số điện thoại
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="forgot-phone"
                type="tel"
                placeholder="0xxxxxxxxx"
                className="pl-10 h-11 rounded-xl border-neutral-200 bg-neutral-50/70 focus:bg-white focus-visible:ring-1 focus-visible:ring-primary transition-all"
              />
            </div>
          </div>
          <Button
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-sm"
            onClick={() => setSent(true)}
          >
            Gửi mã OTP
          </Button>
          <Button
            variant="ghost"
            className="w-full h-10 rounded-xl text-neutral-500 hover:text-primary hover:bg-primary/5 font-medium transition-all"
            asChild
          >
            <Link to="/login">Quay lại đăng nhập</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
