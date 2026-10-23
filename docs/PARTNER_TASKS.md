# Phân công công việc cho partner (Handover & Task Specifications)

> **Nhánh nền tảng (Base Branch):** `integration/api-baseline`  
> **API Server Backend (Local):** `http://localhost:8081` (Reverse Proxy qua Vite FE: `/api`)  
> **Tài liệu Swagger OpenAPI Backend:** `http://localhost:8081/swagger-ui.html`

---

## 1. Quy tắc làm việc & Chuẩn mực kỹ thuật

1. **Nhánh làm việc:**
   - Mọi task đều phải checkout từ nhánh `integration/api-baseline` mới nhất:
     ```bash
     git fetch origin
     git checkout integration/api-baseline
     git pull --ff-only origin integration/api-baseline
     git checkout -b <ten-branch-task>
     ```
   - **Tuyệt đối không** commit hoặc merge trực tiếp vào `develop`, `main` hay `integration/api-baseline`.
2. **Kiến trúc gọi API:**
   - Các trang (`src/pages/...`) không được gọi Axios trực tiếp. Phải định nghĩa API functions trong adapter module: `src/features/<module>/api/<module>-api.ts`.
   - Tận dụng `httpClient` và `api` từ `@/shared/api/http-client`, kết hợp TanStack Query (`useQuery`, `useMutation`).
3. **Bảo mật & Biến môi trường:**
   - Không hardcode mật khẩu, token, secret key hay credentials vào mã nguồn.
   - Token xác thực (`accessToken`) được quản lý tự động bởi `auth-interceptor.ts`. Giỏ hàng khách vãng lai gửi qua header `X-Cart-Token`.
4. **Tiêu chuẩn hoàn thành PR (Definition of Done):**
   - Đầy đủ 3 trạng thái UX: **Loading skeleton/spinner**, **Empty state** (khi không có dữ liệu), **Error banner/toast**.
   - Kiểm tra gõ lệnh không phát sinh lỗi trước khi commit:
     ```bash
     npx tsc -b
     npm run lint
     npm run build
     ```
   - Tạo Pull Request trỏ vào base branch `integration/api-baseline`, mô tả rõ các màn hình đã làm kèm ảnh chụp hoặc video demo.

---

## 2. Chi tiết 9 Task phân công

---

### TASK-01: Giao diện tra cứu đơn hàng khách vãng lai (Public Order Tracking)
- **Branch:** `feature/customer-track-order-api`
- **Mục tiêu:** Cho phép khách hàng không đăng nhập (hoặc khách đã đặt hàng) tra cứu tình trạng đơn hàng bằng Mã đơn hàng hiển thị và Số điện thoại nhận hàng.
- **File cần thực hiện:**
  - `src/features/order/api/order-api.ts`: Bổ sung hàm `trackOrder(code: string, phone: string)`.
  - `src/pages/customer/track-order-page.tsx`: Xây dựng giao diện tra cứu hoàn chỉnh thay thế placeholder.
