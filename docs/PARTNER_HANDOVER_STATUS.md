# Báo cáo bàn giao đối tác - Frontend

## Thông tin nền

- Repository: `koithe-fe`
- Nhánh: `update/profile-and-order-history`
- Dev server: `http://localhost:5173`
- Backend proxy: `http://localhost:8081`
- API base path trong môi trường development: `/api`


## Các thay đổi đã thực hiện

### Tích hợp API

- Thay thế các luồng catalog, order, promotion, table và product đang dùng mock bằng API backend.
- Thêm auth API cho login, register, `/auth/me`, refresh và logout.
- Thêm cart API cho giỏ hàng server-side của guest và user.
- Thêm payment API cho thanh toán user và guest COD.
- Thêm cơ chế unwrap response Axios và typed API helpers.
- Thêm gắn Bearer token, refresh token và guest cart token.

### Luồng CUSTOMER

- Login/register sử dụng username và password từ backend.
- Guest cart sử dụng `X-Cart-Token` và tồn tại sau khi reload.
- Checkout tạo đơn backend cho giao hàng, mang đi và tại bàn.
- Guest checkout mặc định COD.
- Guest bị khóa các phương thức thanh toán online; online payment yêu cầu đăng nhập.
- Guest không được áp dụng voucher trên giao diện.
- Order history và order detail sử dụng `/api/orders/my` và `/api/orders/{id}`.
- Payment callback kiểm tra trạng thái đơn từ backend.

### Luồng ADMIN và nhân viên

- Các trang sản phẩm, danh mục, topping, order, voucher và bàn đã gọi API ở những luồng đã tích hợp.
- Route guard hỗ trợ CUSTOMER, ADMIN, MANAGER, CASHIER và BARISTA.

## Phạm vi đã gắn API

### Customer

- Đăng nhập, đăng ký, refresh token, đăng xuất và lấy thông tin tài khoản.
- Trang menu, danh mục, sản phẩm, biến thể và topping.
- Chi tiết sản phẩm và thêm sản phẩm vào giỏ hàng.
- Giỏ hàng guest và CUSTOMER.
- Validate voucher cho user đã đăng nhập.
- Checkout giao hàng, mang đi và tại bàn.
- Guest checkout COD.
- Thanh toán COD và khởi tạo thanh toán online.
- Xử lý payment callback.
- Lịch sử đơn hàng và chi tiết đơn hàng.

### Admin/nhân viên

- Quản lý sản phẩm.
- Quản lý danh mục.
- Quản lý topping.
- Quản lý bàn.
- Danh sách đơn hàng và chi tiết đơn hàng.
- Quản lý voucher ở các luồng đã hoàn thiện.

## Phạm vi chưa gắn API hoặc mới là giao diện

- `customer/track-order-page.tsx`: còn TODO gọi API `/orders/track`.
- `customer/qr-order-page.tsx`: đang hiển thị `PlaceholderPage`.
- `customer/payment-page.tsx`: phần VietQR hiện là ảnh mock, chưa kết nối payment gateway thực tế.
- `admin/customer-detail-page.tsx`: đang là placeholder.
- `admin/customers-page.tsx`: đang là placeholder.
- `admin/employees-page.tsx`: đang là placeholder.
- `admin/inventory-page.tsx`: đang là placeholder.
- `admin/reports-page.tsx`: đang là placeholder.
- `admin/shifts-page.tsx`: đang là placeholder.
- `admin/promotions-page.tsx`: đang là placeholder.
- `admin/settings-page.tsx`: đang là placeholder.
- `admin/suppliers-page.tsx`: đang là placeholder.
- Một số thao tác mutation ở các trang admin chưa hoàn thiện đầy đủ dù backend đã có API.

## Kết quả kiểm thử

### Build và static checks

```bash
npx tsc -b --pretty false
npm run lint
npm run build
```

- TypeScript: PASS.
- Production build: PASS.
- Lint: PASS, chỉ còn warning.
- Warning còn lại liên quan đến Fast Refresh export, React Compiler compatibility và state update trong effect.

### Runtime và API

- Vite dev server: HTTP `200`.
- Vite proxy `/api/categories`: HTTP `200`.
- Vite proxy `/api/products`: HTTP `200`.
- Guest cart, guest order, guest COD, CUSTOMER order/history: PASS qua backend API.
- Kiểm tra quyền theo role: PASS qua backend API.

## Ghi chú về API contract

- Guest checkout chỉ hỗ trợ COD.
- Guest online payment bị khóa trên giao diện.
- Guest voucher bị khóa trên giao diện.
- CUSTOMER đã đăng nhập có thể validate voucher.
- Voucher chưa được đưa vào contract tạo đơn backend nên discount chưa được áp dụng đầy đủ vào order.
- Payment credential và callback phụ thuộc môi trường, không được commit.

## Giới hạn hiện tại

- Chưa có browser E2E tự động; các kết quả hiện tại là API E2E, frontend proxy và build.
- Một số trang admin vẫn là scaffold/UI và chưa có đầy đủ mutation API.
- Khi response DTO backend thay đổi, cần cập nhật mapper trong `src/features/*/api`.
- Vite vẫn cảnh báo một số chunk lớn hơn 500 KB; production build vẫn thành công.

## Hướng dẫn chạy

Khởi động backend trước, sau đó chạy frontend:

```bash
npm install
npm run dev
```

Kiểm tra trước khi bàn giao:

```bash
npx tsc -b --pretty false
npm run lint
npm run build
```
