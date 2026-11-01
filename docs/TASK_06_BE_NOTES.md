# TASK-06 — Các mục chờ BE

1. **Ca hiện tại và chủ ca:** `findCurrentActive(thuNganId)` fallback sang ca mở mới nhất toàn hệ thống nếu người dùng không có ca. Response chưa trả ID/tên thu ngân. Cần bỏ fallback hoặc trả owner để xác minh đúng ca của tài khoản; endpoint đóng ca cũng cần kiểm tra quyền sở hữu cho CASHIER. FE hiện chỉ cho CASHIER đóng ca có ID từ response mở ca trong phiên hiện tại; sau tải lại trang/ca mở trên POS chưa đủ dữ liệu xác minh. Banner chưa mở ca chỉ có thể chính xác khi `/current` trả null. ADMIN/MANAGER vẫn xem và đóng ca theo quyền quản lý.
2. **Doanh thu tiền mặt:** truy vấn hiện cộng tổng tiền tất cả đơn có `ma_ca`, không lọc thanh toán tiền mặt, trạng thái thanh toán hoặc đơn hủy. `tienMatDuKien = tienDauCa + tongDoanhThu` chưa phải số tiền mặt thực tế khi có đơn chuyển khoản/MoMo/VNPay. Cần BE xác định doanh thu hợp lệ và tách tiền mặt. FE hiển thị số BE trả, ghi rõ đối chiếu theo hệ thống, không tự gọi số tổng doanh thu là doanh thu tiền mặt.
3. **Đóng ca tiền thực đếm bằng 0:** BE trả `chenhLech = null` nếu `tienKetCa = 0`. FE có thể hiển thị chênh lệch bằng `0 - tienMatDuKien` khi ca đã đóng, nhưng cần BE trả chênh lệch nhất quán.
4. **Thông tin người mở ca:** DTO thiếu ID/tên thu ngân nên danh sách/chi tiết chưa hiển thị người mở ca. Chờ bổ sung contract.

Không sửa BE/DB hoặc luồng POS. Việc mở/đóng ca kiểm thử cần thống nhất tài khoản và ca thử để không tác động ca đang dùng trên POS.
