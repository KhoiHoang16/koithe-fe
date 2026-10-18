# TÀI LIỆU CẬP NHẬT: TỐI ƯU HÓA & NÂNG CẤP TRANG CHI TIẾT SẢN PHẨM (PRODUCT DETAIL PAGE)

**Dự án:** KOI Thé Vietnam - Hệ Thống Bán Hàng Đa Kênh (Omnichannel)  
**Tập tin sửa đổi:** [`src/pages/customer/product-detail-page.tsx`](../src/pages/customer/product-detail-page.tsx)  
**Nhánh Git:** `update/auth-page` (Cập nhật sau commit `e6757e7`)  
**Ngày thực hiện:** Tháng 10/2026  

---

## 1. TỔNG QUAN YÊU CẦU & BỐI CẢNH THAY ĐỔI

Trang chi tiết sản phẩm (`/menu/:id`) trước đây gặp một số hạn chế về mặt thị giác và trải nghiệm người dùng:
1. **Bố cục phân tán:** Chia thành 2 khối thẻ riêng biệt (khối hiển thị ảnh sản phẩm và khối tùy chọn món nước), chiều cao 2 bên không cân đối và phải cuộn nhiều lần mới thấy hết tùy chọn.
2. **Nhiều chi tiết gây xao nhãng:** Thanh Breadcrumbs điều hướng, phần "Tầng hương vị", cùng thanh trượt "Gợi ý dành cho bạn" khiến trang bị rối mắt và phân tán sự chú ý của khách hàng.
3. **Kích thước nút bấm cồng kềnh:** Các tùy chọn kích cỡ (Size), lượng đường và lượng đá hiển thị dạng nút radio to bản chiếm rất nhiều diện tích màn hình.
4. **Lỗi UX & cuộn chuột ở Topping:** Danh sách topping dạng 1 cột bị bó hẹp trong khung cuộn nhỏ có thanh kéo xám thô kệch; khi di chuột vào con lăn không hoạt động do bị thư viện smooth scroll can thiệp.
5. **Cảm giác thưa trên màn hình lớn:** Sau khi tinh gọn, thẻ sản phẩm ban đầu hơi nhỏ so với tổng thể màn hình desktop (1080p).

---

## 2. CÁC NỘI DUNG ĐÃ TRIỂN KHAI CHI TIẾT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THẺ SẢN PHẨM THỐNG NHẤT (max-w-6xl)                  │
├──────────────────────────────────────┬──────────────────────────────────────┤
│           CỘT TRÁI (Ảnh & Mô tả)      │     CỘT PHẢI (Bộ tùy chọn & Đặt)     │
│ ┌──────────────────────────────────┐ │ 1. Đơn giá to bản + Badge Size (ml)  │
│ │   Ảnh Vuông Tĩnh (max-h-340px)   │ │ 2. Dropdown Size (S, M, L)          │
│ │   Huy hiệu Nổi Bật & KOI Thé     │ │ 3. Dropdown Lượng Đường (0%-100%)    │
│ └──────────────────────────────────┘ │ 4. Dropdown Lượng Đá (0%-100%)       │
│ • Danh mục: TRÀ SỮA ĐẶC BIỆT         │ 5. Lưới Topping 2 Cột (6 món phẳng) │
│ • Tên món: IN HOA ĐẬM NÉT            │ 6. Ghi chú cho Barista               │
│ • Đánh giá sao (4.9) & Đã bán (1420+)│ 7. Stepper (+/-) & Nút Thêm vào giỏ  │
│ • Câu chuyện & Mô tả cốt trà ủ tươi │    (Giá tiền nhảy realtime)          │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 2.1. Loại bỏ các thành phần thừa, tập trung vào sản phẩm chính
- **Gỡ bỏ thanh Breadcrumbs:** Loại bỏ dòng điều hướng nhỏ dưới header để giao diện bắt đầu ngay vào thẻ sản phẩm một cách dứt khoát.
- **Gỡ bỏ khu vực "Tầng hương vị":** Giảm tải thông tin đồ họa không cần thiết.
- **Gỡ bỏ "Gợi ý dành cho bạn":** Loại bỏ hoàn toàn component gợi ý và hook React Query gọi sản phẩm liên quan (`catalogApi.getProducts`), giúp trang tải nhanh hơn và tập trung 100% vào món nước khách đang chọn.
- **Gỡ bỏ nút Trái tim (Lưu yêu thích):** Xóa bỏ nút icon Heart ở góc ảnh sản phẩm cùng state `isFavorite`, trả lại không gian hình ảnh sản phẩm tối giản, thuần khiết.

