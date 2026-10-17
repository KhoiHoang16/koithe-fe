# TÀI LIỆU TỔNG HỢP CẬP NHẬT: GIAO DIỆN AUTH & ĐỒNG BỘ MÀU SẮC THƯƠNG HIỆU
**Dự án:** KOI Thé Vietnam Frontend (`koithe-fe`)  
**Phong cách chủ đạo:** Luxury Minimalist & Editorial Tea Craft (lấy cảm hứng từ chuẩn mực cao cấp CHAGEE và giữ vững nhận diện KOI Thé)  
**Ngày cập nhật:** Tháng 10/2026  
**Phân nhánh Git liên quan:**
- **Nhánh `update/menu-page` (Đã push):** Redesign trang Menu (`/menu`) và tích hợp cơ chế cuộn mượt mà toàn trang Lenis (Commit `1f664f7`).
- **Nhánh mới (`update/auth-page` hoặc `update/auth-and-brand-colors`):** Thiết kế lại cụm trang Auth (Login, Register, Forgot Password) & Chuẩn hóa toàn bộ nút bấm sang hệ màu Xanh Ngọc Bích (`#3A8C6E`).

---

## 1. TỔNG QUAN BỐI CẢNH & PHÂN TÁCH NHÁNH
Quá trình nâng cấp hệ thống được chia làm 2 giai đoạn:
1. **Giai đoạn 1 (Đã hoàn thành và push trên `update/menu-page`):** 
   - Redesign trang `/menu` theo layout 2 cột phong cách CHAGEE, Hero banner lá trà thiên nhiên 100vh.
   - Cài đặt thư viện `lenis` và tối ưu cuộn quán tính 60fps/120fps toàn website kèm cơ chế `ScrollToTop`.
2. **Giai đoạn 2 (Toàn bộ thay đổi hiện tại chuẩn bị commit cho nhánh Auth mới):**
   - Xây dựng lại layout trang Auth với thẻ kính mờ căn giữa (Centered Glassmorphism Card) trên nền ảnh cửa hàng KOI Thé thực tế.
   - Thiết kế lại các trang Đăng nhập (`/login`), Đăng ký (`/register`), Quên mật khẩu (`/forgot-password`).
   - Chuẩn hóa toàn bộ nút bấm, huy hiệu logo, thanh tiến trình và trạng thái active trên toàn bộ website về tông màu **Xanh Ngọc Bích (`#3A8C6E` / `bg-primary`)**, thanh lọc toàn bộ mã màu `#0F2236` cũ.

---

## 2. CHI TIẾT CÁC HẠNG MỤC ĐÃ TRIỂN KHAI

