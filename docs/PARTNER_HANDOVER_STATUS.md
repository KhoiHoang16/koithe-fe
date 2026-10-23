# Báo cáo bàn giao tiến độ & Trạng thái tích hợp hệ thống
*(System Handover & Integration Status Report)*

> **Ngày cập nhật:** 23/10/2026  
> **Nhánh nền tảng (Base Branch):** `integration/api-baseline` (áp dụng cho cả `koithe-fe` và `koithe-api`)  
> **Môi trường cục bộ:**  
> - Frontend Dev Server: `http://localhost:5173` (Vite Proxy `/api` $\rightarrow$ `http://localhost:8081`)  
> - Backend Spring Boot: `http://localhost:8081` (Docker Compose: PostgreSQL port 5433, Redis port 6380)  
> - Swagger UI: `http://localhost:8081/swagger-ui.html`

---

## 1. Mục đích tài liệu

Báo cáo này tổng hợp toàn bộ các tính năng, nâng cấp nghiệp vụ, cấu trúc dữ liệu và API đã được xây dựng và kiểm thử hoàn tất giữa **Frontend (`koithe-fe`)** và **Backend (`koithe-api`)**.  
Tài liệu giúp partner nắm bắt ngay hiện trạng dự án, tránh làm lại những gì đã có, và dễ dàng tiếp tục triển khai 9 task trong file [PARTNER_TASKS.md](./PARTNER_TASKS.md).

---

## 2. Những hạng mục đã hoàn thành (What Has Been Done)

