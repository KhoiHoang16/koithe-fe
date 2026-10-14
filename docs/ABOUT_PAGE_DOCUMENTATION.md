# TÀI LIỆU CHI TIẾT DỰ ÁN: XÂY DỰNG & TỐI ƯU TRANG ABOUT (VỀ CHÚNG TÔI)
**Thương hiệu:** KOI Thé Vietnam  
**Phong cách thiết kế:** Luxury Minimalist & Editorial Storytelling (lấy cảm hứng từ chuẩn mực thẩm mỹ cao cấp của CHAGEE nhưng giữ trọn bộ nhận diện KOI Thé).  
**Ngày cập nhật:** Tháng 10/2026  

---

## 1. TỔNG QUAN YÊU CẦU & MỤC TIÊU
- Chuyển đổi trang giới thiệu (`/about`) từ một trang thông tin cơ bản thành một hành trình trải nghiệm thương hiệu (Brand Storytelling) ấn tượng, giàu tính thẩm mỹ và cảm xúc.
- Đảm bảo tính nhất quán cao về hình ảnh thương hiệu (Brand Identity), bảng màu (Palette), kiểu chữ (Typography) và hiệu ứng tương tác (Micro-interactions) trên toàn hệ thống.
- Giải quyết triệt để các vấn đề về cuộn trang (Scroll Restoration), Smart Header tự ẩn/hiện, và điều hướng mượt mà giữa các trang.

---

## 2. KIẾN TRÚC & CÁC CHƯƠNG NỘI DUNG TRANG ABOUT (`/about`)

Trang `/about` được tinh chỉnh thành trải nghiệm 3 chương (3-Chapter Experience) gọn gàng, tinh tế và tập trung tuyệt đối vào câu chuyện nhãn hàng:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HERO BANNER (100vh)                                     │
│    Tòa nhà Flagship KOI Thé + "CÂU CHUYỆN THƯƠNG HIỆU"     │
├─────────────────────────────────────────────────────────────┤
│ 2. CHƯƠNG 1: KHỞI NGUỒN & DI SẢN (100vh / Split Screen)    │
│    Nghệ nhân trà Đài Loan (Trái) + Câu chuyện (Phải)       │
├─────────────────────────────────────────────────────────────┤
│ 3. CHƯƠNG 2: MỤC TIÊU THƯƠNG HIỆU (100vh)                  │
│    Backdrop vách gỗ KOI Thé + 3 Trụ cột chiến lược (Trái)  │
└─────────────────────────────────────────────────────────────┘
```

### Chương 1: Hero Section (Tòa nhà Flagship & Tiêu đề thương hiệu)
- **Vị trí file:** [`src/pages/customer/about-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/customer/about-page.tsx)
- **Hình ảnh nền:** `/public/about-flagship-v3.jpg` (Được AI sinh thực tế với kiến trúc uốn lượn kính hiện đại, ban công tiểu cảnh bonsai cao cấp, hệ thống đèn vàng ấm cúng, logo nổi 3D `KOI Thé` ánh kim trên mặt dựng kính và đỉnh tòa nhà).
- **Thiết kế & Layout:**
  - Chiều cao `100vh` toàn màn hình (Full viewport).
  - Loại bỏ các dải overlay đen dày đáy màn hình để giữ độ sáng và vẻ sang trọng cho tòa nhà.
  - Phủ gradient nhẹ tinh tế ở đỉnh đầu để đảm bảo các nút điều hướng trên thanh Header luôn dễ đọc.
  - Tiêu đề **"CÂU CHUYỆN THƯƠNG HIỆU"** đặt tại đáy trung tâm với kích thước chữ vừa phải, thanh lịch (`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-[0.18em]`) kèm hiệu ứng đổ bóng mềm.
  - Chỉ báo cuộn *"Cuộn để khám phá"* kèm mũi tên động nảy nhẹ (`animate-bounce`).

### Chương 2: Khởi Nguồn & Di Sản ("TINH HOA TỪ NGUỒN CỘI")
- **Layout:** Bố cục chia đôi đối xứng (Split-Screen 50/50) với chiều cao `min-h-screen`, đệm dọc lớn (`py-24 lg:py-32`) ngăn tràn khung nhìn.
- **Hình ảnh minh họa:** `/public/about-origin-left.jpg`
  - Đặt ở cột **bên trái**, giới hạn chiều rộng chuẩn mực `max-w-[660px]`, bo góc `rounded-3xl` và đổ bóng sâu `shadow-2xl`.
  - Bức hình mô tả nghệ nhân trà Đài Loan bên đồi trà xanh ngút ngàn, tay nâng niu búp trà tươi hướng về phía văn bản bên phải, tạo dòng chảy thị giác tự nhiên.
