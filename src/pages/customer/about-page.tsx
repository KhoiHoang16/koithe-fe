import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* ============================================================
          HERO SECTION (100vh Full Screen - Chagee Style Flagship Architecture)
          ============================================================ */}
      <section className="relative overflow-hidden min-h-screen flex flex-col justify-end text-white select-none">
        {/* Flagship Store Architecture Background (Wide-Angle & Standalone) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/about-flagship-v3.jpg')" }}
        />

        {/* Soft navbar top gradient only */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/35 via-black/10 to-transparent pointer-events-none" />

        {/* Headline at bottom matching CHAGEE's "CÂU CHUYỆN THƯƠNG HIỆU" - sized down, clean & sharp */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-12 pb-10 sm:pb-12 z-10 text-center flex flex-col items-center">
          <h1 className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-[0.18em] leading-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] uppercase whitespace-nowrap">
            CÂU CHUYỆN THƯƠNG HIỆU
          </h1>

          {/* Scroll Down Indicator */}
          <div className="flex flex-col items-center gap-1 opacity-75 hover:opacity-100 transition-opacity pointer-events-none mt-4 sm:mt-5">
            <span className="text-[10px] tracking-widest uppercase text-white/90 font-medium">Cuộn để khám phá</span>
            <ChevronDown className="h-3.5 w-3.5 text-white animate-bounce" />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 1: KHỞI NGUỒN & DI SẢN (Origin Story - Full Viewport)
          ============================================================ */}
      <section className="relative w-full bg-white overflow-hidden min-h-screen flex items-center justify-center py-24 lg:py-32">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Left Column: Tea Plantation Heritage Image (Subject on left facing text) */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[660px] rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] group">
                <img
                  src="/about-origin-left.jpg"
                  alt="Nghệ nhân thu hoạch búp trà tươi nguyên bản KOI Thé"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>

            {/* Right Column: Narrative Storytelling */}
            <div className="lg:col-span-6 flex flex-col justify-center items-start lg:pl-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Hành Trình Khởi Nghiệp
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-6 font-sans leading-tight">
                TINH HOA TỪ NGUỒN CỘI
              </h2>

              <div className="space-y-5 text-base sm:text-lg text-neutral-600 leading-relaxed font-light mb-8">
                <p>
                  Khởi đầu từ tình yêu thuần khiết dành cho những búp trà ô long và hồng trà trên những triền đồi cao nguyên Đài Loan, KOI Thé ra đời với sứ mệnh gìn giữ và tôn vinh văn hóa trà thủ công truyền thống.
                </p>
                <p>
                  Tên gọi <strong>KOI</strong> bắt nguồn từ âm điệu tiếng Hoa tượng trưng cho sự thịnh vượng và bền bỉ, kết hợp cùng chữ <strong>Thé</strong> (tiếng Pháp có nghĩa là Trà) – đại diện cho sự giao thoa hoàn mỹ giữa nghệ thuật trà Á Đông và phong cách thưởng thức tinh tế phương Tây.
                </p>
                <p>
                  Chúng tôi tin rằng, mỗi tách trà trao đến tay bạn không chỉ là một thức uống giải khát, mà là sự kết nối chân thành giữa con người với con người.
                </p>
              </div>

              <Link
                to="/menu"
                className="inline-flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-9 py-3 text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              >
                Khám Phá Các Dòng Trà
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: MỤC TIÊU THƯƠNG HIỆU (Brand Goals & Vision - KOI Thé Brand Identity)
          ============================================================ */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden text-white select-none">
        {/* Background Image: Luxury KOI Thé Wooden Gallery Wall with Backlit Wordmark */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/about-goals-wordmark.jpg')" }}
        />

        {/* Soft, warm darkening overlay: allows text on left to pop while keeping KOI Thé logo luminous on right */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent pointer-events-none" />

        {/* Content Container aligned to the left */}
        <div className="relative w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-20 z-10 py-16">
          <div className="max-w-xl lg:max-w-2xl">
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-wider uppercase text-white mb-8 sm:mb-10 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              MỤC TIÊU
            </h2>

            <div className="space-y-6 sm:space-y-8 text-base sm:text-lg md:text-xl text-white/95 leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              <p>
                Phục vụ những người yêu trà tại hơn 100 quốc gia và vùng lãnh thổ,
              </p>
              <p>
                chia sẻ nghệ thuật pha chế trà thủ công Đài Loan đến hàng triệu thực khách,
              </p>
              <p>
                và lan tỏa văn hóa trà nguyên bản, chân thành trên toàn cầu.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