### 2.2. Tái cấu trúc hình ảnh & thông tin món (Lấy cảm hứng từ CHAGEE & KOI Thé)
- **Ảnh sản phẩm dạng vuông (`aspect-square max-h-[340px]`):** Thay thế khung hình chữ nhật kéo dài cũ bằng tỷ lệ vuông cân đối. Đặt trên nền be ấm dịu mắt (`bg-[#F8F5F1]`), ảnh sản phẩm hiển thị chuẩn xác (`object-contain`), sắc nét và tĩnh lặng (không hiệu ứng hover phóng to gây chóng mặt).
- **Đưa thông tin mô tả xuống ngay dưới ảnh:** 
  - Eyebrow tag danh mục (`TRÀ SỮA ĐẶC BIỆT • KOI Handcrafted`).
  - Tên món in hoa đậm nét (`font-extrabold text-2xl sm:text-3xl`).
  - Huy hiệu xếp hạng sao vàng và số lượng ly đã bán thực tế.
  - Đoạn giới thiệu ngắn về cốt trà ủ tươi mỗi 4 giờ và hạt trân châu hoàng kim trứ danh.

### 2.3. Tối ưu hóa điều khiển tùy chọn: Chuyển sang Dropdown Select
- **Lựa chọn Kích cỡ (Size):** Chuyển từ nút bấm hàng ngang sang component `Select` cao cấp của Radix/Shadcn UI, hiển thị rõ tên size, dung tích ml (`360ml`, `500ml`, `700ml`) và giá bán tương ứng.
- **Lượng Đường & Lượng Đá:** Tinh gọn vào 2 dropdown select có mô tả gợi ý tinh tế (*Chuẩn vị (Khuyên dùng), Đậm ngọt, Vừa đá...*), giúp giao diện ngăn nắp, tiết kiệm hơn 60% không gian chiều dọc.

### 2.4. Khắc phục lỗi cuộn Topping & Nâng cấp sang Lưới 2 cột (Grid 2 cols)
- **Xử lý xung đột cuộn mượt (Lenis Smooth Scroll):**
  - **Nguyên nhân:** Dự án tích hợp thư viện `Lenis` cho hiệu ứng quán tính toàn trang. Mặc định `Lenis` bắt sự kiện lăn bánh xe chuột (`wheel event`) trên `window`, làm tê liệt con lăn khi trỏ chuột vào các khung con cuộn riêng (`overflow-y-auto`).
  - **Giải pháp:** Gắn thuộc tính `data-lenis-prevent` vào thẻ chứa danh sách, cho phép con lăn chuột hoạt động bình thường, mượt mà trở lại.
- **Chuyển đổi giao diện sang Lưới 2 cột (Grid 2 cols):**
  - Thay vì danh sách dọc 1 hàng dài bó hẹp trong khung cuộn 110px xuất hiện thanh cuộn xám thô, toàn bộ 6 loại topping (Trân Châu Hoàng Kim, Trân Châu Sương Mai, Pudding Trứng, Thạch Trái Cây, Kem Cheese Hoàng Gia, Thạch Đen Dừa) được chia thành **2 cột cân xứng** (`grid grid-cols-2 gap-2`).
  - **Hiển thị đầy đủ 100% topping trong tầm mắt:** Khách hàng không cần phải cuộn một chút nào, nhìn thấy ngay checkbox + tên + giá tiền, chọn nhanh chỉ với 1 click.
  - Tên topping dài nhất (*Kem Cheese Hoàng Gia*) vẫn hiển thị trọn vẹn, không bị đứt đoạn hay cắt chữ.

### 2.5. Hợp nhất thành một thẻ duy nhất (Single Unified Card) & Mở rộng kích thước
- **Gộp 2 thẻ thành 1:** Cột ảnh sản phẩm bên trái và cột tùy chỉnh bên phải được đưa vào chung một khối duy nhất với đường viền bo góc tròn `rounded-3xl border border-stone-200/90 shadow-sm`.
- **Mở rộng kích thước chuẩn màn hình (`max-w-6xl` ~1152px):** 
  - Khắc phục triệt để cảm giác thẻ bị nhỏ hoặc lọt thỏm trên màn hình máy tính 1080p.
  - Tăng khoảng đệm trong (`p-6 sm:p-8 lg:p-9`) và khoảng cách giữa 2 cột (`gap-8 lg:gap-10 xl:gap-12`).
  - Nút bấm thêm vào giỏ hàng và ô số lượng tăng chiều cao lên `h-11` đầy đặn, bấm đầm tay.
