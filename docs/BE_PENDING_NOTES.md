# Tổng hợp các mục chờ BE — TASK-02 đến TASK-08

Gom trên nhánh `test/frontend-e2e-regression` ngày 01/11/2026. Đây là các ghi nhận từ lúc triển khai từng task, chưa xác nhận lại sau thay đổi BE. Các khác biệt contract đã có adapter FE vẫn được giữ để team đối chiếu. Không tự sửa BE/DB; BE dùng chung với POS.

TASK-01 chưa có note chờ BE riêng trong các tài liệu được gom. Danh sách này không thay thế kết quả kiểm thử E2E TASK-09.

---

## TASK-02 — Vị trí bàn

**Yêu cầu docs:** Banner tên bàn kèm vị trí, ví dụ “Bàn 02 (Tầng 1 - Khu A)”.

**API hiện tại:** `BanResponse` trả `id`, `soBan`, `maQrToken`, `trangThai`; chưa có `viTri` hoặc dữ liệu tầng/khu vực. Ví dụ thực tế đang trả `Ban 02`, FE giữ tên đó.

**Cần team BE bổ sung:** Thống nhất field vị trí và dữ liệu trả tại GET `/api/tables/qr/{token}`. Nếu thống nhất `viTri`, ví dụ `Tầng 1 - Khu A`, FE sẽ map và hiển thị sau khi có contract.

**FE hiện tại:** Chỉ hiển thị tên bàn thật; không bịa vị trí, không sửa BE. Tiêu chí vị trí được đánh dấu BLOCKED, chưa coi đạt đầy đủ theo docs. Báo cáo lưu local, chưa gửi hoặc push cho team BE.

---

## TASK-03 — Thanh toán

1. **Nội dung VietQR khác ví dụ bắt buộc trong docs:** FE gửi `noiDungVietqr: KOITHE DH...` khi create, nhưng gateway hiện tự tạo `addInfo=DH2026008` và trả transaction reference ở field noiDungVietqr. FE hiển thị đúng QR thực để tránh chuyển sai nội dung. Team BE cần thống nhất quy tắc KOITHE trong QR và webhook, không chỉ đổi text hiển thị FE.
2. **URL callback nhà cung cấp:** URL VNPay backend thực trả đang có return URL `http://localhost:8088/api/payments/vnpay-return`, trong khi môi trường BE chạy 8081. Controller callback hiện trả JSON, chưa có luồng redirect thống nhất về FE. FE đã xử lý callback với orderId/paymentId hoặc transaction reference khớp phiên; toàn bộ round trip từ nhà cung cấp cần BE cấu hình callback/redirect phù hợp. Chưa coi thanh toán nhà cung cấp thật là đã PASS.
3. **Khôi phục khác tab/thiết bị:** GET payment hiện không trả lại redirectUrl/metadata đầy đủ. FE phục hồi được trong phiên tab đã tạo payment; muốn mở từ tab/thiết bị khác vẫn có QR/link thì BE cần endpoint trả metadata/redirectUrl của giao dịch đang chờ.
4. **Expiry:** Nếu cần đồng hồ hết hạn thật, BE cần cung cấp expiresAt hoặc quy tắc hết hạn được xác định cho từng phương thức; FE không tự áp 15 phút cho mọi cổng.

Đây là các sai khác/giới hạn cụ thể; không tự sửa BE và không đánh dấu toàn bộ TASK-03 đạt 100% docs khi chưa chốt các mục này.


---

## TASK-04 — Các mục chờ BE

Ngày ghi nhận: 28/10/2026. BE dùng chung với POS; các thay đổi cần được team BE đánh giá tương thích với POS trước khi thực hiện. FE không tự sửa BE hoặc database.

1. **Sửa số điện thoại:** PUT `/api/customers/{id}` hiện chỉ nhận họ tên/email và mapper bỏ qua SĐT. Cần thống nhất bổ sung khả năng đổi SĐT theo yêu cầu docs, gồm kiểm tra trùng và ảnh hưởng đến tài khoản/POS. FE hiện để SĐT chỉ đọc.
2. **Các trường thông tin theo docs:** API khách hàng chưa hỗ trợ đầy đủ địa chỉ, ngày sinh, giới tính. Cần thống nhất request/response và dữ liệu tương ứng trước khi FE bổ sung form/chi tiết.
3. **Lịch sử mua hàng/tích điểm:** Chưa có contract API truy vấn lịch sử theo customerId và biến động điểm để phục vụ trang chi tiết. FE không dùng dữ liệu giả hoặc API đơn hàng của tài khoản hiện tại thay thế.
4. **Tái sử dụng SĐT sau xóa mềm:** Người dùng đã xác nhận bản ghi có deleted_at; thêm SĐT mới thành công nhưng thêm lại SĐT đã xóa trả HTTP 500, message “Lỗi hệ thống”. Schema hiện có UNIQUE trên SĐT trong khi kiểm tra trùng của service chỉ xét bản ghi chưa xóa. Cần BE xác minh log/constraint, thống nhất cho phép khôi phục/tái sử dụng hay từ chối có chủ đích và trả lỗi nghiệp vụ phù hợp. Không xóa tay bản ghi hoặc tự đổi ràng buộc DB khi chưa thống nhất với POS.

