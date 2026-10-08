import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAuthStore } from '@/shared/stores/auth-store';
import { httpClient } from '@/shared/api/http-client';
import type { LoginResponse } from '@/shared/stores/auth-store';

const loginSchema = z.object({
  soDienThoai: z.string().min(10, 'Số điện thoại không hợp lệ'),
  matKhau: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await httpClient.post<LoginResponse>('/auth/login', data);
      login(res as unknown as LoginResponse);
      toast.success('Đăng nhập thành công!');
      // Redirect về trang trước hoặc admin nếu là staff
      const user = (res as unknown as LoginResponse).user;
      if (user.vaiTro === 'ADMIN' || user.vaiTro === 'MANAGER') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      toast.error('Số điện thoại hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="login-phone">Số điện thoại</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-phone"
              type="tel"
              placeholder="0xxxxxxxxx"
              className="pl-10"
              autoComplete="tel"
              {...register('soDienThoai')}
            />
          </div>
          {errors.soDienThoai && (
            <p className="text-xs text-destructive">{errors.soDienThoai.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10"
              autoComplete="current-password"
              {...register('matKhau')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.matKhau && (
            <p className="text-xs text-destructive">{errors.matKhau.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
          Đăng nhập
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link to="/menu">Tiếp tục không đăng nhập</Link>
      </Button>
    </div>
  );
}
