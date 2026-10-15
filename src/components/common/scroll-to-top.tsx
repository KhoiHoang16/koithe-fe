import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLenis } from './smooth-scroll';

/**
 * Global ScrollToTop component:
 * Tự động đưa vị trí cuộn về đầu trang (0, 0) tức thì khi người dùng chuyển sang bất kỳ trang nào.
 * Thiết lập history.scrollRestoration = 'manual' để ngăn chặn trình duyệt giữ lại vị trí cuộn cũ từ trang trước.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Ngăn trình duyệt tự động khôi phục vị trí cuộn cũ giữa các trang
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();

    // Thực hiện thêm trong RAF và microtask để đảm bảo các trang render qua Suspense hoặc có hình ảnh tải xong vẫn ở đầu trang
    const rafId = requestAnimationFrame(resetScroll);
    const timeoutId = setTimeout(resetScroll, 50);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [pathname, search]);

  return null;
}