**Không phải mục thiếu của TASK-04:** API tìm SĐT hiện khớp chính xác; debounce 300ms không làm thay đổi cách khớp. Tìm theo một phần SĐT/gợi ý chỉ bổ sung khi có yêu cầu mở rộng được thống nhất.

---

## TASK-05 — Những điểm cần thống nhất với BE

- Docs ghi trạng thái duyệt `DA_NHAP`, BE hiện trả/lọc `DA_NHAP_KHO`. FE dùng giá trị thực tế để lọc và khóa chỉnh sửa, hiển thị “Đã nhập kho”. Cần thống nhất tên trạng thái với docs/POS; chưa coi tiêu chí giá trị `DA_NHAP` đạt nguyên bản.
- Docs ghi `nguoiLienHe`, BE nhận/trả `nguoiDaiDien`. FE dùng trường BE cho nhãn “Người liên hệ”; cần xác nhận hai khái niệm tương đương hoặc bổ sung trường riêng.
- Docs ghi `bienTheId`, BE nhận `maBienThe`. FE gửi `maBienThe` để BE tạo dòng gắn đúng biến thể và cộng tồn khi duyệt.
- GET `/purchase-orders/{id}` chưa trả nhà cung cấp hoặc các dòng chi tiết. FE lấy dòng từ GET `/purchase-order-lines?maPhieuNhap={id}` có phân trang; cần BE bổ sung thông tin nhà cung cấp nếu muốn hiển thị trên chi tiết phiếu. Không suy đoán nhà cung cấp từ bộ lọc hay dữ liệu cục bộ.
- PUT phiếu hiện chỉ cập nhật nhà cung cấp/người nhập/ghi chú, không thay các dòng theo `chiTiet`. FE chỉ cung cấp sửa ghi chú ở phiếu chờ duyệt; sau duyệt khóa. Nếu yêu cầu sửa toàn bộ phiếu cần thống nhất contract, đặc biệt ID biến thể còn thiếu trong response dòng.

Không sửa BE hoặc DB. BE dùng chung POS; các thay đổi contract cần team BE đánh giá tương thích.

---

## TASK-06 — Các mục chờ BE

1. **Ca hiện tại và chủ ca:** `findCurrentActive(thuNganId)` fallback sang ca mở mới nhất toàn hệ thống nếu người dùng không có ca. Response chưa trả ID/tên thu ngân. Cần bỏ fallback hoặc trả owner để xác minh đúng ca của tài khoản; endpoint đóng ca cũng cần kiểm tra quyền sở hữu cho CASHIER. FE hiện chỉ cho CASHIER đóng ca có ID từ response mở ca trong phiên hiện tại; sau tải lại trang/ca mở trên POS chưa đủ dữ liệu xác minh. Banner chưa mở ca chỉ có thể chính xác khi `/current` trả null. ADMIN/MANAGER vẫn xem và đóng ca theo quyền quản lý.
2. **Doanh thu tiền mặt:** truy vấn hiện cộng tổng tiền tất cả đơn có `ma_ca`, không lọc thanh toán tiền mặt, trạng thái thanh toán hoặc đơn hủy. `tienMatDuKien = tienDauCa + tongDoanhThu` chưa phải số tiền mặt thực tế khi có đơn chuyển khoản/MoMo/VNPay. Cần BE xác định doanh thu hợp lệ và tách tiền mặt. FE hiển thị số BE trả, ghi rõ đối chiếu theo hệ thống, không tự gọi số tổng doanh thu là doanh thu tiền mặt.
3. **Đóng ca tiền thực đếm bằng 0:** BE trả `chenhLech = null` nếu `tienKetCa = 0`. FE có thể hiển thị chênh lệch bằng `0 - tienMatDuKien` khi ca đã đóng, nhưng cần BE trả chênh lệch nhất quán.
4. **Thông tin người mở ca:** DTO thiếu ID/tên thu ngân nên danh sách/chi tiết chưa hiển thị người mở ca. Chờ bổ sung contract.

Không sửa BE/DB hoặc luồng POS. Việc mở/đóng ca kiểm thử cần thống nhất tài khoản và ca thử để không tác động ca đang dùng trên POS.

---

## TASK-07 — Những điểm chờ BE thống nhất với docs