- **Contract API Backend:**
  - **Endpoint:** `GET /api/orders/track?code={code}&phone={phone}`
  - **Quyền hạn (Auth):** Public (Không yêu cầu Bearer token).
  - **Response (200 OK):**
    ```json
    {
      "code": 200,
      "message": "Success",
      "data": {
        "id": 6,
        "displayCode": "DH-2026-006",
        "status": "HOAN_THANH",
        "channel": "WEBSITE",
        "serviceType": "GIAO_HANG",
        "tenNguoiNhan": "Nguyen Van A",
        "soDienThoaiNguoiNhan": "0901234567",
        "diaChiGiaoHang": "123 Nguyen Hue, Quan 1, TP.HCM",
        "merchandiseTotal": 70000.0,
        "discount": 0.0,
        "payableTotal": 85000.0,
        "createdAt": "2026-10-23T01:00:00Z",
        "items": [
          {
            "id": 1,
            "productName": "Trà sữa trân châu hoàng kim",
            "size": "M",
            "quantity": 2,
            "unitPrice": 35000.0,
            "lineTotal": 70000.0,
            "sugarLevel": "70%",
            "iceLevel": "50%",
            "note": "Ít ngọt",
            "toppings": [{ "id": 1, "name": "Trân châu hoàng kim", "unitPrice": 10000.0, "quantity": 1 }]
          }
        ]
      }
    }
    ```
  - **Mã lỗi:**
    - `400 Bad Request`: Mã đơn hoặc số điện thoại để trống.
    - `404 Not Found`: Không tìm thấy đơn hàng khớp với thông tin.
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - Form tra cứu có validation: Báo lỗi đỏ nếu chưa nhập mã đơn hoặc số điện thoại không đúng định dạng.
  - Hiển thị timeline tiến trình đơn trực quan theo trạng thái:
    `CHO_XAC_NHAN` (Chờ xác nhận) $\rightarrow$ `DA_THANH_TOAN` (Đã thanh toán) $\rightarrow$ `DANG_PHA_CHE` (Đang pha chế) $\rightarrow$ `SAN_SANG` (Sẵn sàng giao / lấy) $\rightarrow$ `HOAN_THANH` (Đã hoàn thành) (hoặc `DA_HUY` màu đỏ).
  - Hiển thị danh sách món, topping, tổng tiền thanh toán và hình thức phục vụ (Giao tận nơi kèm địa chỉ hoặc Đến lấy tại quán).

---

### TASK-02: Đặt món tại bàn qua mã QR (QR Table Ordering)
- **Branch:** `feature/customer-qr-order-api`
- **Mục tiêu:** Khách tại quán quét mã QR dán trên bàn sẽ tự động mở trang đặt món gắn liền với số bàn tương ứng.
- **File cần thực hiện:**
  - `src/features/table/api/table-api.ts`: API lấy thông tin bàn bằng token QR.
  - `src/pages/customer/qr-order-page.tsx`: Trang đón tiếp khách quét QR (`/qr/:tableToken`).
  - `src/pages/customer/checkout-page.tsx`: Hỗ trợ luồng checkout phục vụ tại chỗ khi có thông tin bàn.
- **Contract API Backend:**
  - **Endpoint lấy bàn:** `GET /api/tables/qr/{token}` (Public).
  - **Response bàn (200 OK):**
    ```json
    {
      "code": 200,
      "data": {
        "id": 2,
        "tenBan": "Bàn 02",
        "viTri": "Tầng 1 - Khu A",
        "trangThai": "TRONG",
        "tokenQr": "table-token-abc-123"
      }
    }
    ```
  - **Tạo đơn hàng tại bàn:** `POST /api/orders`
    - Payload:
      ```json
      {
        "cartToken": "token-gio-hang-hien-tai",
        "channel": "QUET_QR_BAN",
        "serviceType": "TAI_CHO",
        "tableId": 2,
        "tenNguoiNhan": "Khách Bàn 02",
        "soDienThoaiNguoiNhan": "0900000000"
      }
      ```
- **Tiêu chí nghiệm thu:**
  - Khi truy cập `/qr/:tableToken`: Kiểm tra token hợp lệ, hiển thị banner chào mừng "Bạn đang ngồi tại Bàn 02 (Tầng 1)".
  - Lưu mã bàn vào session/store; khi khách chọn món và bấm thanh toán, form checkout tự động chuyển sang tab "Phục vụ tại bàn", khóa trường số bàn (không cho sửa bậy) và gửi đúng `channel: QUET_QR_BAN`, `serviceType: TAI_CHO`.
  - Báo lỗi thân thiện nếu bàn không tồn tại hoặc mã QR đã hết hạn.

---

