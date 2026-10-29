# Bàn giao TASK-03 — Thanh toán và mô phỏng dev

Ngày: 27/10/2026. Branch: `feature/customer-payment-api`, tạo tại `C:\koithe-fe` từ `integration/api-baseline` commit `53010d054d774610f8d726b2f7b0c6f4665e0733`. Đã fetch và xác nhận base local khớp origin. Không lấy code TASK-01/02 sang. Chưa commit/push.

## Phạm vi thực hiện

Theo TASK-03 trong `PARTNER_TASKS.md`:

- `src/features/payment/api/payment-api.ts`: thêm `devSimulateSuccess(orderId, method)`, dùng GET giao dịch theo ID hiện có; không gọi API lấy payment theo order chưa tồn tại.
- `src/pages/customer/payment-page.tsx`: bỏ QR mock và tài khoản hardcode; đọc đơn/giao dịch thật, kiểm tra ID/amount khớp, render VietQR hoặc nút tiếp tục MoMo/VNPay, polling và mô phỏng dev.
- `src/pages/customer/checkout-page.tsx`: truyền paymentId và kết quả khởi tạo sang payment page; lưu phiên trước khi chuyển trang. COD giữ nhánh success như base. Nếu đã tạo đơn mà tạo payment lỗi thì báo mã đơn, không hiện lại form tạo đơn trong lần checkout đó.
- `src/pages/customer/payment-callback-page.tsx`: tái sử dụng trang kiểm tra giao dịch, không coi query success/resultCode là bằng chứng thanh toán.
- Helper nội bộ `src/features/payment/services/payment-session.ts`: parse ID/URL QR, lưu metadata theo owner và đơn trong sessionStorage; không lưu token hoặc lấy trạng thái cache làm kết luận thành công.
- Test Node độc lập tại `tests/payment/payment-session.test.ts`; không thêm thư viện, không thay tsconfig frontend để đưa Node vào app.
- Không sửa backend, auth, router, cart store, order adapter, trang success/tracking hoặc UI ngoài task.

## Luồng giao diện mới

1. Checkout online tạo đơn và giao dịch bằng API hiện có.
2. Mở `/checkout/payment?orderId=<ID số>&paymentId=<ID số>`. Người dùng đăng nhập bằng tài khoản có quyền xem đơn.
3. VietQR hiển thị URL backend cấp. Thông tin ngân hàng/tài khoản/nội dung được đọc từ chính URL ảnh VietQR đã xác minh domain và số tiền; không dùng `noiDungVietqr` làm nội dung chuyển khoản vì BE hiện lưu transaction reference tại field này.
4. MoMo/VNPay hiện nút tiếp tục tới URL HTTPS backend trả về. Người dùng có thể dùng nút dev tại cùng trang mà không phải chuyển tiền thật.
5. GET `/payments/{id}` được dùng để đọc trạng thái thật; đối chiếu payment thuộc đúng đơn và đúng amount. Query đơn được xác minh trước để không hiển thị giao dịch của đơn khác.
6. Pending polling mỗi 3 giây; terminal/lỗi/đơn đã hủy dừng polling. Nút “Tôi đã thanh toán xong” chỉ GET kiểm tra; không tự đánh dấu đã trả tiền.
7. Nút mô phỏng chỉ trong `import.meta.env.DEV`, gửi đúng orderId/method, sau đó đọc lại payment trước khi chuyển success. Trang production không có nút này.
8. F5 trong cùng tab lấy lại metadata khởi tạo, không POST tạo giao dịch mới. Backend vẫn quyết định trạng thái. Mở link tại tab/thiết bị khác mà BE không trả redirectUrl sẽ báo thiếu QR/link, không dựng QR giả hoặc tạo payment mới.
9. Thiếu/sai ID, không đăng nhập, lỗi 404/quyền/mạng đều có trạng thái thông báo và điều hướng; không còn dùng ID mặc định 1001 rồi xoay vô hạn.
10. Không giữ countdown “hết hạn 15 phút” của giao diện cũ vì DTO hiện chưa có thời điểm hết hạn chung cho giao dịch; không tuyên bố QR ngân hàng hết hiệu lực chỉ theo đồng hồ FE.

## Ảnh trước/sau

- [Trước TASK-03](./task03-before.png): chạy payment page cũ không thay đổi từ base trong checkout cũ ở cổng 5176; cùng tài khoản và đơn QA 8, cùng viewport desktop.
- [Sau TASK-03](./task03-after.png): VietQR thật của cùng đơn QA 8, số tiền 35000.
- [Sau — toàn trang](./task03-after-full.png): có thông tin chuyển khoản và nút dev.
- [Thiếu ID sau sửa](./task03-missing-id-fixed.png): có thông báo thay vì loading vô hạn.
- `task03-before-login.png`: ghi nhận bản cũ tự dẫn tới đăng nhập khi request đơn không được xác thực.

## Kiểm thử đã thực hiện

Môi trường: FE mới `http://127.0.0.1:5173`, BE local `http://localhost:8081`. Tài khoản thử do người dùng cung cấp: huyrio. Không ghi mật khẩu/token vào code hoặc báo cáo.

