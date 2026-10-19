# TÀI LIỆU TỔNG HỢP CẬP NHẬT: TRANG CÁ NHÂN, HEADER/AVATAR & LỊCH SỬ ĐƠN HÀNG

**Dự án:** KOI Thé Vietnam - Frontend (`koithe-fe`)  
**Nhánh:** `update/ecommerce-flow-and-ui`  
**Ngày cập nhật:** 19/10/2026  
**Mục tiêu chính:** 
1. **Trang cá nhân (`/profile`):** Tái thiết kế toàn diện theo phong cách Tea Craft cao cấp (lấy cảm hứng từ CHAGEE), chuyển đổi tối ưu từ định dạng mobile sang responsive web.
2. **Thanh điều hướng (`CustomerLayout`):** Bỏ menu dropdown rườm rà; hiển thị tên khách hàng ngay cạnh Avatar và chuyển thẳng tới trang Profile khi bấm.
3. **Trang Lịch sử đơn hàng (`/orders`):** Đồng bộ nền sóng 3D matcha kem (`/checkout-bg.png`), tích hợp bộ lọc cố định (Sticky Sidebar), thẻ món nước chuẩn Card Giỏ Hàng, và cơ chế Accordion đóng/mở thông minh.
4. **Chuẩn hóa nghiệp vụ Phục vụ tại quầy (Takeaway):** Lược bỏ mọi thành phần giao hàng (phí ship, sổ địa chỉ nhận hàng, theo dõi lộ trình giao hàng, tự hủy đơn của khách).

---

## 1. TỔNG QUAN CÁC TẬP TIN ĐÃ THAY ĐỔI

| STT | Tập tin | Thư mục | Nội dung can thiệp |
|:---:|---------|---------|-------------------|
| 1 | `profile-page.tsx` | `src/pages/customer/` | Thiết kế lại toàn bộ Profile theo phong cách botanical nghệ thuật; thẻ thành viên "TEA Seeker" sage green; popup FAQ; lược bỏ "Sổ địa chỉ" và "Món yêu thích"; thêm modal xác nhận đăng xuất tối giản. |
| 2 | `customer-layout.tsx` | `src/components/layout/` | Bỏ DropdownMenu trên Avatar; thêm tên người dùng (`user.hoTen`) bên phải Avatar; Avatar + tên trở thành liên kết bấm vào đi thẳng tới `/profile`. |
| 3 | `order-history-page.tsx` | `src/pages/customer/` | Thêm Sticky Sidebar bộ lọc bên trái (tìm kiếm + trạng thái đơn); hiển thị danh sách món chuẩn Card Giỏ Hàng; cơ chế Accordion tự mở đơn đang pha chế, thu gọn đơn hoàn thành; nút Chi tiết đơn / Thu gọn đồng bộ màu; nút Đặt lại đơn nhanh. |
| 4 | `order-api.ts` | `src/features/orders/api/` | Chuẩn hóa `MOCK_ORDERS` 100% sang `TAKEAWAY` (`phiGiaoHang: 0`), bổ sung ảnh ly trà thật, topping và variant chuẩn giỏ hàng. |
| 5 | `login-page.tsx` | `src/pages/auth/` | Bổ sung thanh nút đăng nhập nhanh (Quick Dev Login) cho Khách hàng & Quản trị viên để kiểm thử tiện lợi. |
| 6 | `profile-botanical-banner.jpg` | `public/` | Tạo mới asset banner minh họa thực vật chanh & lá trà phong cách vintage botanical art cho Header Profile. |

---

## 2. CHI TIẾT TỪNG PHÂN HỆ NÂNG CẤP

### 2.1. Thanh Điều Hướng & Avatar Khách Hàng (`CustomerLayout`)
- **Tập tin:** `src/components/layout/customer-layout.tsx`
- **Thay đổi chính:**
  - **Lược bỏ Dropdown Menu:** Khách hàng không cần phải bấm xổ dropdown với các liên kết trùng lặp.
  - **Hiển thị Tên người dùng cạnh Avatar:** Bổ sung text `user.hoTen` (ví dụ: *Nguyễn Văn A*) ngay bên phải Avatar với font chữ đậm vừa vặn, bo viền tinh tế và có hiệu ứng hover đổi màu thương hiệu.
  - **Chuyển hướng trực tiếp:** Bấm vào Avatar hoặc tên sẽ chuyển thẳng người dùng đến `/profile`.