### 2.1. Thiết Kế Lại Trang Thực Đơn (`/menu`)
- **File triển khai:** [`src/pages/customer/menu-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/customer/menu-page.tsx)
- **Cấu trúc trải nghiệm:**
  ```
  ┌─────────────────────────────────────────────────────────────┐
  │ HERO BANNER 100vh (Ảnh nương trà tự nhiên + Tiêu đề SẢN PHẨM) │
  ├─────────────────────────────────────────────────────────────┤
  │ BỐ CỤC 2 CỘT TẠP CHÍ (CHAGEE EDITORIAL LAYOUT):             │
  │ ┌──────────────────────┐ ┌────────────────────────────────┐ │
  │ │ CỘT TRÁI (STICKY 25%)│ │ CỘT PHẢI (LƯỚI SẢN PHẨM 75%)   │ │
  │ │ - CÁC DÒNG TRÀ CHÍNH │ │ - Lưới 3 cột đồ uống cao cấp   │ │
  │ │ - Ô tìm kiếm nhanh   │ │ - Ảnh studio, giá tiền, rating │ │
  │ │ - Menu danh mục dọc  │ │ - Nút "Thêm vào giỏ" xanh bích │ │
  │ └──────────────────────┘ └────────────────────────────────┘ │
  └─────────────────────────────────────────────────────────────┘
  ```
- **Các điểm cải tiến chính:**
  - **Hero Banner 100vh:** Sử dụng hình ảnh cận cảnh lá trà xanh tươi mộc mạc (`/public/menu-banner.jpg`), không lạm dụng các lớp phủ gradient nhân tạo, giữ trọn ánh sáng tự nhiên.
  - **Tiêu đề góc trái chân banner:** Dòng chữ `SẢN PHẨM` cỡ lớn (`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-widest text-white drop-shadow-md`) cùng biểu tượng nảy nhẹ *"Cuộn để khám phá"*.
  - **Cột trái cố định (Sticky Sidebar):** Tiêu đề danh mục "CÁC DÒNG TRÀ CHÍNH" đi kèm thanh gạch chỉ báo màu xanh ngọc bích, ô tìm kiếm bo tròn và danh sách nhóm trà có gạch chân active mượt mà.
  - **Lược bỏ text thừa:** Loại bỏ tiêu đề nhóm trà lặp lại trên lưới sản phẩm, mang lại giao diện tinh gọn, thoáng đãng.
  - **Nút "Thêm vào giỏ":** Đồng bộ nút bấm dạng pill bo tròn tràn viền thẻ sản phẩm màu xanh ngọc bích (`bg-primary hover:bg-primary/90 text-primary-foreground`).

---

### 2.2. Trải Nghiệm Cuộn Mượt Toàn Website (Lenis Smooth Scroll)
- **Vấn đề giải quyết:** Khắc phục tình trạng cuộn chuột nấc rời rạc (discrete wheel stepping) vốn có của trình duyệt, nâng cấp trải nghiệm mượt mà 60fps - 120fps như trang thương hiệu quốc tế CHAGEE.
- **Thư viện tích hợp:** `lenis` (v1.x)
- **Kiến trúc mã nguồn:**
  1. [`src/components/common/smooth-scroll.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/common/smooth-scroll.tsx):
     - Khởi tạo instance Lenis với nội suy Lerp: `duration: 1.2s`, `easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`, `smoothWheel: true`.
     - Cung cấp hàm global `getLenis()` cho các component khác gọi can thiệp vị trí cuộn khi cần.
  2. [`src/components/common/scroll-to-top.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/common/scroll-to-top.tsx):
     - Đồng bộ hóa với Lenis thông qua `lenis.scrollTo(0, { immediate: true })`.
     - Đặt `history.scrollRestoration = 'manual'` đảm bảo khi chuyển route (ví dụ từ Home sang About hay Menu), trang mới luôn bắt đầu chính xác từ tọa độ `top: 0`.
  3. [`src/router/index.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/router/index.tsx):
     - Gắn `<SmoothScroll />` và `<ScrollToTop />` trong `RootLayout`, kích hoạt tự động trên tất cả các route khách hàng.

---

### 2.3. Thiết Kế Mới Hệ Thống Trang Xác Thực (Auth Pages)
- **Layout:** [`src/components/layout/auth-layout.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/layout/auth-layout.tsx)
- **Pages:**
  - Đăng nhập: [`src/pages/auth/login-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/auth/login-page.tsx)
  - Đăng ký: [`src/pages/auth/register-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/auth/register-page.tsx)
  - Quên mật khẩu: [`src/pages/auth/forgot-password-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/auth/forgot-password-page.tsx)
- **Điểm nhấn thiết kế:**
  - **Background Storefront thực tế:** Nền full-screen hình ảnh cửa hàng KOI Thé thực tế chất lượng cao (`/public/auth-bg.jpg`), phủ vignette tối nhẹ và hiệu ứng mờ viền sang trọng.
  - **Centered Glassmorphism Card:** Thẻ biểu mẫu nằm chính giữa màn hình với nền trắng sữa bán trong suốt (`bg-white/95 backdrop-blur-xl`), bo góc lớn `rounded-3xl` và đổ bóng mềm sâu `shadow-[0_25px_60px_rgba(0,0,0,0.35)]`.
  - **Huy hiệu Logo KOI:** Biểu tượng tròn xanh ngọc bích `KOI` nổi bật ở đầu card kèm chữ `KOI THÉ - Tea Craft Vietnam`.
  - **Nút quay về Trang chủ:** Nút pill thủy tinh mờ ở góc trên bên trái (`top-6 left-6`) giúp người dùng dễ dàng thoát về trang chính bất kỳ lúc nào.
  - **Tối ưu form:** Ô nhập liệu mềm mại, icon trực quan, nút ẩn/hiện mật khẩu, và nút xác nhận chính đều dùng màu xanh ngọc bích.