### TASK-03: Tích hợp & Mô phỏng thanh toán (Payment Flow & Dev Simulation)
- **Branch:** `feature/customer-payment-api`
- **Mục tiêu:** Hoàn thiện trang thanh toán sau checkout, hiển thị thông tin chuyển khoản VietQR / MoMo / VNPay và cung cấp công cụ mô phỏng thanh toán trong môi trường dev.
- **File cần thực hiện:**
  - `src/features/payment/api/payment-api.ts`: Định nghĩa các API thanh toán.
  - `src/pages/customer/payment-page.tsx`: Giao diện thanh toán chính.
- **Contract API Backend:**
  - **Tạo giao dịch thanh toán:** `POST /api/payments`
    - Body:
      ```json
      {
        "maDonHang": 6,
        "phuongThucThanhToan": "CHUYEN_KHOAN_QR", // hoặc "MOMO", "VNPAY", "TIEN_MAT"
        "soTien": 85000.0,
        "noiDungVietqr": "KOITHE DH2026006"
      }
      ```
    - Response: Trả về `id`, `trangThai` (`CHO_THANH_TOAN`), `redirectUrl` (nếu MoMo/VNPay).
  - **Thanh toán tiền mặt khi nhận hàng (Guest Cash / COD):** `POST /api/payments/guest-cash`
    - Body: `{ "orderId": 6 }`
  - **Mô phỏng thanh toán thành công (Dành riêng cho Dev test):**
    - `POST /api/payments/dev-simulate-success?orderId={id}&method={MOMO|VNPAY|CHUYEN_KHOAN_QR}`
- **Tiêu chí nghiệm thu:**
  - Với phương thức Chuyển khoản VietQR: Hiển thị đúng mã QR ngân hàng, số tiền, số tài khoản và nội dung chuyển khoản bắt buộc (`KOITHE DH...`).
  - Có cơ chế Polling (hoặc nút "Tôi đã chuyển khoản") gọi kiểm tra trạng thái đơn.
  - Trong môi trường `import.meta.env.DEV`, hiển thị nút "⚡ Mô phỏng thanh toán thành công (Dev Test)" gọi endpoint `dev-simulate-success` để chuyển đơn sang `DA_THANH_TOAN` ngay lập tức mà không cần tài khoản ngân hàng thật.

---

### TASK-04: Quản lý khách hàng Admin (Customer Management)
- **Branch:** `feature/admin-customer-api`
- **Mục tiêu:** Cung cấp cho quản trị viên/thu ngân giao diện xem danh sách, tìm kiếm khách theo số điện thoại, xem lịch sử và quản lý khách hàng.
- **File cần thực hiện:**
  - `src/features/customer/api/customer-api.ts`: CRUD khách hàng.
  - `src/pages/admin/customers-page.tsx`: Danh sách và tìm kiếm khách hàng.
  - `src/pages/admin/customer-detail-page.tsx`: Chi tiết khách hàng và lịch sử tích điểm/mua hàng.
- **Contract API Backend:**
  - `GET /api/customers?phone={soDienThoai}`: Tìm kiếm theo số điện thoại hoặc lấy toàn bộ (Role: `ADMIN`, `MANAGER`, `CASHIER`).
  - `GET /api/customers/{id}`: Xem chi tiết thông tin khách hàng.
  - `POST /api/customers`: Thêm mới khách hàng (`hoVaTen`, `soDienThoai`, `email`, `diaChi`, `ngaySinh`, `gioiTinh`).
  - `PUT /api/customers/{id}`: Cập nhật thông tin khách hàng.
  - `DELETE /api/customers/{id}`: Xóa mềm khách hàng (Role: `ADMIN`).
- **Tiêu chí nghiệm thu:**
  - Ô tìm kiếm theo số điện thoại có debounce (300ms) mượt mà.
  - Modal/Form thêm mới và chỉnh sửa khách hàng có validate số điện thoại (10 chữ số).
  - Phân quyền: Nút xóa chỉ hiển thị khi đăng nhập với vai trò `ADMIN`.
  - *(Lưu ý về nhân viên: Trang `employees-page.tsx` hiện tại giữ dạng danh sách tài khoản theo vai trò đã có, không tự tạo mock API mới)*.