- **Nội dung bên phải:**
  - Eyebrow tag: *"Hành Trình Khởi Nghiệp"*.
  - Tiêu đề: **"TINH HOA TỪ NGUỒN CỘI"** màu xanh đen `#0F2236`.
  - 3 đoạn văn giới thiệu ý nghĩa tên gọi **KOI Thé** (sự kết hợp giữa triết lý thịnh vượng Á Đông và nghệ thuật thưởng trà tinh tế phương Tây) cùng cam kết trân châu nấu mới mỗi 4 giờ.
  - Nút bấm viên thuốc (Pill Button) **"Khám Phá Các Dòng Trà"** đồng bộ phong cách tối giản với trang chủ.

### Chương 3: Mục Tiêu Thương Hiệu ("MỤC TIÊU")
- **Bối cảnh:** Thay thế phần giới thiệu món nước (chuyển sang trang Menu) bằng khẳng định mục tiêu phát triển bền vững theo đúng gợi ý của người dùng.
- **Hình ảnh nền:** `/public/about-goals-wordmark.jpg`
  - Vách gỗ nan sọc (fluted wood panels) cao cấp liền mạch, ánh sáng cove lighting ấm áp.
  - Chỉ hiển thị chữ nổi **`KOI Thé`** phát sáng 3D bằng kim loại đồng/vàng (loại bỏ hoàn toàn các chi tiết cửa thừa và biểu tượng tròn sai lệch để đồng nhất logo).
- **Nội dung 3 trụ cột:**
  1. **Trà Thủ Công Thượng Hạng:** Tuyển chọn nghiêm ngặt những búp trà tươi nguyên bản từ cao nguyên chè danh tiếng, ủ và pha chế theo quy chuẩn nghiêm ngặt.
  2. **Trân Châu Hoàng Kim Độc Quyền:** Nấu mới mỗi 4 giờ với tỷ lệ vàng, đảm bảo độ dai mềm óng ánh và hương vị tươi ngon trọn vẹn.
  3. **Lan Tỏa Văn Hóa Trà Đạo:** Kết nối cộng đồng thông qua từng tách trà ngon, mang lại năng lượng tích cực và phong cách sống lành mạnh.

---

## 3. CÁC CẬP NHẬT TRÊN TOÀN BỘ HỆ THỐNG (OTHER PAGES & LAYOUTS)

### 3.1. Cơ Chế Cuộn Toàn Cục (Global Scroll To Top)
- **Vấn đề trước đây:** Trình duyệt giữ nguyên vị trí cuộn khi người dùng click *"Tìm Hiểu Thêm"* từ trang chủ (`scrollY ≈ 900px`), khiến khi mở `/about` người dùng bị rớt thẳng vào Chương 1 thay vì xem Hero Section từ đầu trang.
- **Giải pháp triển khai:**
  1. Tạo component mới [`src/components/common/scroll-to-top.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/common/scroll-to-top.tsx):
     - Đặt `window.history.scrollRestoration = 'manual'` ngăn chặn trình duyệt can thiệp vị trí cuộn cũ.
     - Kích hoạt `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })` kết hợp `requestAnimationFrame` và timeout hỗ trợ các component lazy-load mount an toàn.
  2. Tích hợp `RootLayout` trong [`src/router/index.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/router/index.tsx) bọc qua tất cả các trang, đảm bảo **bất kỳ trang nào trong website đều luôn bắt đầu từ đầu trang**.

### 3.2. Nâng Cấp Smart Header & Customer Layout
- **File:** [`src/components/layout/customer-layout.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/layout/customer-layout.tsx)
- **Hỗ trợ Transparent Navbar:** Cả trang chủ (`/`) và trang giới thiệu (`/about`) đều dùng header trong suốt khi ở đỉnh trang, làm nổi bật hình ảnh Hero toàn màn hình.
- **Smart Header Behaviour:** Tự động ẩn khi cuộn xuống (`-translate-y-full`) và hiển thị lại ngay khi cuộn lên (`translate-y-0`) để tối đa hóa không gian trải nghiệm.
- **Scroll State Reset:** Đồng bộ reset trạng thái header (`prevScrollY = 0`, `isScrolled = false`, `isVisible = true`) ngay khi chuyển route.
- **Footer Brand Links:** Đồng bộ tất cả các link liên quan đến thương hiệu trong footer trỏ về `/about`.

### 3.3. Tối Ưu Trang Chủ (`HomePage`)
- **File:** [`src/pages/customer/home-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/customer/home-page.tsx)
- Cập nhật nút bấm *"Tìm Hiểu Thêm"* trong section *"VỀ CHÚNG TÔI"* liên kết trực tiếp sang `<Link to="/about">`.
- Chuẩn hóa style các nút bấm viền mảnh bo tròn thanh lịch (`rounded-full border border-neutral-300 hover:border-[#0F2236]`).

