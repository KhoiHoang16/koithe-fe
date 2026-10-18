# TÀI LIỆU TỔNG HỢP CẬP NHẬT: QUY TRÌNH THANH TOÁN, HÌNH NỀN THƯƠNG HIỆU & TINH GIẢN GIAO DIỆN

**Dự án:** KOI Thé Vietnam - Frontend (`koithe-fe`)  
**Ngày cập nhật:** Tháng 10/2026  
**Mục tiêu chính:** 
1. Nâng cấp toàn diện luồng trải nghiệm mua sắm & thanh toán (Cart -> Checkout -> Payment -> Order Success).
2. Tích hợp thanh tiến trình đơn hàng dùng chung (`CheckoutStepper`).
3. Khắc phục sự đơn điệu của các trang tiện ích bằng hệ thống hình nền sóng 3D màu matcha kem (`/checkout-bg.png`).
4. Tinh giản tối đa các banner Hero và thẻ sản phẩm (lược bỏ các yếu tố rườm rà, dư thừa).

---

## 1. TỔNG QUAN CÁC HẠNG MỤC ĐÃ TRIỂN KHAI

| STT | Phân hệ / Trang | Các tập tin can thiệp | Nội dung thay đổi chính |
|-----|----------------|-----------------------|-------------------------|
| 1 | **Thanh tiến trình đơn hàng** | `src/components/common/checkout-stepper.tsx` | Tạo mới component Stepper 3 bước trực quan, tự động đổi trạng thái và cho phép bấm quay lại giỏ hàng. |
| 2 | **Trang Giỏ hàng** (`/cart`) | `src/pages/customer/cart-page.tsx` | Redesign dạng thẻ kính mờ; bỏ banner Freeship và chip voucher gợi ý; bỏ link "Tiếp tục chọn thêm đồ uống"; bỏ icon emoji tiêu đề; thêm lưới 4 món "Có thể bạn cũng thích" kèm nút (+) thêm nhanh. |
| 3 | **Trang Thanh toán** (`/checkout`) | `src/pages/customer/checkout-page.tsx` | Tích hợp Stepper (Bước 2); bọc các form thông tin nhận hàng và phương thức thanh toán vào thẻ kính mờ `bg-white/95 backdrop-blur-md`. |
| 4 | **Trang Cổng QR** (`/checkout/payment`) | `src/pages/customer/payment-page.tsx` | Đưa vào khung nền toàn màn hình; thẻ thanh toán QR kính mờ bo tròn 3xl sang trọng. |
| 5 | **Trang Thành công** (`/order-success`) | `src/pages/customer/order-success-page.tsx` | Tích hợp Stepper (Bước 3 hoàn tất); thẻ chúc mừng đặt hàng kính mờ. |
| 6 | **Hình nền thương hiệu** | `public/checkout-bg.png` | Bổ sung asset ảnh sóng 3D matcha kem hữu cơ (`#EAEFE6`); áp dụng đồng bộ cố định (`bg-fixed`) cho toàn bộ luồng mua sắm & tiện ích. |
| 7 | **Trang Chi tiết món** (`/menu/:id`) | `src/pages/customer/product-detail-page.tsx` | Áp dụng hình nền matcha wave; tôn nổi thẻ sản phẩm duy nhất ở trung tâm (Xem thêm: `docs/PRODUCT_DETAIL_PAGE_DOCUMENTATION.md`). |
| 8 | **Trang Thực đơn** (`/menu`) | `src/pages/customer/menu-page.tsx` | Áp dụng hình nền matcha wave cho khu vực danh sách món; bỏ nút "Thêm vào giỏ" dư thừa trên từng thẻ; bỏ chỉ báo "Cuộn để khám phá". |
| 9 | **Trang Về chúng tôi** (`/about`) | `src/pages/customer/about-page.tsx` | Căn tiêu đề "CÂU CHUYỆN THƯƠNG HIỆU" sang góc dưới bên trái (Bottom-Left) đồng bộ với trang Thực đơn; bỏ chỉ báo "Cuộn để khám phá". |
| 10 | **Trang chủ** (`/`) | `src/pages/customer/home-page.tsx` | Bỏ chỉ báo "Cuộn để khám phá" ở Hero banner, tạo cảm giác điện ảnh, tối giản. |
| 11 | **Trang Tiện ích khác** | `track-order-page.tsx`, `profile-page.tsx` | Áp dụng nền sóng matcha và nâng cấp thẻ card kính mờ bo tròn. |

---

## 2. CHI TIẾT TỪNG TÍNH NĂNG & THIẾT KẾ

### 2.1. Thanh Tiến Trình Thanh Toán (`CheckoutStepper`)
- **Tập tin tạo mới:** [`src/components/common/checkout-stepper.tsx`](../src/components/common/checkout-stepper.tsx)
- **Cấu trúc 3 bước chuẩn E-commerce:**
  1. `Giỏ hàng` (Kiểm tra món nước)
  2. `Thanh toán` (Địa chỉ & phương thức)
  3. `Hoàn tất` (Xác nhận & giao hàng)