---

### TASK-05: Quản lý nhập hàng & Nhà cung cấp (Purchase Orders & Suppliers)
- **Branch:** `feature/admin-inventory-api`
- **Mục tiêu:** Quản lý danh sách nhà cung cấp và quy trình tạo phiếu nhập kho, duyệt phiếu để cập nhật tồn kho tự động.
- **File cần thực hiện:**
  - `src/features/inventory/api/supplier-api.ts`: API quản lý nhà cung cấp (`/api/suppliers`).
  - `src/features/inventory/api/purchase-order-api.ts`: API phiếu nhập hàng (`/api/purchase-orders`).
  - `src/pages/admin/suppliers-page.tsx`: Trang quản lý nhà cung cấp.
  - `src/pages/admin/inventory-page.tsx`: Trang quản lý phiếu nhập kho và tồn kho.
- **Contract API Backend:**
  - **Nhà cung cấp:**
    - `GET /api/suppliers?page=0&size=20`: Danh sách nhà cung cấp.
    - `POST /api/suppliers`: Thêm nhà cung cấp (`tenNhaCungCap`, `soDienThoai`, `email`, `diaChi`, `nguoiLienHe`).
    - `PUT /api/suppliers/{id}`: Cập nhật thông tin.
    - `DELETE /api/suppliers/{id}`: Xóa nhà cung cấp.
  - **Phiếu nhập hàng:**
    - `GET /api/purchase-orders?supplierId=&from=&to=&trangThai=&page=0&size=20`: Danh sách phiếu nhập.
    - `GET /api/purchase-orders/{id}`: Chi tiết phiếu và danh sách mặt hàng nhập.
    - `POST /api/purchase-orders`: Tạo phiếu nhập (`maPhieuNhap`, `maNhaCungCap`, `tongTien`, `ghiChu`, `chiTiet`: `[{ bienTheId, soLuong, donGiaNhap }]`).
    - `POST /api/purchase-orders/{id}/approve`: Duyệt phiếu nhập (Backend sẽ tự động cộng tồn kho vào bảng biến thể/nguyên liệu).
- **Tiêu chí nghiệm thu:**
  - Giao diện tạo phiếu nhập cho phép chọn nhà cung cấp từ dropdown và thêm nhiều dòng sản phẩm.
  - Nút "Duyệt phiếu nhập" có dialog xác nhận; sau khi duyệt thành công thì trạng thái chuyển thành `DA_NHAP` và khóa nút chỉnh sửa.

---

### TASK-06: Quản lý ca làm việc & Đối soát tiền mặt (Shift Management & Cash Reconciliation)
- **Branch:** `feature/admin-shift-api`
- **Mục tiêu:** Hỗ trợ thu ngân mở ca đầu ngày, nhập số dư tiền mặt đầu ca và đối soát tiền mặt kết ca.
- **File cần thực hiện:**
  - `src/features/shift/api/shift-api.ts`: API ca làm việc (`/api/shifts`).
  - `src/pages/admin/shifts-page.tsx`: Trang quản lý ca làm việc.
- **Contract API Backend:**
  - `GET /api/shifts?status=DANG_MO|DA_DONG`: Lấy danh sách ca làm việc (Role: `ADMIN`, `MANAGER`).
  - `GET /api/shifts/current`: Lấy ca đang hoạt động của thu ngân hiện tại.
  - `POST /api/shifts/open`: Mở ca làm việc mới (`tienDauCa`: số tiền mặt trong két).
  - `POST /api/shifts/{id}/close`: Đóng ca (`tienKetCa`: số tiền mặt thực tế kiểm đếm).
  - `GET /api/shifts/{id}`: Xem chi tiết ca làm việc (doanh thu tiền mặt, chênh lệch thừa/thiếu).
