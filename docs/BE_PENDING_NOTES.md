# Trạng thái các điểm vướng mắc BE / FE

> **Cập nhật:** Các mục 1–5 đã được xử lý trên nhánh `fix/be-pending-notes` của `koithe-api` và FE (`koithe-fe`) đã gỡ các điểm chặn tạm tương ứng. Mục 6 là lỗi FE tồn đọng cần xử lý riêng.

---

## 1. Thanh toán online — TASK-03 [ĐÃ XỬ LÝ TRÊN BE]

- **Trạng thái:** Đã sửa trên nhánh `fix/be-pending-notes`.
- **Chi tiết xử lý:**
  - `vnpay.return-url` và `momo.return-url` được cấu hình chuẩn về cổng BE 8081 (`http://localhost:8081/api/payments/vnpay-return`).
  - Thêm cấu hình frontend URL `app.frontend-url` (mặc định `http://localhost:5173`).
  - Sau khi xử lý callback từ VNPay/MoMo, BE thực hiện redirect 302 về trang kết quả FE:
    - Thành công: `${app.frontend-url}/order-success/${orderId}`
    - Thất bại / hủy: `${app.frontend-url}/checkout/payment/callback?orderId=${orderId}&paymentId=${paymentId}&status=${status}`.

---

## 2. Tạo lại khách đã xóa bị lỗi 500 — TASK-04 [ĐÃ XỬ LÝ TRÊN BE]

- **Trạng thái:** Đã sửa trên nhánh `fix/be-pending-notes`.
- **Chi tiết xử lý:**
  - Trong `KhachHangServiceImpl.createCustomer`: kiểm tra trùng số điện thoại.
  - Nếu trùng với khách đang hoạt động (`deletedAt == null`): ném `BusinessException(HttpStatus.CONFLICT, "Số điện thoại đã tồn tại")` (HTTP 409 thay vì 500).
  - Nếu trùng với bản ghi đã xóa mềm (`deletedAt != null`): tự động khôi phục (`customer.restore()`), cập nhật thông tin mới (họ tên, email, hạng, điểm...) và lưu lại.
  - Bổ sung `DataIntegrityViolationException` handler trả về HTTP 409 CONFLICT trong `GlobalExceptionHandler` để phòng ngừa lỗi unique constraint.

---

## 3. Ca hiện tại và tiền mặt đối soát — TASK-06 [ĐÃ XỬ LÝ TRÊN BE & FE]

- **Trạng thái:** Đã sửa trên nhánh `fix/be-pending-notes` và cập nhật FE.
- **Chi tiết xử lý:**
  - **BE:**
    - `CaLamViecResponse` bổ sung `maThuNgan` và `tenThuNgan`.
    - `GET /shifts/current`: chỉ trả ca đang mở của chính thu ngân đăng nhập (`findCurrentActive(principal.id)`), không fallback sang ca của thu ngân khác; nếu không có ca thì trả `null`.
    - `POST /shifts/{id}/close`: kiểm tra quyền đóng ca — chỉ cho phép chính chủ ca (`thuNgan.id == principal.id`) hoặc tài khoản có role `ADMIN`/`MANAGER`. Người khác cố đóng ca sẽ bị trả HTTP 403 FORBIDDEN.
    - `tienMatDuKien`: tính chính xác bằng `tienDauCa + sumTienMatThanhCongByCaId` (chỉ cộng các giao dịch có `phuong_thuc_thanh_toan = 'TIEN_MAT'` và `trang_thai = 'THANH_CONG'`), loại bỏ đơn hủy.
  - **FE:**
    - Gỡ bỏ hạn chế tạm thời chỉ cho đóng ca khi vừa mở trong cùng phiên; cập nhật `canCloseShift` cho phép đóng ca khi `shift.maThuNgan === userId` hoặc tài khoản là ADMIN/MANAGER.
    - Ẩn cảnh báo "Chưa xác định được ca này thuộc tài khoản của bạn" khi ca thuộc về user hiện tại.
    - Cập nhật ghi chú đối soát tiền mặt hiển thị chính xác theo dữ liệu đã lọc giao dịch tiền mặt từ BE.