```tsx
{/* User Profile Link (Direct Link to Profile + User Name) */}
{isAuthenticated && user ? (
  <Link
    to="/profile"
    className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full transition-all group ${
      isTransparentMode
        ? 'text-white hover:bg-white/10'
        : 'text-stone-800 hover:bg-stone-100/90'
    }`}
    title="Trang cá nhân của bạn"
  >
    <Avatar className="h-8 w-8 ring-1 ring-border group-hover:ring-primary/50 transition-all shrink-0">
      <AvatarImage src={user.anhDaiDien} alt={user.hoTen} />
      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
        {getInitials(user.hoTen)}
      </AvatarFallback>
    </Avatar>
    <span className="text-xs sm:text-sm font-semibold tracking-tight truncate max-w-[120px] sm:max-w-[170px] group-hover:text-primary transition-colors">
      {user.hoTen}
    </span>
  </Link>
) : ( ... )}
```

---

### 2.2. Trang Hồ Sơ Cá Nhân (`ProfilePage`)
- **Tập tin:** `src/pages/customer/profile-page.tsx`
- **Hình nền thương hiệu:** Áp dụng hình nền sóng 3D matcha kem (`/checkout-bg.png`) cố định toàn trang.
- **Header tranh thực vật nghệ thuật:**
  - Khung ảnh banner tỉ lệ 4:1 với tranh minh họa quả chanh và lá trà cổ điển (`/profile-botanical-banner.jpg`).
  - Avatar lớn bo tròn nổi trên nền banner, kèm Họ tên khách hàng, số điện thoại ẩn bảo mật (`+84 901****67`) và huy hiệu hạng thẻ vàng hổ phách `TEA SEEKER`.
- **Thẻ thành viên "TEA Seeker":**
  - Màu xanh xám xô thơm (*Sage Green* `#4F675A`) đậm chất trà nghệ nhân.
  - Thanh đo tiến trình tích lũy: `1/10 Cup` (Tích thêm 9 ly đồ uống để nâng cấp đặc quyền Gold Member).
  - Nút *"Quyền lợi của tôi >"* mở Popup chi tiết đặc quyền thành viên (tích điểm lá trà, quà tặng sinh nhật, ưu đãi size).
- **Menu tiện ích "Tài khoản của tôi":**
  - **Đã loại bỏ:** *Sổ địa chỉ nhận hàng* (do hệ thống phục vụ tại quầy, không giao hàng tận nơi), *Món yêu thích* (đơn giản hóa theo yêu cầu).
  - **3 mục cốt lõi còn lại:**
    1. **Những câu hỏi thường gặp:** Bật Dialog giải đáp thắc mắc về cách tính Lá Trà (10.000đ = 1 Lá Trà = 1.000đ khi thanh toán), cách tính Cup và tích điểm tại quầy.
    2. **Lịch sử đơn hàng:** Chuyển nhanh sang trang `/orders`.
    3. **Đăng xuất tài khoản:** Kích hoạt modal xác nhận bảo vệ.
- **Modal xác nhận đăng xuất tối giản:**
  - Bỏ icon trang trí và đoạn text mô tả dài dòng.
  - Chỉ giữ lại tiêu đề **"Xác nhận đăng xuất"** cùng 2 nút: **[Hủy]** (quay lại trang) và **[Đăng xuất]** (màu đỏ vang rose-600, thực hiện logout và chuyển hướng về `/login`).

---

### 2.3. Trang Lịch Sử Đơn Hàng (`OrderHistoryPage`)
- **Tập tin:** `src/pages/customer/order-history-page.tsx`
- **Bố cục 2 cột linh hoạt (Sidebar + Feed):**
  - **Cột trái - Bộ lọc cố định (Sticky Sidebar `lg:sticky lg:top-24`):**
    - **Ô tìm kiếm:** Lọc tức thì theo mã đơn hàng (ví dụ: `KOI-20261019-01`) hoặc tên món nước bất kỳ.
    - **Bộ lọc trạng thái đơn (3 mục tinh gọn):**
      - *Tất cả đơn hàng* (icon Package)
      - *Đang pha chế* (icon Coffee)
      - *Đã hoàn thành* (icon CheckCircle2)
      *(Đã bỏ badge đếm số và loại bỏ tab "Đã hủy" theo nghiệp vụ chỉ nhân viên tại quầy mới được hủy).*
    - **Hộp thoại Hỗ trợ tại quầy:** Hotline `1900 636 123` (08:30 – 22:00 hàng ngày).
- **Cơ chế Accordion thông minh:**
  - **Đơn chưa hoàn thành (*Đang pha chế*):** **Tự động mở sẵn** toàn bộ danh sách các ly nước để khách hàng nắm bắt ngay các yêu cầu đường/đá/topping khi đang chờ nhận món tại quầy mà không cần thêm thao tác click.
  - **Đơn đã hoàn thành (*Hoàn thành*):** **Mặc định thu gọn**, hiển thị hàng ảnh mini-thumbnails (tối đa 3 ly kèm tag `+X`), dòng tóm tắt tên món, tổng tiền thanh toán và nút **`Chi tiết đơn ▾`**.
- **Đồng bộ phong cách nút bấm (Button Styling):**
  - Nút **`Chi tiết đơn ▾`** (ở trạng thái thu gọn) sử dụng kiểu viền outline màu xám trung tính (`border-stone-200 text-stone-700 hover:bg-stone-100`), đồng bộ 100% với nút **`Thu gọn ▴`** (ở trạng thái mở rộng).
  - Không còn số đếm thừa `(2)` hay `(1)` trong nút chi tiết đơn.
  - Phần header đơn hàng phía trên được dọn sạch hoàn toàn nút bấm, chỉ để thông tin `THANH TOÁN: VNPAY / MOMO / COD`.