- **Trải nghiệm tương tác:**
  - Đường line nối đổi màu xanh `bg-primary` theo tiến trình hoàn thành.
  - Các bước đã hoàn thành hiển thị biểu tượng Check xanh lá đậm.
  - Bước hiện tại có vòng hào quang `ring-4 ring-primary/20`.
  - Hỗ trợ bấm vào bước đã qua (bước 1) để quay trở lại chỉnh sửa giỏ hàng tức thì.

### 2.2. Nâng Cấp Toàn Diện Trang Giỏ Hàng (`/cart`)
- **Tập tin:** [`src/pages/customer/cart-page.tsx`](../src/pages/customer/cart-page.tsx)
- **Tối ưu theo góp ý của người dùng:**
  - **Lược bỏ thành phần gây xao nhãng:**
    - Xóa thanh Freeship banner (do chính sách vận chuyển thực tế đơn giản, không cần thanh tiến trình phân tán sự chú ý).
    - Xóa các chip voucher gợi ý bên trong ô nhập mã (chỉ giữ ô input mã voucher sạch + nút "Áp dụng").
    - Xóa đường kẻ đứt phân cách và liên kết "Tiếp tục chọn thêm đồ uống" ở cuối danh sách món, giúp khối danh sách gọn gàng, liền mạch.
    - Xóa toàn bộ các icon emoji trang trí (`🍃`, `🪄`, `✨`) ở các tiêu đề để giữ đúng chất sang trọng, chững chạc của KOI Thé.
  - **Bổ sung khu vực "Có thể bạn cũng thích" (Cross-sell):**
    - Lấy 4 sản phẩm đồ uống gợi ý tự động loại trừ các món đã có trong giỏ hàng.
    - Hiển thị lưới 4 cột (mobile 2 cột) với ảnh studio, tên món, giá tiền và nút (+) tròn màu xanh bích thêm nhanh trực tiếp vào giỏ hàng kèm thông báo toast.
  - **Thẻ tóm tắt đơn hàng cố định (Sticky Sidebar):**
    - Bọc trong thẻ bo tròn 3xl màu trắng đục kính mờ (`bg-white/95 backdrop-blur-md`).
    - Nút "Tiến hành thanh toán" to bản, nổi bật với màu thương hiệu.

### 2.3. Hệ Thống Hình Nền Sóng Matcha 3D (`checkout-bg.png`)
- **Tập tin asset:** `public/checkout-bg.png`
- **Đặc trưng thị giác:** 
  - Phong cách 3D Organic Wave / Silk Fabric với các đường uốn lượn mềm mại như dòng sữa hay lá trà tươi.
  - Tone màu xanh matcha kem / sage green nhạt (`#EAEFE6` đến `#DDE6D5`), độ tương phản thấp.
  - Khi đặt các thẻ nội dung kính mờ (`bg-white/95 backdrop-blur-md border border-white/80 shadow-sm`) lên trên, thông tin giữ được 100% độ sắc nét và tương phản, đồng thời xoá sạch các khoảng trắng trơ trọi.
- **Kỹ thuật hiển thị:** Sử dụng thuộc tính `bg-cover bg-center bg-fixed` để tạo hiệu ứng thị giác bán parallax (ảnh đứng yên trong khi nội dung lướt nhẹ trên mặt sóng).
- **Phạm vi áp dụng:**
  - Quy trình thanh toán: `/cart`, `/checkout`, `/checkout/payment`, `/order-success/:orderId`.
  - Mua sắm & tra cứu: `/menu`, `/menu/:id`, `/track-order`, `/profile`.

### 2.4. Tinh Giản Banner Hero & Thẻ Sản Phẩm
- **Trang Về chúng tôi (`/about`):**
  - Chuyển tiêu đề `CÂU CHUYỆN THƯƠNG HIỆU` từ vị trí giữa màn hình sang **Góc dưới bên trái (Bottom-Left)**, gióng thẳng hàng với Logo KOI Thé góc trên, đồng nhất với trang `/menu`.
  - Tinh chỉnh kích thước chữ (`text-2xl sm:text-3xl md:text-4xl lg:text-5xl`) để dòng chữ 21 ký tự không che mất kiến trúc mặt tiền toà nhà flagship.
  - Xoá cụm nút nhấp nháy *"Cuộn để khám phá"*.
- **Trang chủ (`/`) & Trang Thực đơn (`/menu`):**
  - Lược bỏ cụm *"Cuộn để khám phá"*, giữ trọn tầm nhìn cinematic cho ảnh banner.
  - Trên trang `/menu`: **Xoá bỏ nút "Thêm vào giỏ"** màu xanh ở chân mỗi thẻ sản phẩm. Vì đồ uống cần tùy chỉnh Size, Đường, Đá, Topping nên việc bấm trực tiếp vào toàn bộ thẻ card để chuyển sang trang chi tiết món là luồng hành vi tự nhiên và chính xác nhất.