---

## 4. Voucher đang diễn ra & cập nhật số lượt dùng — TASK-08 [ĐÃ XỬ LÝ TRÊN BE & FE]

- **Trạng thái:** Đã sửa trên nhánh `fix/be-pending-notes` và cập nhật FE.
- **Chi tiết xử lý:**
  - **BE:**
    - `KhuyenMaiVoucherMapper` bỏ qua `soLuotDaDung` khi ánh xạ từ request update entity (`@Mapping(target = "soLuotDaDung", ignore = true)`).
    - `KhuyenMaiVoucherServiceImpl.update`: giữ nguyên `entity.getSoLuotDaDung()` từ DB, không ghi đè giá trị gửi lên từ client.
    - Phương thức tăng lượt dùng `tangSoLuotDaDungAtomic` sử dụng câu lệnh UPDATE trực tiếp trong DB (`so_luot_da_dung = so_luot_da_dung + 1`) để đảm bảo tính nguyên tử (atomic) khi có giao dịch đồng thời.
  - **FE:**
    - Gỡ bỏ đoạn chặn tạm trong `promotion-api.ts` (trước đây ném lỗi `'chưa thể sửa voucher đang diễn ra'`). Giờ đây người quản trị có thể cập nhật thông tin voucher đang diễn ra mà không lo mất hoặc đè số lượt dùng.

---

## 5. Đơn tiền mặt khách vãng lai và xác nhận thu tiền — TASK-09 [ĐÃ XỬ LÝ TRÊN BE & FE]

- **Trạng thái:** Đã sửa trên nhánh `fix/be-pending-notes` và cập nhật FE.
- **Chi tiết xử lý:**
  - **BE:**
    - `POST /api/payments/guest-cash`: chỉ tạo giao dịch thanh toán trạng thái `CHO_XU_LY` (chờ thu tiền), KHÔNG tự động chuyển trạng thái đơn hàng sang `DA_THANH_TOAN`.
    - Bổ sung endpoint cho thu ngân xác nhận đã thu tiền mặt:
      - `POST /api/payments/{id}/confirm-cash`: xác nhận theo ID giao dịch.
      - `POST /api/payments/confirm-cash?orderId={orderId}`: xác nhận giao dịch tiền mặt của đơn hàng.
    - Khi thu ngân gọi xác nhận thu tiền: giao dịch chuyển sang `THANH_CONG`, ghi nhận thu ngân / ca làm việc hiện tại, và đơn hàng chuyển sang `DA_THANH_TOAN`.
  - **FE:**
    - Bổ sung `confirmCash(paymentId)` và `confirmCashByOrder(orderId)` vào `payment-api.ts`.

---

## 6. Thêm nhanh món gợi ý vào giỏ bị lỗi 404 — TASK-09 (lỗi FE cần xử lý)

- **Cách tái hiện:** tại `/cart`, bấm nút (+) ở món gợi ý trong mục “Có thể bạn cũng thích” (ảnh ghi nhận với Cà phê sữa đá).
- **Kết quả:** request thêm món `/api/carts/items` trả `code: 404`, message “Không tìm thấy biến thể”; FE báo “Không thể thêm vào giỏ hàng. Vui lòng thử lại.” và không thêm được món.
- **Đối chiếu code FE:** `handleQuickAdd` trong `cart-page.tsx` dùng ID biến thể cố định `101` khi sản phẩm gợi ý chưa có danh sách biến thể. Danh sách sản phẩm hiện được adapter trả với `bienTheList` rỗng. Đây là nguyên nhân phía FE cần xử lý trước; ảnh chưa có payload để xác nhận ID thực tế của request lỗi, không quy lỗi cho BE.
- **Hướng xử lý FE:** lấy biến thể thật của sản phẩm trước khi thêm nhanh hoặc đưa người dùng đến trang chọn món; không gửi ID dự phòng tự đặt. Chỉ ghi nhận, chưa sửa code.

*Lưu ý: Mục 6 là lỗi FE, được giữ trong file này theo yêu cầu người dùng, không phải yêu cầu BE sửa.*
