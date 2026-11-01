# Bàn giao TASK-02 — Đặt món qua QR bàn

Ngày: 27/10/2026. Căn cứ: TASK-02 trong `docs/PARTNER_TASKS.md` và bản bàn giao `PARTNER_HANDOVER_STATUS.md`.

## Nhánh và phạm vi

- Branch: `feature/customer-qr-order-api`.
- Tạo từ `integration/api-baseline`, commit `53010d054d774610f8d726b2f7b0c6f4665e0733`; đã fetch và xác nhận base local khớp origin trước khi tạo.
- Worktree: `C:\Users\MY PC\.codex\worktrees\task02-qr-order\koithe-fe`.
- TASK-01 và thay đổi chưa commit tại `C:\koithe-fe` được giữ nguyên; không mang vào TASK-02.
- Chỉ sửa ba file nguồn hiện có: table adapter, QR page, phần checkout tại bàn. Thêm store riêng của feature tables và báo cáo này. Không sửa router, auth, cart store, order adapter, payment adapter hoặc backend. Không cập nhật package.
- Chưa commit, chưa push, chưa merge vào base.

## Đã triển khai

1. `tableApi.getByQrToken(token)` gọi GET `/tables/qr/{token}` qua HTTP client hiện có, encode token và tái sử dụng mapping bàn.
2. Trang `/qr/:tableToken` gọi API thật, có loading, welcome và nút Xem thực đơn; token sai/hết hạn có thông báo thân thiện và thử lại. Lỗi kết nối không bị gán là token sai.
3. Session bàn dùng Zustand persist với sessionStorage: ID, tên bàn và token QR. Quét token mới sẽ xóa bàn cũ trong khi xác minh; lỗi không giữ nhầm bàn cũ. Tab mới không dùng chung phiên bàn.
4. Checkout tự chọn AT_TABLE khi có phiên bàn; hiển thị bàn chỉ đọc, ẩn địa chỉ/chi nhánh/giờ lấy, không tính phí vận chuyển.
5. Trước submit xác minh lại token, đối chiếu ID bàn. Token không còn hợp lệ sẽ xóa phiên và yêu cầu quét lại; lỗi mạng không tạo đơn.
6. Request tạo đơn dùng `channel: QUET_QR_BAN`, `serviceType: TAI_CHO`, `tableId` từ phiên đã xác minh. Giữ cách xử lý giỏ guest/tài khoản và thanh toán hiện có; không tự dùng tên/SĐT giả thay khách.
7. Xóa phiên bàn sau khi API tạo đơn thành công. Nếu bước payment/clear cart tiếp theo lỗi, hiển thị mã đơn đã tạo, hướng dẫn liên hệ quầy và không hiện form tạo lại đơn trong lần checkout đó.
8. Chọn takeaway/delivery sẽ thoát phiên bàn; muốn đặt tại bàn lần nữa phải quét lại QR. Không cho nhập số bàn thủ công.

## Chưa đủ dữ liệu để đạt phần vị trí theo docs

**Yêu cầu docs:** Banner tên bàn kèm vị trí, ví dụ “Bàn 02 (Tầng 1 - Khu A)”.

**API hiện tại:** `BanResponse` trả `id`, `soBan`, `maQrToken`, `trangThai`; chưa có `viTri` hoặc dữ liệu tầng/khu vực. Ví dụ thực tế đang trả `Ban 02`, FE giữ tên đó.

**Cần team BE bổ sung:** Thống nhất field vị trí và dữ liệu trả tại GET `/api/tables/qr/{token}`. Nếu thống nhất `viTri`, ví dụ `Tầng 1 - Khu A`, FE sẽ map và hiển thị sau khi có contract.

**FE hiện tại:** Chỉ hiển thị tên bàn thật; không bịa vị trí, không sửa BE. Tiêu chí vị trí được đánh dấu BLOCKED, chưa coi đạt đầy đủ theo docs. Báo cáo lưu local, chưa gửi hoặc push cho team BE.

## Kết quả kiểm thử với backend thật

