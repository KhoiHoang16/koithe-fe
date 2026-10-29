# TASK-05 — Những điểm cần thống nhất với BE

- Docs ghi trạng thái duyệt `DA_NHAP`, BE hiện trả/lọc `DA_NHAP_KHO`. FE dùng giá trị thực tế để lọc và khóa chỉnh sửa, hiển thị “Đã nhập kho”. Cần thống nhất tên trạng thái với docs/POS; chưa coi tiêu chí giá trị `DA_NHAP` đạt nguyên bản.
- Docs ghi `nguoiLienHe`, BE nhận/trả `nguoiDaiDien`. FE dùng trường BE cho nhãn “Người liên hệ”; cần xác nhận hai khái niệm tương đương hoặc bổ sung trường riêng.
- Docs ghi `bienTheId`, BE nhận `maBienThe`. FE gửi `maBienThe` để BE tạo dòng gắn đúng biến thể và cộng tồn khi duyệt.
- GET `/purchase-orders/{id}` chưa trả nhà cung cấp hoặc các dòng chi tiết. FE lấy dòng từ GET `/purchase-order-lines?maPhieuNhap={id}` có phân trang; cần BE bổ sung thông tin nhà cung cấp nếu muốn hiển thị trên chi tiết phiếu. Không suy đoán nhà cung cấp từ bộ lọc hay dữ liệu cục bộ.
- PUT phiếu hiện chỉ cập nhật nhà cung cấp/người nhập/ghi chú, không thay các dòng theo `chiTiet`. FE chỉ cung cấp sửa ghi chú ở phiếu chờ duyệt; sau duyệt khóa. Nếu yêu cầu sửa toàn bộ phiếu cần thống nhất contract, đặc biệt ID biến thể còn thiếu trong response dòng.

Không sửa BE hoặc DB. BE dùng chung POS; các thay đổi contract cần team BE đánh giá tương thích.
