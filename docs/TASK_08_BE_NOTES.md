# TASK-08 — Các mục chờ BE thống nhất

- Cập nhật chương trình chưa có version/ETag để chống ghi đè đồng thời. FE đọc lại trước PUT và chặn nếu dữ liệu khác lúc mở form; vẫn cần BE kiểm soát nguyên tử khi hai phía lưu cùng thời điểm.

- Voucher chưa có tên riêng `tenVoucher`, ngày bắt đầu/kết thúc riêng. BE yêu cầu `maChuongTrinh`; FE chọn chương trình thật và hiển thị tên chương trình/thời hạn liên kết, không giả lập tên voucher hay tự sửa chương trình dùng chung. Muốn modal voucher có tên/thời hạn độc lập đúng docs cần bổ sung contract. Kiểm tra ngày kết thúc sau bắt đầu được thực hiện ở modal tạo chương trình.
- Loại số tiền BE dùng `TIEN_CO_DINH`, docs ghi `SO_TIEN`; số tiền tối đa `mucGiamToiDa`, đơn tối thiểu `donHangToiThieu`, số lượng phát hành `gioiHanSuDung`, lượt dùng `soLuotDaDung`. Adapter quản trị dùng đúng các tên BE, không sửa API áp dụng voucher của khách hàng.
- GET chương trình trả PageResponse, có page/size. FE phân trang và tải hết trang để dropdown không bỏ sót chương trình.
- PUT voucher mapper hiện cập nhật cả `soLuotDaDung`. Cần BE bỏ qua trường này trong cập nhật thông tin, bảo vệ số lượt dùng nguyên tử với POS. FE không có ô sửa lượt dùng; đọc lại số mới nhất trước PUT và tạm chặn sửa voucher thuộc chương trình đang diễn ra để tránh ghi đè giao dịch POS. Chức năng sửa voucher đang diễn ra chưa nghiệm thu đầy đủ.
- BE cho ngày bắt đầu bằng kết thúc; FE chặn bằng nhau theo docs yêu cầu kết thúc phải sau bắt đầu. Chương trình tạm ngưng được hiển thị riêng, không gắn nhãn đang diễn ra.

Chỉ sửa quản trị voucher/chương trình FE. Không sửa BE/DB, không thay đổi áp dụng voucher trong checkout hoặc POS.