FE TASK-02 chạy tại `http://127.0.0.1:5174`, BE tại `http://localhost:8081`.

| Trường hợp | Kết quả |
|---|---|
| QR Bàn 02 token `a1b2c3d4-0002-4000-8000-000000000002` | Nhận diện `Ban 02`, mở menu được |
| Chọn món rồi checkout | Tự chọn Phục vụ tại bàn; bàn read-only; không có địa chỉ, chi nhánh, thời gian lấy; ship 0 |
| Reload checkout | Giữ phiên Bàn 02 trong cùng tab |
| QR `invalid-task02-token` | Banner không hợp lệ; vào checkout sau đó không giữ bàn cũ |
| Quét token Bàn 03 | Nhận diện `Ban 03`, checkout đổi sang Bàn 03 |
| Guest COD đặt tại bàn | Tạo thành công đơn ID 3, mã `DH-2026-003`, khách QA Task 02, SĐT QA `0900000000` |
| Đọc lại đơn QA qua public tracking | `channel=QUET_QR_BAN`, `serviceType=TAI_CHO`, `tableId=3`, tổng 35000, trạng thái DA_THANH_TOAN |
| Sau tạo đơn, thêm giỏ mới và checkout | Không còn nút/bàn AT_TABLE từ phiên cũ |
| Tab mới trong khi tab cũ có phiên bàn | Tab mới không có phiên bàn; không hiện nút Phục vụ tại bàn |
| Takeaway không có phiên bàn | Giữ chi nhánh/giờ lấy và phí ship 0 |
| Chuyển delivery với giỏ 35000 | Hiện địa chỉ, phí ship 15000, tổng 50000 như luồng cũ |
| QR mobile 375px | Không tràn ngang; documentWidth 360 <= viewport 375 |
| Checkout mobile 375px/414px | Không tràn ngang; documentWidth 360/399 <= viewport 375/414 |
| Console browser | Không có error console ở lần đọc cuối sau các luồng kiểm thử |

Đơn QA được tạo trong môi trường local, không phải giao dịch ngân hàng. Không xóa đơn QA hoặc sửa dữ liệu nghiệp vụ backend để dọn kiểm thử.

## Kiểm tra tĩnh và giới hạn

- TypeScript/build: chạy `npm run build` (bao gồm `tsc -b`).
- Lint: exit 0 với 8 warning có sẵn ở các module khác và hook form checkout; không sửa ngoài task.
- Build có warning chunk lớn >500 kB đã có trước đó; không tối ưu bundle ngoài phạm vi.
- `git diff --check`: không lỗi whitespace.
- Chưa chạy full E2E với tài khoản đăng nhập: thông tin tài khoản mẫu trong docs hiện bị backend trả 401, không thay đổi tài khoản/mật khẩu. Luồng auth/online không được sửa trong task này.
- Nhánh xử lý lỗi payment sau tạo đơn và token hết hiệu lực ngay trước submit đã review code, chưa cố tình gây lỗi BE/payment thật để kiểm thử.
- Backend chưa trả vị trí bàn: BLOCKED như mục trên. Không ghi toàn bộ TASK-02 đạt 100% docs.
- Luồng success/tracking hiện có của base thuộc TASK-01/03; không mang bản sửa TASK-01 vào branch này. Khi tích hợp, giải quyết riêng phần checkout đang được cả hai task thay đổi.

## Cách kiểm tra lại

1. Trong worktree TASK-02 chạy `npm run dev -- --port 5174` với BE local cổng 8081 đang chạy.
2. Mở `/qr/a1b2c3d4-0002-4000-8000-000000000002` và kiểm tra welcome.
3. Xem thực đơn, thêm món, checkout; kiểm tra bàn và phí ship; F5 phải còn bàn.
4. Điền tên/SĐT thử, đặt COD; kiểm tra đơn trong BE có đúng kênh, loại phục vụ và tableId.
5. Thử QR sai rồi vào checkout: không còn phiên bàn cũ.
6. Thử delivery/takeaway và tab mới; kiểm tra không bị gắn nhầm bàn.

Không push hoặc merge trước khi người dùng yêu cầu.