- **Kênh bán:** BE gộp tất cả kênh ngoài `TAI_QUAY_POS` thành `ONLINE_WEB` (Website / QR bàn). Chưa thể hiển thị ba tỷ trọng riêng POS, Website, QR bàn đúng docs. FE giữ đúng hai nhóm BE trả, không tự phân bổ.
- **Top 5:** BE nhóm theo biến thể ID/size và giới hạn 5 biến thể, chưa phải 5 sản phẩm tổng hợp các size. FE hiển thị size và giữ thứ tự BE; không gộp 5 dòng rồi coi là top sản phẩm toàn hệ thống. Cần BE bổ sung xếp hạng theo sản phẩm nếu nghiệm thu đúng nghĩa sản phẩm trong docs.
- **Tên trường:** BE dùng `maKenh/tenKenh/soDon`, dòng ngày dùng `soDon`, dòng top dùng `tongTien`, khác ví dụ docs `kenh/soDonHang/doanhThu`. Adapter FE ánh xạ theo DTO thực tế.
- **Định nghĩa doanh thu:** tổng/ngày/kênh/top lọc trạng thái đơn khác `CHO_XAC_NHAN`, `DA_HUY`, chưa trực tiếp kiểm tra giao dịch thanh toán thành công; riêng nhóm phương thức có lọc giao dịch `THANH_CONG`. Cần team BE xác nhận tiêu chí đơn được ghi nhận doanh thu và ảnh hưởng đơn chưa trả tiền, hoàn tiền, giảm giá. FE hiển thị số API, không tự sửa số liệu.

Không sửa BE/DB và không tạo/sửa đơn POS để kiểm thử báo cáo. Chỉ ghi note, không làm báo cáo bàn giao riêng.

---

## TASK-08 — Các mục chờ BE thống nhất

- Cập nhật chương trình chưa có version/ETag để chống ghi đè đồng thời. FE đọc lại trước PUT và chặn nếu dữ liệu khác lúc mở form; vẫn cần BE kiểm soát nguyên tử khi hai phía lưu cùng thời điểm.

- Voucher chưa có tên riêng `tenVoucher`, ngày bắt đầu/kết thúc riêng. BE yêu cầu `maChuongTrinh`; FE chọn chương trình thật và hiển thị tên chương trình/thời hạn liên kết, không giả lập tên voucher hay tự sửa chương trình dùng chung. Muốn modal voucher có tên/thời hạn độc lập đúng docs cần bổ sung contract. Kiểm tra ngày kết thúc sau bắt đầu được thực hiện ở modal tạo chương trình.
- Loại số tiền BE dùng `TIEN_CO_DINH`, docs ghi `SO_TIEN`; số tiền tối đa `mucGiamToiDa`, đơn tối thiểu `donHangToiThieu`, số lượng phát hành `gioiHanSuDung`, lượt dùng `soLuotDaDung`. Adapter quản trị dùng đúng các tên BE, không sửa API áp dụng voucher của khách hàng.
- GET chương trình trả PageResponse, có page/size. FE phân trang và tải hết trang để dropdown không bỏ sót chương trình.
- PUT voucher mapper hiện cập nhật cả `soLuotDaDung`. Cần BE bỏ qua trường này trong cập nhật thông tin, bảo vệ số lượt dùng nguyên tử với POS. FE không có ô sửa lượt dùng; đọc lại số mới nhất trước PUT và tạm chặn sửa voucher thuộc chương trình đang diễn ra để tránh ghi đè giao dịch POS. Chức năng sửa voucher đang diễn ra chưa nghiệm thu đầy đủ.
- BE cho ngày bắt đầu bằng kết thúc; FE chặn bằng nhau theo docs yêu cầu kết thúc phải sau bắt đầu. Chương trình tạm ngưng được hiển thị riêng, không gắn nhãn đang diễn ra.

Chỉ sửa quản trị voucher/chương trình FE. Không sửa BE/DB, không thay đổi áp dụng voucher trong checkout hoặc POS.

---

## TASK-09 — Phát hiện khi kiểm thử tích hợp

- **Đơn tiền mặt chưa thu tiền đã thành “Đã thanh toán”:** ngày 01/11/2026 tạo hai đơn thử `DH-2026-014` (mang về) và `DH-2026-015` (QR bàn 02), mỗi đơn 43.000đ, qua `/payments/guest-cash`. BE trả trạng thái đơn `DA_THANH_TOAN` ngay. Trong `GiaoDichThanhToanServiceImpl.create`, tiền mặt thành công được ghi `THANH_CONG` và cập nhật đơn ngay; cần BE thống nhất thời điểm thu tiền/xác nhận tiền mặt cho đơn khách website/QR, cùng ảnh hưởng tồn kho, doanh thu và POS. FE hiện phản ánh trạng thái BE; chưa có thanh toán tiền thật trong thử nghiệm này. Không tự sửa BE, dữ liệu hoặc giả trạng thái chờ trên FE.