- **Chuẩn Above the Fold:** Toàn bộ thẻ nằm trọn vẹn trong khung nhìn màn hình đầu tiên (First Viewport), người dùng không cần phải cuộn chuột xuống vẫn xem được hết thông tin và nhấn "Thêm vào giỏ hàng".
- **Hỗ trợ Mobile toàn diện:** Tích hợp thanh Sticky Action Bar nổi bật dưới đáy màn hình trên các thiết bị di động (`lg:hidden fixed bottom-0`).

---

## 3. KIỂM THỬ KỸ THUẬT & TRẠNG THÁI HỆ THỐNG

| Hạng mục kiểm tra | Công cụ / Phương thức | Kết quả |
| :--- | :--- | :--- |
| **Kiểm tra kiểu dữ liệu (Type-check)** | `npx tsc --noEmit` | **Đạt** (Exit code: 0, không có bất kỳ lỗi TypeScript nào). |
| **Hiển thị trực quan (Visual Inspection)** | Browser Subagent (1872x993 Viewport) | **Đạt** (Thẻ cân đối, ảnh sắc nét, hiển thị trọn vẹn Above the Fold). |
| **Tương tác nút bấm & Topping** | Kiểm thử click chọn Topping / Size | **Đạt** (Checkbox đổi màu `primary`, tính toán tổng giá tiền nhảy realtime chính xác). |
| **Thêm vào giỏ hàng** | Zustand Store (`useCartStore`) + Sonner Toast | **Đạt** (Thông báo toast thành công kèm nút chuyển đến giỏ hàng `/cart`). |

---

---

## 4. TỐI ƯU HÓA TRANG GIỎ HÀNG (`/cart`) & THANH TIẾN ĐỘ ĐẶT HÀNG (CHECKOUT STEPPER)

Đồng bộ với trải nghiệm đặt món cao cấp, trang Giỏ hàng và quy trình đặt hàng đã được nâng cấp toàn diện:
1. **Thanh tiến độ 3 bước (`CheckoutStepper`):**
   * Đặt tại đầu các trang: **Giỏ hàng (`/cart`)** ➔ **Thanh toán (`/checkout`)** ➔ **Hoàn tất (`/order-success`)**.
   * Thiết kế trực quan với 3 node tròn kết nối bằng dải tiến trình, hiển thị rõ bước hiện tại, các bước đã hoàn tất (có dấu tick xanh và cho phép click quay lại) và bước kế tiếp.
2. **Thanh tiến trình Freeship (Gamification Banner):**
   * Tự động tính toán số tiền cần mua thêm để đạt mốc Miễn phí giao hàng (100.000 đ).
   * Thanh tiến trình phần trăm (%) chuyển màu sinh động kèm thông báo chúc mừng khi đạt điều kiện.
3. **Thẻ từng ly nước (Cart Item Card) chuẩn nét:**
   * Khung ảnh be `#F8F5F1` bo góc vuông vắn.
   * Các tag tùy chỉnh dạng chip bo tròn nhỏ xinh (Size, Đường, Đá).
   * Topping và lời dặn Barista đóng khung quote trang nhã.
   * Bộ nút tăng giảm số lượng (`- 1 +`) bo tròn êm ái, tính toán đơn giá/tổng giá tức thì.
4. **Hộp ưu đãi Voucher & Gợi ý nhanh (Quick Chips):**
   * Gợi ý sẵn các mã hot như `KOINEW (-20k)`, `FREESHIP (-15k)` giúp khách 1 chạm là áp dụng ngay không cần nhớ mã gõ tay.
   * Trạng thái voucher đã áp dụng màu xanh ngọc sang trọng kèm nút gỡ mã.
5. **Khối Tóm tắt đơn hàng (Order Summary):**
   * Bo góc `rounded-3xl` cố định bên cột phải (Sticky sidebar).
   * Thể hiện rõ phí ship (gạch ngang 15.000 đ nếu được Freeship), giảm giá voucher, tổng thanh toán to rõ và nút tiến hành thanh toán chuẩn thương hiệu.

---

## 5. TỔNG KẾT & BƯỚC TIẾP THEO

* Toàn bộ mã nguồn trang Chi tiết sản phẩm, Giỏ hàng, Thanh tiến độ đặt hàng và các trang liên quan đã hoàn thành đồng bộ, chỉn chu.
* Kiểm tra `npx tsc --noEmit` đạt 0 lỗi.
* Sẵn sàng tạo nhánh mới và push code.

