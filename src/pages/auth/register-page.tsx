import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Phone, User, AtSign } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { authApi } from '@/features/auth/api/auth-api';

const registerSchema = z
  .object({
    username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự').max(100, 'Tên đăng nhập quá dài'),
    hoTen: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
    soDienThoai: z.string().optional(),
    matKhau: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    xacNhanMatKhau: z.string(),
  })
  .refine((data) => data.matKhau === data.xacNhanMatKhau, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['xacNhanMatKhau'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authApi.register({
        username: data.username,
        password: data.matKhau,
        fullName: data.hoTen,
        phone: data.soDienThoai || undefined,
      });
      setSuccess(true);
      toast.success('Đăng ký thành công!');
    } catch {
      toast.error('Tên đăng nhập đã tồn tại hoặc thông tin không hợp lệ');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold">Đăng ký thành công!</h2>
        <p className="text-muted-foreground">Tài khoản của bạn đã được tạo.</p>
        <Button asChild className="w-full">
          <Link to="/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-black text-foreground tracking-tight">Tạo tài khoản</h1>
        <p className="text-neutral-500 text-xs sm:text-sm mt-1 font-light">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Đăng nhập
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="reg-username" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Tên đăng nhập
          </Label>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="reg-username"
              placeholder="ten_dang_nhap"
              className="pl-10 h-11 rounded-xl border-neutral-200 bg-neutral-50/70 focus:bg-white focus-visible:ring-1 focus-visible:ring-primary transition-all"
              autoComplete="username"
              {...register('username')}
            />
          </div>
          {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-name" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Họ và tên
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="reg-name"
              placeholder="Nguyễn Văn A"
              className="pl-10 h-11 rounded-xl border-neutral-200 bg-neutral-50/70 focus:bg-white focus-visible:ring-1 focus-visible:ring-primary transition-all"
              {...register('hoTen')}
            />
          </div>
          {errors.hoTen && <p className="text-xs text-destructive mt-1">{errors.hoTen.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-phone" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Số điện thoại
          </Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="reg-phone"
              type="tel"
              placeholder="0xxxxxxxxx"
              className="pl-10 h-11 rounded-xl border-neutral-200 bg-neutral-50/70 focus:bg-white focus-visible:ring-1 focus-visible:ring-primary transition-all"
              {...register('soDienThoai')}
            />
          </div>
          {errors.soDienThoai && <p className="text-xs text-destructive mt-1">{errors.soDienThoai.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tối thiểu 8 ký tự"
              className="pl-10 pr-10 h-11 rounded-xl border-neutral-200 bg-neutral-50/70 focus:bg-white focus-visible:ring-1 focus-visible:ring-primary transition-all"
              autoComplete="new-password"
              {...register('matKhau')}
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.matKhau && <p className="text-xs text-destructive mt-1">{errors.matKhau.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-confirm" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Xác nhận mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="reg-confirm"
              type="password"
              placeholder="••••••••"
              className="pl-10 h-11 rounded-xl border-neutral-200 bg-neutral-50/70 focus:bg-white focus-visible:ring-1 focus-visible:ring-primary transition-all"
              autoComplete="new-password"
              {...register('xacNhanMatKhau')}
            />
          </div>
          {errors.xacNhanMatKhau && <p className="text-xs text-destructive mt-1">{errors.xacNhanMatKhau.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-sm mt-2"
          isLoading={isLoading}
        >
          Đăng ký
        </Button>
      </form>
    </div>
  );
}