- **Tiêu chí nghiệm thu:**
  - Nếu thu ngân chưa mở ca: Hiển thị banner nhắc nhở "Bạn chưa mở ca làm việc hôm nay" kèm nút mở nhanh modal "Mở ca".
  - Modal "Đóng ca" hiển thị tổng doanh thu trong ca, so sánh số tiền hệ thống ghi nhận và số tiền thực đếm, tính ra số tiền chênh lệch.

---

### TASK-07: Báo cáo thống kê doanh thu & Phân tích kinh doanh (Reports & Analytics)
- **Branch:** `feature/admin-report-api`
- **Mục tiêu:** Trực quan hóa dữ liệu kinh doanh thông qua biểu đồ doanh thu, cơ cấu kênh bán và top sản phẩm bán chạy.
- **File cần thực hiện:**
  - `src/features/report/api/report-api.ts`: API báo cáo tổng hợp.
  - `src/pages/admin/reports-page.tsx`: Giao diện dashboard báo cáo.
- **Contract API Backend:**
  - **Endpoint:** `GET /api/reports?from=YYYY-MM-DD&to=YYYY-MM-DD&top=5` (Role: `ADMIN`, `MANAGER`).
  - **Response (200 OK):**
    ```json
    {
      "code": 200,
      "data": {
        "tuNgay": "2026-10-01",
        "denNgay": "2026-10-23",
        "tongDoanhThu": 15850000.0,
        "tongSoDonHang": 320,
        "tongSoLyDaBan": 580,
        "doanhThuTheoNgay": [
          { "ngay": "2026-10-21", "doanhThu": 1200000.0, "soDonHang": 25 },
          { "ngay": "2026-10-22", "doanhThu": 1850000.0, "soDonHang": 38 }
        ],
        "doanhThuTheoKenh": [
          { "kenh": "TAI_QUAY_POS", "doanhThu": 10500000.0, "soDonHang": 210 },
          { "kenh": "WEBSITE", "doanhThu": 4350000.0, "soDonHang": 85 },
          { "kenh": "QUET_QR_BAN", "doanhThu": 1000000.0, "soDonHang": 25 }
        ],
        "doanhThuTheoPhuongThuc": [
          { "phuongThuc": "TIEN_MAT", "doanhThu": 8000000.0 },
          { "phuongThuc": "MOMO", "doanhThu": 4500000.0 },
          { "phuongThuc": "CHUYEN_KHOAN_QR", "doanhThu": 3350000.0 }
        ],
        "topSanPhamBanChay": [
          { "tenSanPham": "Trà sữa trân châu hoàng kim", "soLuongDaBan": 195, "doanhThu": 6825000.0 }
        ]
      }
    }
    ```
- **Tiêu chí nghiệm thu:**
  - Bộ chọn thời gian tiện ích: "Hôm nay", "7 ngày qua", "Tháng này" và bộ lọc tùy chỉnh Ngày bắt đầu - Ngày kết thúc.
  - Sử dụng biểu đồ trực quan (Recharts / Chart.js):
    - Biểu đồ đường (Line Chart) biểu diễn biến động doanh thu theo ngày.
    - Biểu đồ tròn (Donut/Pie Chart) thể hiện tỷ trọng doanh thu theo kênh bán hàng.
    - Bảng xếp hạng Top 5 sản phẩm bán chạy nhất kèm huy hiệu (Rank 1, 2, 3).

---

### TASK-08: Quản lý Voucher & Chương trình khuyến mãi (Vouchers & Promotions)
- **Branch:** `feature/admin-promotion-api`
- **Mục tiêu:** Quản lý vòng đời mã voucher giảm giá và các chương trình khuyến mãi theo mùa.
- **File cần thực hiện:**
  - `src/features/promotion/api/promotion-api.ts`: API Vouchers và Promotion Programs.
  - `src/pages/admin/promotions-page.tsx`: Giao diện quản lý khuyến mãi.
