import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * SmoothScroll component:
 * Khởi tạo Lenis Inertia/Momentum Smooth Scrolling cho toàn bộ ứng dụng.
 * Tái tạo cảm giác cuộn mượt mà 60-120fps chuẩn luxury tương tự website CHAGEE & Apple.
 */
export function SmoothScroll() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      autoRaf: true,
    });

    lenisInstance = lenis;
    (window as unknown as { __lenis: Lenis | null }).__lenis = lenis;

    return () => {
      lenis.destroy();
      lenisInstance = null;
      (window as unknown as { __lenis: Lenis | null }).__lenis = null;
      isInitialized.current = false;
    };
  }, []);

  return null;
}