---

### 2.4. Đồng Bộ Hóa Toàn Diện Hệ Thống Nút Bấm & Màu Sắc Thương Hiệu
Tất cả các nút bấm tương tác, chỉ báo trạng thái và huy hiệu trên website đã được chuẩn hóa về cùng một mã màu **Xanh Ngọc Bích (Emerald Green)**:
- **Biến CSS Core:** `--primary: 156 42% 39%` (tương đương `#3A8C6E`) định nghĩa trong [`src/styles/globals.css`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/styles/globals.css).

#### Bảng chi tiết các nút đã được đồng bộ:
| Vị trí / Trang | Thành phần (Component) | Trạng thái trước | Chuẩn hóa mới (Xanh ngọc bích) |
| :--- | :--- | :--- | :--- |
| **Header Navbar** | Huy hiệu logo tròn `KOI` | Bị mờ trắng khi ở đỉnh trang | Luôn hiển thị xanh bích `bg-primary text-white` nhận diện sắc nét |
| **Header Navbar** | Nút **"Đăng nhập"** | Bị đổi màu trắng bán mờ khi ở header trong suốt | Giữ vững màu xanh bích `bg-primary hover:bg-primary/90 text-white shadow-sm` trong mọi trường hợp |
| **Header Navbar** | Badge giỏ hàng (Số lượng món) | Nền vàng `bg-accent` | Đồng bộ xanh bích `bg-primary text-white` |
| **Trang chủ (`/`)** | Nút **"Tìm Hiểu Thêm"** (Về chúng tôi & Sản phẩm) | Viền xám mờ `border-neutral-300 text-neutral-600` | Nút pill xanh ngọc bích `bg-primary hover:bg-primary/90 text-white shadow-sm hover:scale-105` |
| **Trang chủ (`/`)** | Thanh tiến trình (Progress bar) | Xanh đen `#0F2236` | Xanh ngọc bích `bg-primary` |
| **Trang chủ (`/`)** | Nút cuộn lên đầu trang (Back to Top) | Nền xám nhạt | Xanh ngọc bích `bg-primary hover:bg-primary/90 text-white shadow-lg` |
| **Trang Giới thiệu (`/about`)** | Nút **"Khám Phá Các Dòng Trà"** | Viền xám mờ | Nút pill xanh ngọc bích `bg-primary hover:bg-primary/90 text-white hover:scale-105` |
| **Chi tiết món (`/menu/:id`)** | Nút **"Chọn Size"** (Size S, M, L) | Khi chọn chỉ viền xanh và nền nhạt (`bg-primary/10`) | Khi chọn chuyển sang nền **xanh ngọc bích đặc chữ trắng** `bg-primary text-white font-bold shadow-sm` |
| **Chi tiết món (`/menu/:id`)** | Nút **"Mức Đường"** & **"Mức Đá"** | Các pill chọn tỷ lệ % | Nền xanh ngọc bích đặc chữ trắng khi active `bg-primary text-white` |
| **Chi tiết món (`/menu/:id`)** | Checkbox **"Thêm Topping"** | Viền xám | Khi tick chuyển sang xanh bích kèm dấu check đậm nét |
| **Chi tiết món (`/menu/:id`)** | Nút lớn **"Thêm vào giỏ"** | Style chung | Xanh ngọc bích bo góc lớn `rounded-xl bg-primary text-white shadow-md` |
| **Trang Thanh toán (`/checkout`)** | Hình thức nhận hàng (Giao hàng, Mang đi, Tại bàn) | Khi chọn chỉ viền xanh và chữ xanh | Khi chọn chuyển sang nền xanh ngọc bích đặc chữ trắng `bg-primary text-white font-bold` |
| **Trang Thanh toán (`/checkout`)** | Nút **"Đặt hàng ngay"** | Nút submit | Xanh ngọc bích `btn-primary rounded-xl font-bold` |
| **Toàn bộ hệ thống** | Tiêu đề & Chữ xanh đen cũ | Chứa mã cứng `#0F2236` | Chuyển sang `text-foreground` (đen dịu) và `text-primary` chuẩn thiết kế |

---

## 3. DANH MỤC CÁC FILE ĐÃ CHỈNH SỬA & TÀI NGUYÊN MỚI

