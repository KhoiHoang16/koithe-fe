import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4 animate-fade-in">
        <div className="text-8xl">🧋</div>
        <div>
          <h1 className="text-7xl font-bold gradient-text">404</h1>
          <h2 className="text-2xl font-bold mt-2">Trang không tồn tại</h2>
          <p className="text-muted-foreground mt-2">
            Xin lỗi, trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Trang chủ
            </Link>
          </Button>
          <Button asChild>
            <Link to="/menu">
              <Search className="mr-2 h-4 w-4" />
              Xem thực đơn
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
