# TASK-04 — Các mục chờ BE

Ngày ghi nhận: 28/10/2026. BE dùng chung với POS; các thay đổi cần được team BE đánh giá tương thích với POS trước khi thực hiện. FE không tự sửa BE hoặc database.

1. **Sửa số điện thoại:** PUT `/api/customers/{id}` hiện chỉ nhận họ tên/email và mapper bỏ qua SĐT. Cần thống nhất bổ sung khả năng đổi SĐT theo yêu cầu docs, gồm kiểm tra trùng và ảnh hưởng đến tài khoản/POS. FE hiện để SĐT chỉ đọc.
2. **Các trường thông tin theo docs:** API khách hàng chưa hỗ trợ đầy đủ địa chỉ, ngày sinh, giới tính. Cần thống nhất request/response và dữ liệu tương ứng trước khi FE bổ sung form/chi tiết.
3. **Lịch sử mua hàng/tích điểm:** Chưa có contract API truy vấn lịch sử theo customerId và biến động điểm để phục vụ trang chi tiết. FE không dùng dữ liệu giả hoặc API đơn hàng của tài khoản hiện tại thay thế.
4. **Tái sử dụng SĐT sau xóa mềm:** Người dùng đã xác nhận bản ghi có deleted_at; thêm SĐT mới thành công nhưng thêm lại SĐT đã xóa trả HTTP 500, message “Lỗi hệ thống”. Schema hiện có UNIQUE trên SĐT trong khi kiểm tra trùng của service chỉ xét bản ghi chưa xóa. Cần BE xác minh log/constraint, thống nhất cho phép khôi phục/tái sử dụng hay từ chối có chủ đích và trả lỗi nghiệp vụ phù hợp. Không xóa tay bản ghi hoặc tự đổi ràng buộc DB khi chưa thống nhất với POS.

**Không phải mục thiếu của TASK-04:** API tìm SĐT hiện khớp chính xác; debounce 300ms không làm thay đổi cách khớp. Tìm theo một phần SĐT/gợi ý chỉ bổ sung khi có yêu cầu mở rộng được thống nhất.
