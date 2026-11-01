# Các lỗi / vướng mắc FE đang chờ BE

Chỉ giữ các điểm đã ghi nhận khiến luồng FE không chạy được, bị chặn hoặc hiển thị sai nghiệp vụ. Đã bỏ khác biệt tên trường, cấu trúc response mà FE đã xử lý và các đề xuất mở rộng. Đây là ghi nhận từ những lần kiểm thử trước, chưa xác nhận lại sau thay đổi BE.

## 1. Thanh toán online chưa hoàn tất được luồng thật — TASK-03

- VNPay từng trả lỗi sandbox `code=72` (“Không tìm thấy website”). Cần BE kiểm tra cấu hình merchant sandbox.
- URL thanh toán BE từng trả callback `http://localhost:8088/api/payments/vnpay-return`, trong khi BE chạy cổng 8081. Callback hiện trả JSON, chưa thống nhất cách đưa khách trở về trang kết quả FE.
- **Ảnh hưởng FE:** khách có thể dừng ở lỗi cổng thanh toán, callback sai địa chỉ hoặc không trở lại được trang kết quả. Chưa nghiệm thu thanh toán VNPay thật.
- **Cần BE:** kiểm tra merchant, URL callback và luồng trả kết quả về FE.

## 2. Tạo lại khách đã xóa bị lỗi 500 — TASK-04

- Khách bị xóa mềm vẫn giữ SĐT trong DB. Khi tạo khách mới với SĐT đó, API trả HTTP 500 “Lỗi hệ thống”; tạo bằng SĐT mới thì thành công.
- **Ảnh hưởng FE:** không thêm được khách với SĐT đã xóa và không nhận được lỗi nghiệp vụ rõ ràng để hướng dẫn người dùng.
- **Cần BE:** xử lý trùng SĐT với bản ghi xóa mềm; cho khôi phục/tạo lại hoặc trả lỗi nghiệp vụ phù hợp theo quy tắc thống nhất.

## 3. Ca hiện tại và tiền mặt đối soát không chính xác — TASK-06

- `/shifts/current` có thể trả ca đang mở của người khác khi tài khoản không có ca; response thiếu chủ ca.
- **Ảnh hưởng FE:** có thể hiện nhầm ca hiện tại. FE phải hạn chế CASHIER đóng ca sau khi tải lại trang vì không xác minh được quyền sở hữu ca.
- **Cần BE:** trả đúng ca của tài khoản, bổ sung chủ ca và kiểm tra quyền đóng ca.
- Tiền mặt dự kiến hiện lấy tiền đầu ca cộng tổng tiền mọi đơn trong ca, chưa tách phương thức tiền mặt hoặc loại đơn hủy/chưa thanh toán.
- **Ảnh hưởng FE:** số tiền cần đối soát và chênh lệch có thể sai khi có đơn online, hủy hoặc chưa thu tiền.
- **Cần BE:** tính tiền mặt dự kiến từ giao dịch tiền mặt hợp lệ.

## 4. Chưa sửa được voucher đang diễn ra — TASK-08

- PUT voucher hiện có thể cập nhật cả `soLuotDaDung`, dẫn tới ghi đè số lượt dùng mới phát sinh trên POS.
- **Ảnh hưởng FE:** FE đang chặn sửa voucher thuộc chương trình đang diễn ra để tránh làm sai lượt dùng; thao tác sửa ở trường hợp này chưa dùng được.
- **Cần BE:** không cập nhật lượt dùng qua API sửa thông tin voucher và bảo vệ lượt dùng khi có cập nhật đồng thời.

## 5. Đơn tiền mặt chưa thu tiền đã hiện “Đã thanh toán” — TASK-09

- Hai đơn thử `DH-2026-014` và `DH-2026-015`, mỗi đơn 43.000đ, gọi `/payments/guest-cash` đã chuyển ngay sang `DA_THANH_TOAN`, dù thử nghiệm chưa thu tiền thật.
- **Ảnh hưởng FE:** trang tra cứu hiển thị “Đã thanh toán” trước khi khách trả tiền; số liệu liên quan có thể ghi nhận sớm.
- **Cần BE:** phân biệt đăng ký trả tiền mặt với xác nhận đã thu tiền cho đơn website/QR.

## 6. Thêm nhanh món gợi ý vào giỏ bị lỗi 404 — TASK-09 (lỗi FE cần xử lý)

- **Cách tái hiện:** tại `/cart`, bấm nút (+) ở món gợi ý trong mục “Có thể bạn cũng thích” (ảnh ghi nhận với Cà phê sữa đá).
- **Kết quả:** request thêm món `/api/carts/items` trả `code: 404`, message “Không tìm thấy biến thể”; FE báo “Không thể thêm vào giỏ hàng. Vui lòng thử lại.” và không thêm được món.
- **Đối chiếu code FE:** `handleQuickAdd` trong `cart-page.tsx` dùng ID biến thể cố định `101` khi sản phẩm gợi ý chưa có danh sách biến thể. Danh sách sản phẩm hiện được adapter trả với `bienTheList` rỗng. Đây là nguyên nhân phía FE cần xử lý trước; ảnh chưa có payload để xác nhận ID thực tế của request lỗi, không quy lỗi cho BE.
- **Hướng xử lý FE:** lấy biến thể thật của sản phẩm trước khi thêm nhanh hoặc đưa người dùng đến trang chọn món; không gửi ID dự phòng tự đặt. Chỉ ghi nhận, chưa sửa code.

Chỉ ghi note; không sửa BE/DB hoặc dữ liệu POS. Mục 6 là lỗi FE, được giữ trong file này theo yêu cầu người dùng, không phải yêu cầu BE sửa.