- **Cụm nút hành động chân đơn hàng (Expanded Footer):**
  - **`[Đặt lại đơn này]` (bên trái):** Nút màu xanh thương hiệu (`bg-primary`) nổi bật nhất card, tự động đẩy toàn bộ sản phẩm trong đơn kèm đúng size, lượng đường, đá, topping vào giỏ hàng (`useCartStore`) và điều hướng tới `/cart`.
  - **`[Thu gọn ▴]` (bên phải):** Nút viền outline xám nhẹ, cho phép thu gọn đơn hàng nhanh chóng sau khi xem xong.
  - *(Đã loại bỏ nút "Xem tiến trình" vì trạng thái pha chế/hoàn thành đã được thể hiện rõ ràng trên badge).*
- **Thẻ món nước chuẩn Cart Item:**
  - Khung ảnh vuông trên nền be nhạt `#F8F5F1`.
  - Badge tag góc dưới ảnh: `Size S`, `Size M`, `Size L`.
  - Các chip thông số: Mức đường (70%), Mức đá (50%), Chip Topping vàng hổ phách (Trân Châu Hoàng Kim, Pudding Trứng).
  - Khung lời dặn Barista (nếu có).
  - Hiển thị số lượng và đơn giá/món rõ ràng.

---

### 2.4. Chuẩn Hóa Nghiệp Vụ Phục Vụ Tại Quầy (Takeaway / Counter Service)
Toàn bộ hệ thống trải nghiệm khách hàng đã được đồng bộ với mô hình kinh doanh thực tế:
1. **Không có phí vận chuyển:** `phiGiaoHang = 0` trên tất cả hóa đơn và dữ liệu mock.
2. **Không có địa chỉ giao hàng:** Bỏ "Sổ địa chỉ nhận hàng" trên Profile, bỏ trường nhập địa chỉ giao hàng.
3. **Chỉ hiển thị tag Phục vụ tại quầy:** `Phục vụ tại quầy` đi kèm icon Store.
4. **Không cho phép khách hàng tự hủy đơn:** Đơn hàng sau khi đã thanh toán và gửi tới quầy sẽ do Barista/Thu ngân xử lý theo quy trình POS cửa hàng.

---

## 3. BẢNG KIỂM TRA ĐẢM BẢO CHẤT LƯỢNG (QA CHECKLIST)

| Hạng mục kiểm tra | Trạng thái | Chi tiết xác nhận |
|-------------------|:----------:|-------------------|
| TypeScript Typecheck |  PASS | `npx tsc --noEmit` hoàn tất không có bất kỳ lỗi nào (`exit code 0`). |
| Vite Dev Server |  PASS | Chạy ổn định không crash tại `http://localhost:5173/`. |
| Header Navigation |  PASS | Avatar hiển thị kèm tên người dùng; bấm vào chuyển thẳng tới `/profile`; dropdown cũ đã bị xóa. |
| Profile Layout |  PASS | Banner tranh thực vật cổ điển hiển thị sắc nét; thẻ Sage Green TEA Seeker đầy đủ tiến trình; modal FAQ hoạt động tốt; Sổ địa chỉ và Món yêu thích đã được dọn sạch. |
| Modal Đăng xuất |  PASS | Bấm Đăng xuất hiện modal tối giản chỉ gồm tiêu đề và 2 nút Hủy / Đăng xuất; bấm Hủy đóng modal an toàn; bấm Đăng xuất xóa session và về `/login`. |
| Order History Filter |  PASS | Sticky sidebar cuộn mượt; tìm kiếm tức thì; chỉ còn 3 tab trạng thái (Tất cả, Đang pha chế, Đã hoàn thành); đã bỏ tab Đã hủy. |
| Order Collapsible |  PASS | Đơn đang pha chế mở sẵn; đơn hoàn thành thu gọn; nút Chi tiết đơn dạng viền xám không có số đếm; bấm mở/đóng mượt mà. |
| Order Footer Buttons |  PASS | Nút "Đặt lại đơn này" nằm bên trái; nút "Thu gọn" nằm bên phải; nút "Xem tiến trình" đã được dỡ bỏ. |
| Reorder to Cart |  PASS | Bấm Đặt lại đơn nạp toàn bộ ly nước vào giỏ và nhảy về `/cart` chính xác. |

---

## 4. HƯỚNG DẪN PUSH CODE LÊN GITHUB

Người dùng có thể tiến hành kiểm tra và đẩy toàn bộ các thay đổi lên remote repository theo các bước sau trong terminal:

```bash
# 1. Kiểm tra trạng thái các file đã thay đổi
git status

# 2. Thêm tất cả các file đã cập nhật và tài liệu mới
git add .

# 3. Tạo commit với thông điệp rõ ràng
git commit -m "feat(customer): upgrade profile page, header user link, and counter order history experience"

# 4. Đẩy mã nguồn lên nhánh hiện tại
git push origin update/ecommerce-flow-and-ui
```
