# Phân công công việc cho partner

## Quy tắc chung

- Branch nền tảng: `integration/api-baseline`.
- Không commit trực tiếp vào `develop` hoặc `integration/api-baseline`.
- Mỗi task tạo một branch riêng và một Pull Request.
- Không tạo mock API nếu backend đã có endpoint.
- Không đưa password, token hoặc payment secret vào source code.
- Page không gọi Axios trực tiếp; gọi API adapter trong `src/features/<module>/api`.

## Các task đề xuất

### TASK-01 - Tra cứu đơn hàng guest

- Branch: `feature/customer-track-order-api`.
- File chính: `src/pages/customer/track-order-page.tsx`.
- Gắn API tra cứu đơn theo mã đơn và số điện thoại.
- Có loading, empty state, lỗi validation và lỗi không tìm thấy đơn.
- Không yêu cầu đăng nhập.

### TASK-02 - QR order

- Branch: `feature/customer-qr-order-api`.
- File chính: `src/pages/customer/qr-order-page.tsx`.
- Thay `PlaceholderPage` bằng luồng đọc mã bàn/mã QR.
- Gọi API tạo order phù hợp với bàn.
- Kiểm tra quyền và trạng thái bàn.

### TASK-03 - Thanh toán VietQR

- Branch: `feature/customer-payment-api`.
- File chính: `src/pages/customer/payment-page.tsx`.
- Thay ảnh VietQR mock bằng dữ liệu payment backend.
- Hiển thị đúng trạng thái chờ, thành công và thất bại.
- Không lưu payment secret ở frontend.

### TASK-04 - Khách hàng và nhân viên

- Branch: `feature/admin-customer-employee-api`.
- Files chính: `src/pages/admin/customers-page.tsx`, `customer-detail-page.tsx`, `employees-page.tsx`.
- Gắn danh sách, tìm kiếm, chi tiết và trạng thái.
- Chỉ cho phép role phù hợp thực hiện mutation.

### TASK-05 - Kho và nhà cung cấp

- Branch: `feature/admin-inventory-api`.
- Files chính: `src/pages/admin/inventory-page.tsx`, `suppliers-page.tsx`.
- Gắn danh sách tồn kho, nhà cung cấp và phiếu nhập hàng.
- Có tạo/cập nhật/xác nhận theo API backend hiện có.

### TASK-06 - Ca làm việc

- Branch: `feature/admin-shift-api`.
- File chính: `src/pages/admin/shifts-page.tsx`.
- Gắn mở ca, đóng ca, xem ca và trạng thái ca.
- Kiểm tra role ADMIN/MANAGER/CASHIER theo API backend.

### TASK-07 - Báo cáo

- Branch: `feature/admin-report-api`.
- File chính: `src/pages/admin/reports-page.tsx`.
- Gắn bộ lọc thời gian, doanh thu, số đơn, phương thức thanh toán và sản phẩm bán chạy.
- Hiển thị loading, empty state và lỗi API.

### TASK-08 - Khuyến mãi nâng cao

- Branch: `feature/admin-promotion-api`.
- File chính: `src/pages/admin/promotions-page.tsx`.
- Gắn các API promotion chưa được sử dụng trên giao diện.
- Không thay đổi contract voucher hiện tại nếu chưa thống nhất với backend.

### TASK-09 - Kiểm thử E2E

- Branch: `test/frontend-e2e-regression`.
- Kiểm tra login theo role, guest cart, checkout, payment callback, order status và RBAC.
- Bổ sung kiểm tra responsive mobile/desktop.

## Quy trình tạo branch

```bash
git fetch origin
git checkout integration/api-baseline
git pull --ff-only origin integration/api-baseline
git checkout -b feature/customer-track-order-api
```

Thay tên branch theo task được giao.

## Quy trình hoàn thành task

```bash
npm run lint
npm run build
git diff --check
git status
git add <files>
git commit -m "feat: integrate guest order tracking API"
git push -u origin feature/customer-track-order-api
```

Tạo Pull Request với:

- Base branch: `integration/api-baseline`.
- Compare branch: branch task của partner.
- Mô tả endpoint đã dùng, màn hình đã sửa và kết quả kiểm thử.
- Kèm ảnh/video nếu task có thay đổi giao diện.

## Tiêu chí review

- Đúng endpoint, request và response backend.
- Không còn placeholder hoặc mock trong phạm vi task.
- Có loading, error và empty state.
- Không phá vỡ các luồng đã tích hợp.
- Lint và build thành công.
- Không chứa secret hoặc dữ liệu tài khoản thật.