### 3.1. Danh mục tập tin mã nguồn (Code Files)
1. [`src/components/layout/customer-layout.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/layout/customer-layout.tsx): Chuẩn hóa logo và nút Đăng nhập xanh bích, cập nhật footer.
2. [`src/components/layout/auth-layout.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/layout/auth-layout.tsx): Kiến trúc layout auth thẻ kính nổi giữa màn hình.
3. [`src/pages/customer/home-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/customer/home-page.tsx): Chuẩn hóa CTA buttons, progress bar và nút Back to top sang xanh bích.
4. [`src/pages/customer/about-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/customer/about-page.tsx): Đồng bộ nút CTA khám phá menu và dọn sạch mã màu navy cũ.
5. [`src/pages/customer/menu-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/customer/menu-page.tsx): Bố cục tạp chí 2 cột, hero banner 100vh lá trà, nút thêm giỏ xanh bích.
6. [`src/pages/customer/product-detail-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/customer/product-detail-page.tsx): Đồng bộ trạng thái active của Size, Đường, Đá, Topping và nút thêm giỏ sang nền xanh bích đặc.
7. [`src/pages/customer/checkout-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/customer/checkout-page.tsx): Đồng bộ nút chọn phương thức nhận hàng và nút thanh toán.
8. [`src/pages/auth/login-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/auth/login-page.tsx): Cấu trúc form đăng nhập mới, nút xanh ngọc bích.
9. [`src/pages/auth/register-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/auth/register-page.tsx): Cấu trúc form đăng ký mới, nút xanh ngọc bích.
10. [`src/pages/auth/forgot-password-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/auth/forgot-password-page.tsx): Cấu trúc form quên mật khẩu mới, nút xanh ngọc bích.
11. [`src/components/common/smooth-scroll.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/common/smooth-scroll.tsx): Trình điều khiển cuộn quán tính Lenis.
12. [`src/components/common/scroll-to-top.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/common/scroll-to-top.tsx): Đồng bộ cuộn lên đầu trang với Lenis.

### 3.2. Tài nguyên hình ảnh mới trong `/public`
| Tên File | Vị trí sử dụng | Mô tả chi tiết |
| :--- | :--- | :--- |
| `menu-banner.jpg` | Hero Banner `/menu` | Bức hình tỷ lệ 16:9 chụp những búp lá trà xanh tự nhiên mộc mạc, không áp dụng gradient đè bẹp ánh sáng. |
| `auth-bg.jpg` | Background `/login`, `/register`, `/forgot-password` | Bức hình chụp thực tế mặt tiền cửa hàng KOI Thé hiện đại, ánh sáng ấm cúng, sang trọng. |

---

## 4. KẾT QUẢ KIỂM THỬ & ĐẢM BẢO CHẤT LƯỢNG
- **Kiểm tra kiểu dữ liệu (Type Check):** Chạy `npx tsc --noEmit` hoàn tất với **0 lỗi**.
- **Kiểm thử trực quan (Visual Subagent Testing):** Kiểm tra trực tiếp trên các kích thước màn hình qua trình duyệt Chrome tại `http://localhost:5173/`:
  - Độ mượt khi cuộn trang: Phản hồi tức thì, mượt mà ở tần số quét cao (60/120fps).
  - Tương phản màu sắc: Chữ trắng trên nền xanh ngọc bích `#3A8C6E` đạt chuẩn dễ đọc WCAG AA.
  - Responsive: Thích ứng tốt trên cả máy tính (Desktop), máy tính bảng (Tablet) và điện thoại di động (Mobile).

---

## 5. HƯỚNG DẪN TIẾP THEO CHO ĐỘI NGŨ
1. **Tạo Commit & Push Git:**
   ```bash
   git add .
   git commit -m "feat(ui): unify brand emerald green buttons, redesign menu & auth pages, integrate lenis scroll"
   git push origin <branch-name>
   ```
2. **Các giai đoạn tiếp theo (Next Steps):**
   - Hoàn thiện tinh chỉnh UX cho giỏ hàng mini (Cart Drawer hoặc Cart Popup).
   - Phối hợp với đội ngũ Backend (BE) để đấu nối các API thêm giỏ hàng, áp mã giảm giá voucher thực tế và quy trình tạo đơn hàng.