---

## 3. KIẾN TRÚC MÃ NGUỒN & DANH SÁCH FILE THAY ĐỔI

```
koithe-fe/
├── public/
│   └── checkout-bg.png                              (Asset mới: Ảnh nền sóng matcha 3D)
├── src/
│   ├── components/
│   │   └── common/
│   │       └── checkout-stepper.tsx                 (Component mới: Thanh tiến trình 3 bước)
│   └── pages/
│       └── customer/
│           ├── about-page.tsx                       (Can thiệp: Căn trái tiêu đề, bỏ scroll indicator)
│           ├── cart-page.tsx                        (Can thiệp: Redesign giỏ hàng, stepper, cross-sell)
│           ├── checkout-page.tsx                    (Can thiệp: Tích hợp stepper, card kính mờ, bg)
│           ├── home-page.tsx                        (Can thiệp: Bỏ scroll indicator)
│           ├── menu-page.tsx                        (Can thiệp: Bỏ nút thêm giỏ trên thẻ, bỏ scroll indicator, thêm bg)
│           ├── order-success-page.tsx               (Can thiệp: Tích hợp stepper, card kính mờ, bg)
│           ├── payment-page.tsx                     (Can thiệp: Nâng cấp container QR, card kính mờ, bg)
│           ├── product-detail-page.tsx              (Can thiệp: Card đơn nhất, dropdown, topping grid, bg)
│           ├── profile-page.tsx                     (Can thiệp: Card kính mờ, bg)
│           └── track-order-page.tsx                 (Can thiệp: Card kính mờ, timeline, bg)
└── docs/
    ├── PRODUCT_DETAIL_PAGE_DOCUMENTATION.md         (Tài liệu chi tiết trang Product Detail)
    └── CHECKOUT_AND_ECOMMERCE_UPGRADE_DOCUMENTATION.md (Tài liệu tổng hợp này)
```

---

## 4. HƯỚNG DẪN QUẢN LÝ GIT & TÁCH NHÁNH ĐỀ XUẤT

Hiện tại nhánh làm việc đang là `update/auth-page`. Do khối lượng công việc mở rộng sang toàn bộ luồng mua sắm & UI, dưới đây là 2 phương án quản lý Git:

### Phương án A (Khuyên dùng - Chuẩn Git Flow gọn gàng):
1. **Tạo nhánh mới chuyên trách:**
   ```bash
   # Từ nhánh hiện tại, rẽ sang nhánh mới mang tên phản ánh đúng tính năng
   git checkout -b feature/ecommerce-flow-and-ui-revamp
   ```
2. **Commit chia theo 4 nhóm tính năng rõ ràng (Atomic Commits):**
   - **Commit 1 (Product Detail):**
     ```bash
     git add src/pages/customer/product-detail-page.tsx docs/PRODUCT_DETAIL_PAGE_DOCUMENTATION.md
     git commit -m "feat(catalog): redesign product detail to unified card with compact dropdowns"
     ```
   - **Commit 2 (Checkout Flow & Stepper):**
     ```bash
     git add src/components/common/checkout-stepper.tsx src/pages/customer/cart-page.tsx src/pages/customer/checkout-page.tsx src/pages/customer/payment-page.tsx src/pages/customer/order-success-page.tsx
     git commit -m "feat(checkout): add checkout stepper, redesign cart and order flow cards"
     ```
   - **Commit 3 (Background & Hero Refinements):**
     ```bash
     git add public/checkout-bg.png src/pages/customer/about-page.tsx src/pages/customer/home-page.tsx src/pages/customer/menu-page.tsx src/pages/customer/profile-page.tsx src/pages/customer/track-order-page.tsx
     git commit -m "feat(ui): apply 3d matcha wave background and streamline hero banners"
     ```
   - **Commit 4 (Documentation):**
     ```bash
     git add docs/CHECKOUT_AND_ECOMMERCE_UPGRADE_DOCUMENTATION.md
     git commit -m "docs: add comprehensive documentation for ecommerce flow and ui upgrade"
     ```
3. **Push nhánh mới lên remote repository:**
   ```bash
   git push -u origin feature/ecommerce-flow-and-ui-revamp
   ```

### Phương án B (Nhanh gọn - 1 Commit tổng lực):
Nếu làm đồ án hoặc bài tập cá nhân cần tiết kiệm thời gian:
```bash
git checkout -b update/ecommerce-and-ui
git add .
git commit -m "feat(ecommerce): revamp product detail, cart, checkout flow with stepper and matcha wave theme"
git push -u origin update/ecommerce-and-ui
```
