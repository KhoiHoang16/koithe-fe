import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const SIGNATURE_PRODUCTS = [
  {
    id: 1,
    name: 'Trà Sữa Trân Châu Hoàng Kim',
    enName: 'Golden Bubble Milk Tea',
    image: '/product-bubble-tea.jpg',
  },
  {
    id: 2,
    name: 'Hồng Trà Macchiato Kem Béo',
    enName: 'Black Tea Macchiato',
    image: '/product-macchiato.jpg',
  },
  {
    id: 3,
    name: 'Lục Trà Trái Cây Tươi Mát',
    enName: 'Fresh Citrus Green Tea',
    image: '/product-fruit-tea.jpg',
  },
];

export function HomePage() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* ============================================================
          HERO SECTION (Cinematic Typography with 16:9 KOI Thé Background)
          ============================================================ */}
      <section className="relative overflow-hidden min-h-screen flex flex-col justify-center items-center text-white select-none">
        {/* Background Image: KOI Thé Signature 16:9 Drink */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-koithe.png')" }}
        />

        {/* Ambient Vignette Overlay for Crisp Typography Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/15 to-black/40 pointer-events-none" />

        {/* Centered Headline Content */}
        <div className="relative container mx-auto px-4 pt-24 pb-16 flex-1 flex flex-col items-center justify-center z-10 text-center">
          <div className="group flex flex-col items-center justify-center transition-transform duration-500 hover:scale-[1.02] cursor-default">
            {/* Giant KOI THÉ Wordmark */}
            <h1 className="font-sans text-6xl sm:text-7xl md:text-8xl lg:text-[120px] xl:text-[135px] font-black tracking-wider leading-none text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
              KOI THÉ
            </h1>

            {/* Subtitle */}
            <p className="font-sans font-medium text-xl sm:text-2xl md:text-3xl text-white/95 tracking-wide mt-4 sm:mt-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] max-w-2xl">
              Tinh Hoa Trà Đạo – Trọn Vị Nguyên Bản
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 1: VỀ CHÚNG TÔI (Full Screen 100vh - Split Screen)
          ============================================================ */}
      <section className="relative w-full bg-white overflow-hidden min-h-screen flex items-center justify-center py-16 lg:py-0">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-center">
            {/* Left Column: Full-Bleed High Res Image */}
            <div className="lg:col-span-6 relative w-full flex justify-center">
              <div className="relative w-full max-w-[700px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group">
                <img
                  src="/about-garden.jpg"
                  alt="Về KOI Thé - Tinh hoa trà đồi tự nhiên"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>

            {/* Right Column: Editorial Typography */}
            <div className="lg:col-span-6 flex flex-col justify-center items-start lg:items-end text-left lg:text-right lg:pr-6">
              <div className="max-w-xl">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-8 font-sans leading-tight">
                  VỀ CHÚNG TÔI
                </h2>

                <div className="space-y-6 text-base sm:text-lg text-neutral-600 leading-relaxed font-light mb-10">
                  <p>
                    KOI Thé là thương hiệu trà sữa thủ công khởi nguồn từ Đài Loan, nơi nghệ thuật trà đạo được nâng niu và gìn giữ qua nhiều thế hệ.
                  </p>
                  <p>
                    Với sứ mệnh kết nối mọi người và xây dựng bền vững các mối quan hệ thông qua một ly trà ngon, chúng tôi cam kết mang lại các sản phẩm trà lành mạnh hơn, ít calo, phù hợp với trải nghiệm thưởng thức hằng ngày.
                  </p>
                  <p>
                    Từng mẻ trân châu hoàng kim óng ánh đều được nấu tươi mới mỗi 4 giờ để lưu giữ độ dai mềm và hương thơm tự nhiên chuẩn vị nhất.
                  </p>
                </div>

                <div className="flex justify-start lg:justify-end">
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-9 py-3 text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                  >
                    Tìm Hiểu Thêm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: SẢN PHẨM (Full Screen 100vh - Showcase & Cards)
          ============================================================ */}
      <section className="relative w-full bg-white overflow-hidden min-h-screen flex items-center justify-center py-16 lg:py-0">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">
            {/* Left Column (Approx 30%): Header & Description */}
            <div className="lg:col-span-4 flex flex-col justify-center items-start">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-8 font-sans leading-tight">
                SẢN PHẨM
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-light mb-10 max-w-sm">
                Được làm từ những lá trà chất lượng và nguyên liệu được chọn lọc kỹ lưỡng, mỗi ly trà KOI Thé đều được pha chế tươi mới theo yêu cầu.
              </p>
              <Link
                to="/menu"
                className="inline-flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-9 py-3 text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              >
                Tìm Hiểu Thêm
              </Link>
            </div>

            {/* Right Column (Approx 70%): Studio Product Cards Showcase */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
                {SIGNATURE_PRODUCTS.map((item) => (
                  <Link
                    key={item.id}
                    to={`/menu`}
                    className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                    />
                    {/* Subtle bottom shadow gradient on hover for elegance */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                      <span className="text-base font-semibold tracking-wide drop-shadow-md">
                        {item.name}
                      </span>
                      <span className="text-xs text-white/80 font-light mt-0.5">
                        {item.enName}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Chagee Signature Progress Indicator Bar */}
              <div className="w-full h-[3px] bg-neutral-200 rounded-full mt-10 overflow-hidden">
                <div className="w-1/3 h-full bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Back To Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Lên đầu trang"
          className="fixed bottom-8 right-8 z-40 h-11 w-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