### 2.1. Xác thực & Duy trì phiên đăng nhập (Auth State Persistence)
- **Vấn đề trước đây:** Mỗi khi người dùng F5 hoặc reload trang, trạng thái đăng nhập bị reset về khách vãng lai do `accessToken` chỉ lưu trên memory của Zustand store.
- **Giải pháp đã thực hiện:**
  - Cập nhật [auth-store.ts](file:///d:/koithe-fe/src/shared/stores/auth-store.ts) đưa `accessToken` vào `partialize` của Zustand `persist`, lưu trữ bền vững tại `auth-storage` trong `localStorage`.
  - Giữ nguyên cơ chế tự động refresh token trong [auth-interceptor.ts](file:///d:/koithe-fe/src/shared/api/auth-interceptor.ts) khi gặp mã lỗi 401.

### 2.2. Tái cấu trúc Form Đặt hàng theo nghiệp vụ F&B (Checkout Redesign)
Dựa trên khảo sát luồng vận hành thực tế của hệ thống POS quán trà sữa (`koithe-pos`), trang [checkout-page.tsx](file:///d:/koithe-fe/src/pages/customer/checkout-page.tsx) đã được tối ưu hóa thành 2 hình thức nhận hàng chuyên nghiệp:

1. **Đến lấy tại quán (`TAKEAWAY` $\rightarrow$ `MANG_VE`):**
   - Lựa chọn Chi nhánh cửa hàng chuẩn bị món (ví dụ: *Koi Thé - 120 Ngô Đức Kế, Bến Nghé, Quận 1*).
   - Chọn Thời gian lấy nước (*Sớm nhất có thể ~15-20 phút, Sau 30 phút, Sau 45 phút, Sau 1 tiếng*).
   - Địa chỉ giao hàng được **ẩn hoàn toàn**, tránh gây bối rối cho khách.
   - Phí vận chuyển hiển thị rõ ràng: **Miễn phí (0 ₫)**.
2. **Giao hàng tận nơi (`DELIVERY` $\rightarrow$ `GIAO_HANG`):**
   - Bắt buộc nhập địa chỉ chi tiết (Số nhà, tên đường, phường/xã, quận/huyện).
   - Áp dụng phí vận chuyển: **15.000 ₫**.
   - Tự động kích hoạt chính sách **Miễn phí vận chuyển (Freeship)** khi tổng tiền hàng $\ge$ 150.000 ₫.
3. **Phục vụ tại bàn (`AT_TABLE` $\rightarrow$ `TAI_CHO`):**
   - Loại bỏ ô nhập số bàn thủ công trên web đặt hàng online (do khách ở xa không thể biết bàn trống).
   - Thay thế bằng banner hướng dẫn trực quan: Khách tại quán quét mã QR tại bàn (`/qr/:tableToken`) để tự động mở menu gắn liền với mã bàn.
4. **Giao diện & Thẩm mỹ:**
   - Xóa bỏ các icon emoji thiếu trang trọng (`🛍️`, `🛵`), thay bằng icon SVG thanh lịch từ bộ thư viện Lucide React (`Store`, `Truck`).

### 2.3. Hiển thị động nhãn hình thức phục vụ trong Lịch sử đơn hàng
- **File:** [order-history-page.tsx](file:///d:/koithe-fe/src/pages/customer/order-history-page.tsx).
- **Vấn đề trước đây:** Nhãn hình thức phục vụ bị hardcode thành *"Phục vụ tại quầy"*, gây sai lệch với các đơn đặt giao hàng hoặc đến lấy.
- **Giải pháp:** Đã ánh xạ động theo trường `serviceType` từ API:
  - `GIAO_HANG` $\rightarrow$ Badge **"Giao tận nơi"** (icon xe tải).
  - `MANG_VE` $\rightarrow$ Badge **"Đến lấy tại quán"** (icon cửa hàng).
  - `TAI_CHO` $\rightarrow$ Badge **"Phục vụ tại bàn"** (icon bàn).

### 2.4. Cơ chế tự động gộp giỏ hàng khách vãng lai (Guest Cart Merge)
- **File:** [auth-interceptor.ts](file:///d:/koithe-fe/src/shared/api/auth-interceptor.ts) & [cart-store.ts](file:///d:/koithe-fe/src/shared/stores/cart-store.ts).
- Cho phép gửi kèm header `X-Cart-Token` cùng `Authorization: Bearer <token>` trên các request giỏ hàng.
- Khi khách đã chọn món lúc chưa đăng nhập rồi tiến hành đăng nhập, backend `CartServiceImpl.java` tự động chuyển các món trong giỏ guest sang giỏ tài khoản và đánh dấu xóa giỏ guest. Phía frontend tự động dọn dẹp `guest_cart_token` sau khi gộp thành công.

### 2.5. Bổ sung API tra cứu đơn hàng công khai (`GET /api/orders/track`)
- **Repository:** `koithe-api` (Nhánh: `integration/api-baseline`).
- **Mục tiêu:** Cho phép khách vãng lai tra cứu đơn hàng của mình mà không cần tạo tài khoản hay đăng nhập.
- **Nội dung code đã triển khai:**
  1. `DonHangRepository.java`: Thêm query `trackOrder(code, phone)` kiểm tra mã đơn hiển thị cùng số điện thoại người nhận.
  2. `OrderService.java` & `OrderServiceImpl.java`: Hiện thực logic `track(code, phone)` validate dữ liệu và trả về `OrderResponse`.
  3. `OrderController.java`: Mở endpoint `@GetMapping("/track")`.
  4. `SecurityConfig.java`: Whitelist công khai `GET /api/orders/track` trong Spring Security.
  5. `OrderServiceImplTest.java`: Bổ sung 2 unit test, kiểm tra thành công và trường hợp lỗi.

---

## 3. Bằng chứng kiểm thử thực tế (Test Results & Evidence)

### 3.1. Kiểm thử biên dịch & Static Analysis
| Dự án | Lệnh kiểm thử | Kết quả | Ghi chú |
| :--- | :--- | :---: | :--- |
| **`koithe-fe`** | `npx tsc -b` | **PASS (Code 0)** | Không có lỗi TypeScript |
| **`koithe-fe`** | `npm run build` | **PASS (Code 0)** | Bundle production thành công |
| **`koithe-api`** | `mvn test -Dtest=OrderServiceImplTest` | **PASS (8/8 Tests)** | Toàn bộ unit test order vượt qua |

### 3.2. Kiểm thử luồng E2E trên trình duyệt (Browser Automated QA)
1. **Đặt hàng thành công:**
   - Người dùng đăng nhập `khachhang` / `12345678`.
   - Thêm món *Trà sữa trân châu* (Size S, 70% đường, 50% đá) vào giỏ.
   - Chọn "Đến lấy tại quán", chi nhánh *120 Ngô Đức Kế*, thanh toán COD.
   - Bấm đặt hàng $\rightarrow$ Hệ thống tạo thành công đơn hàng **`#DH-2026-008`** (Tổng tiền: 175.000 ₫).
2. **Kiểm tra hiển thị lịch sử đơn hàng:**
   - Truy cập `/profile/orders` $\rightarrow$ Đơn `#DH-2026-008` hiển thị huy hiệu chuẩn: **"Đến lấy tại quán"**.
3. **Kiểm tra API tra cứu đơn công khai:**
   - Request: `GET http://localhost:8081/api/orders/track?code=DH-2026-008&phone=0787274247`
   - Response: **HTTP 200 OK** trả về trọn vẹn chi tiết đơn hàng, món, topping, chi nhánh và trạng thái `DA_THANH_TOAN`.

---

## 4. Tài nguyên & Tài khoản mẫu cho Partner sử dụng ngay

### 4.1. Danh sách tài khoản thử nghiệm (Test Accounts)
Mật khẩu mặc định cho toàn bộ tài khoản nội bộ là: **`12345678`**

| Tên đăng nhập | Họ và tên | Vai trò (Role) | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| `admin` | Administrator | `ADMIN` | Quản trị toàn quyền, xem báo cáo, quản lý bàn/kho/khuyến mãi |
| `manager01` | Nguyen Van Manager | `MANAGER` | Quản lý ca, duyệt phiếu nhập kho, xem báo cáo |
| `cashier01` | Tran Thi Cashier | `CASHIER` | Mở/đóng ca làm việc, tạo đơn POS tại quầy |
| `barista01` | Le Van Barista | `BARISTA` | Màn hình pha chế, cập nhật trạng thái chế biến |
| `khachhang` | Ly Kien An (SĐT: 0787274247) | `CUSTOMER` | Khách hàng thành viên, đặt đơn, xem lịch sử đơn |

### 4.2. Công cụ mô phỏng thanh toán Dev (Dev Simulation)
Khi làm [TASK-03](./PARTNER_TASKS.md#task-03-tích-hợp--mô-phỏng-thanh-toán-payment-flow--dev-simulation), partner có thể gọi API sau để giả lập thanh toán thành công ngay lập tức mà không cần tài khoản ngân hàng:
- **Endpoint:** `POST /api/payments/dev-simulate-success?orderId={id}&method={MOMO|VNPAY|CHUYEN_KHOAN_QR}`
- Đơn hàng sẽ tự động chuyển trạng thái sang `DA_THANH_TOAN` và trừ tồn kho tương ứng.

---

## 5. Hướng dẫn Partner bắt đầu công việc

1. **Đọc kỹ file nhiệm vụ:** Xem chi tiết 9 task và tiêu chuẩn nghiệm thu tại [PARTNER_TASKS.md](./PARTNER_TASKS.md).
2. **Tạo branch làm việc từ `integration/api-baseline`:**
   ```bash
   git fetch origin
   git checkout integration/api-baseline
   git pull --ff-only origin integration/api-baseline
   git checkout -b <branch-duoc-giao>
   ```
3. **Kiểm tra trước khi mở PR:**
   - Chạy `npx tsc -b` để đảm bảo không lỗi kiểu dữ liệu.
   - Mở PR trỏ về `integration/api-baseline`.