| Case thuộc TASK-03 | Kết quả |
|---|---|
| Tạo giao dịch VietQR qua checkout | PASS — đơn/payment ID 8, mã DH-2026-008, 35000 |
| QR và thông tin chuyển khoản | PASS — lấy URL backend; bank MB, account/name theo cấu hình BE; nội dung DH2026008 khớp chính QR |
| Nút xác minh khi chưa thanh toán | PASS — báo đang chờ, không chuyển success |
| Refresh trang VietQR | PASS — vẫn orderId/paymentId 8, hiển thị QR qua phiên, không có hành động POST trong payment page |
| Mô phỏng VietQR bằng nút dev | PASS — xác minh lại GET rồi chuyển `/order-success/8` |
| VNPay tạo URL sandbox | PASS — đơn/payment ID 9, hiển thị link HTTPS sandbox.vnpayment.vn do BE cấp |
| Callback có `success=true` khi VNPay vẫn pending | PASS — vẫn pending, không xác nhận theo query |
| Polling tự nhận thành công VNPay | PASS — gọi dev-simulate của BE cho đơn QA 9, FE tự chuyển `/order-success/9` mà không bấm kiểm tra |
| MoMo tạo URL sandbox | PASS — đơn/payment ID 10, hiển thị link HTTPS test-payment.momo.vn do BE cấp |
| Mô phỏng MoMo bằng nút dev | PASS — chuyển `/order-success/10` sau xác minh |
| Thiếu orderId | PASS — lỗi hữu ích, không gọi ID mặc định hoặc xoay vô hạn |
| paymentId không tồn tại | PASS — thông báo 404 và thử lại |
| paymentId thuộc đơn khác (order 9/payment 8) | PASS — không hiển thị thanh toán/thành công cho cặp không khớp |
| MoMo mobile 375/414px | PASS — documentWidth 360/399 <= viewport 375/414; các nút vẫn có trong giao diện |
| Helper tests | PASS 6/6 — ID, QR/amount/domain, URL, status, cache owner/order, storage bị chặn |
| Build production | PASS — `npm run build` gồm `tsc -b`, exit 0; warning bundle lớn có sẵn, không sửa ngoài task |
| Lint | Exit 0, còn 8 warning đã có; không sửa ngoài task |
| Nút dev trong bundle production | Không có nhãn nút mô phỏng trong bundle payment production |

Lệnh chạy test nội bộ (Node 24 có sẵn):

```powershell
node --experimental-strip-types --test tests/payment/payment-session.test.ts
npm run build
npm run lint
```

Đã tạo ba đơn QA local 8/9/10, dùng dev simulation, không chuyển tiền qua ngân hàng/ví thật. Không xóa/sửa đơn QA để dọn dữ liệu. Chưa kiểm thử giao dịch thất bại từ nhà cung cấp thật hoặc thanh toán thực tế bên ngân hàng.

## Các điểm cần BE thống nhất để nghiệm thu đủ docs

1. **Nội dung VietQR khác ví dụ bắt buộc trong docs:** FE gửi `noiDungVietqr: KOITHE DH...` khi create, nhưng gateway hiện tự tạo `addInfo=DH2026008` và trả transaction reference ở field noiDungVietqr. FE hiển thị đúng QR thực để tránh chuyển sai nội dung. Team BE cần thống nhất quy tắc KOITHE trong QR và webhook, không chỉ đổi text hiển thị FE.
2. **URL callback nhà cung cấp:** URL VNPay backend thực trả đang có return URL `http://localhost:8088/api/payments/vnpay-return`, trong khi môi trường BE chạy 8081. Controller callback hiện trả JSON, chưa có luồng redirect thống nhất về FE. FE đã xử lý callback với orderId/paymentId hoặc transaction reference khớp phiên; toàn bộ round trip từ nhà cung cấp cần BE cấu hình callback/redirect phù hợp. Chưa coi thanh toán nhà cung cấp thật là đã PASS.
3. **Khôi phục khác tab/thiết bị:** GET payment hiện không trả lại redirectUrl/metadata đầy đủ. FE phục hồi được trong phiên tab đã tạo payment; muốn mở từ tab/thiết bị khác vẫn có QR/link thì BE cần endpoint trả metadata/redirectUrl của giao dịch đang chờ.
4. **Expiry:** Nếu cần đồng hồ hết hạn thật, BE cần cung cấp expiresAt hoặc quy tắc hết hạn được xác định cho từng phương thức; FE không tự áp 15 phút cho mọi cổng.

Đây là các sai khác/giới hạn cụ thể; không tự sửa BE và không đánh dấu toàn bộ TASK-03 đạt 100% docs khi chưa chốt các mục này.

## Checklist tối thiểu để người dùng review TASK-03

1. Đăng nhập, tạo đơn chọn VietQR → kiểm tra QR, số tiền, thông tin chuyển khoản.
2. Chưa thanh toán → bấm “Tôi đã thanh toán xong” → vẫn pending.
3. F5 → vẫn giao dịch đó; bấm mô phỏng dev → sang success.
4. Tạo đơn chọn MoMo/VNPay → đúng tên phương thức/link; mô phỏng đúng method.
5. Mở `/checkout/payment?orderId=` → có thông báo, không xoay mãi.
6. Kiểm tra bản production không có nút dev.

Lỗi giỏ hàng/tracking/trang success ngoài phạm vi không được tự sửa trong task này; chỉ kiểm tra đến việc payment xác nhận và điều hướng đúng.
