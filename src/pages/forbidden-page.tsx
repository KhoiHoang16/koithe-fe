import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4 animate-fade-in">
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <div>
          <h1 className="text-6xl font-bold text-muted-foreground/30">403</h1>
          <h2 className="text-2xl font-bold mt-2">Không có quyền truy cập</h2>
          <p className="text-muted-foreground mt-2">
            Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link to="/">Về trang chủ</Link>
          </Button>
          <Button asChild>
            <Link to="/login">Đăng nhập lại</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
