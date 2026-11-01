# TASK-07 — Những điểm chờ BE thống nhất với docs

- **Kênh bán:** BE gộp tất cả kênh ngoài `TAI_QUAY_POS` thành `ONLINE_WEB` (Website / QR bàn). Chưa thể hiển thị ba tỷ trọng riêng POS, Website, QR bàn đúng docs. FE giữ đúng hai nhóm BE trả, không tự phân bổ.
- **Top 5:** BE nhóm theo biến thể ID/size và giới hạn 5 biến thể, chưa phải 5 sản phẩm tổng hợp các size. FE hiển thị size và giữ thứ tự BE; không gộp 5 dòng rồi coi là top sản phẩm toàn hệ thống. Cần BE bổ sung xếp hạng theo sản phẩm nếu nghiệm thu đúng nghĩa sản phẩm trong docs.
- **Tên trường:** BE dùng `maKenh/tenKenh/soDon`, dòng ngày dùng `soDon`, dòng top dùng `tongTien`, khác ví dụ docs `kenh/soDonHang/doanhThu`. Adapter FE ánh xạ theo DTO thực tế.
- **Định nghĩa doanh thu:** tổng/ngày/kênh/top lọc trạng thái đơn khác `CHO_XAC_NHAN`, `DA_HUY`, chưa trực tiếp kiểm tra giao dịch thanh toán thành công; riêng nhóm phương thức có lọc giao dịch `THANH_CONG`. Cần team BE xác nhận tiêu chí đơn được ghi nhận doanh thu và ảnh hưởng đơn chưa trả tiền, hoàn tiền, giảm giá. FE hiển thị số API, không tự sửa số liệu.

Không sửa BE/DB và không tạo/sửa đơn POS để kiểm thử báo cáo. Chỉ ghi note, không làm báo cáo bàn giao riêng.