- **Contract API Backend:**
  - **Quản lý Voucher:**
    - `GET /api/vouchers?page=0&size=20`: Danh sách voucher.
    - `POST /api/vouchers`: Tạo voucher mới (`maCode`, `tenVoucher`, `loaiGiamGia`: `PHAN_TRAM` | `SO_TIEN`, `giaTriGiam`, `giaTriDonHangToiThieu`, `giamToiDa`, `soLuongPhatHanh`, `ngayBatDau`, `ngayKetThuc`).
    - `PUT /api/vouchers/{id}`: Sửa voucher.
    - `DELETE /api/vouchers/{id}`: Xóa voucher.
  - **Chương trình khuyến mãi:**
    - `GET /api/promotion-programs`: Danh sách chiến dịch.
    - `POST /api/promotion-programs`: Tạo chiến dịch mới.
- **Tiêu chí nghiệm thu:**
  - Bảng voucher hiển thị rõ số lượng đã dùng / tổng phát hành (ví dụ: `24/100`), thời hạn và trạng thái (Đang diễn ra, Sắp diễn ra, Hết hạn).
  - Modal tạo voucher có kiểm tra hợp lệ: Giá trị giảm theo % không vượt quá 100%, ngày kết thúc phải sau ngày bắt đầu.

---

### TASK-09: Kiểm thử E2E tích hợp & Tối ưu Responsive (E2E Regression Testing)
- **Branch:** `test/frontend-e2e-regression`
- **Mục tiêu:** Kiểm thử toàn diện tất cả các luồng người dùng chính, đảm bảo không có màn hình nào bị tràn bố cục (overflow) trên mobile.
- **Kịch bản kiểm thử bắt buộc (Test Scenarios):**
  1. **Luồng Khách vãng lai:** Chọn món $\rightarrow$ Thêm topping $\rightarrow$ Mở giỏ hàng $\rightarrow$ Chọn "Đến lấy tại quán" (hoặc "Giao tận nơi") $\rightarrow$ Đặt đơn $\rightarrow$ Nhận mã đơn `DH-...` $\rightarrow$ Tra cứu đơn qua trang `/track-order` $\rightarrow$ Hiển thị chính xác đơn.
  2. **Luồng Gộp giỏ hàng (Cart Merge):** Khách chọn 1 món vào giỏ khi chưa đăng nhập $\rightarrow$ Bấm Đăng nhập tài khoản $\rightarrow$ Giỏ hàng khách tự động gộp vào tài khoản đã đăng nhập mà không bị mất món.
  3. **Luồng Đặt món tại bàn:** Quét mã QR `/qr/:tableToken` $\rightarrow$ Tự động nhận diện số bàn $\rightarrow$ Đặt đơn thành công với `kenhDatHang: QUET_QR_BAN`.
  4. **Luồng Thu ngân & POS:** Đăng nhập tài khoản thu ngân (`admin` / `cashier1`) $\rightarrow$ Mở ca đầu ngày $\rightarrow$ Thực hiện tạo đơn POS $\rightarrow$ Đóng ca và đối soát tiền.
  5. **Responsive Mobile:** Kiểm tra hiển thị chuẩn trên màn hình di động (375px - 414px) cho toàn bộ trang: Trang chủ, Menu, Giỏ hàng, Checkout, Tra cứu đơn, Lịch sử đơn.
- **Tiêu chí nghiệm thu:**
  - Không có lỗi JavaScript runtime console.
  - Tất cả các luồng trên đều hoàn thành trơn tru không bị nghẽn (zero blockers).

---

## 3. Quy trình làm việc đề xuất (Workflow tóm tắt)

```
[Fetch integration/api-baseline]
               ↓
   [Tạo branch theo từng Task]
               ↓
 [Viết API Adapter trong src/features]
               ↓
   [Gắn vào Component & State UX]
               ↓
    [Chạy npx tsc -b & npm run lint]
               ↓
   [Tạo PR vào integration/api-baseline]
```