### 3.4. Tối Ưu Quản Trị Viên (`AdminLayout`)
- **File:** [`src/components/layout/admin-layout.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/layout/admin-layout.tsx)
- Thêm `ref={mainRef}` vào thẻ `<main>` và `useEffect` theo dõi `location.pathname` để tự động đưa khung nội dung quản trị lên đỉnh (`scrollTop = 0`) khi chuyển giữa các trang con (Sản phẩm, Đơn hàng, Danh mục, v.v.).

---

## 4. DANH MỤC TÀI NGUYÊN HÌNH ẢNH MỚI (ASSETS)

Tất cả hình ảnh đã được lưu trữ trong thư mục `/public` với tỷ lệ khung hình và độ phân giải cao:

| Tên File | Vị trí sử dụng | Nội dung & Đặc tả |
| :--- | :--- | :--- |
| `about-flagship-v3.jpg` | Hero Banner `/about` | Tòa nhà Flagship hiện đại bằng kính, ban công cây xanh bonsai, logo KOI Thé phát sáng 3D. |
| `about-origin-left.jpg` | Mục 1: Khởi Nguồn | Nghệ nhân trà bên nương chè Đài Loan, búp trà tươi hướng sang bên phải. |
| `about-goals-wordmark.jpg`| Mục 2: Mục Tiêu | Vách gỗ nan dọc cao cấp, ánh sáng cove lighting, logo KOI Thé chữ nổi 3D chuẩn xác. |

---

## 5. BẢNG TỔNG HỢP CÁC FILE ĐÃ TẠO & CHỈNH SỬA

| File | Hành động | Nội dung thay đổi |
| :--- | :--- | :--- |
| [`src/pages/customer/about-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/customer/about-page.tsx) | **Tạo mới** | Xây dựng toàn bộ giao diện 3 chương trang About KOI Thé. |
| [`src/components/common/scroll-to-top.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/common/scroll-to-top.tsx) | **Tạo mới** | Component xử lý cuộn lên đỉnh trang tức thì trên toàn website. |
| [`src/router/lazy-pages.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/router/lazy-pages.tsx) | Cập nhật | Xuất lazy component `AboutPage`. |
| [`src/router/index.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/router/index.tsx) | Cập nhật | Khai báo tuyến đường `/about` & bọc `RootLayout` chứa `ScrollToTop`. |
| [`src/components/layout/customer-layout.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/layout/customer-layout.tsx) | Cập nhật | Hỗ trợ transparent header cho `/about`, reset scroll state khi đổi trang, cập nhật footer. |
| [`src/components/layout/admin-layout.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/components/layout/admin-layout.tsx) | Cập nhật | Tự động cuộn thẻ `<main>` admin lên đầu khi chuyển mục. |
| [`src/pages/customer/home-page.tsx`](file:///e:/proc_uni/KoiTheFE/koithe-fe/src/pages/customer/home-page.tsx) | Cập nhật | Chuẩn hóa nút bấm và liên kết sang trang `/about`. |

---

## 6. KIỂM THỬ & ĐÁNH GIÁ (VERIFICATION)
- **Kiểm tra biên dịch:** Chạy `npm run build` thành công 100% không có lỗi TypeScript hay cú pháp.
- **Kiểm tra trên trình duyệt thực tế:**
  1. Truy cập từ Homepage cuộn xuống nút *"Tìm Hiểu Thêm"* -> click -> chuyển hướng sang `/about` ở vị trí `scrollY = 0`.
  2. Hero banner và thanh navbar trong suốt hiển thị chuẩn xác, không bị giật hay rớt vào giữa trang.
  3. Bố cục hình ảnh và văn bản cân đối, các nút bấm đồng bộ thiết kế.
  4. Chuyển đổi giữa các trang khác (`/menu`, `/track-order`, Admin pages) đều đảm bảo luôn xuất phát từ đầu trang.
