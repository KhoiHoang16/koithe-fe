# Kế hoạch hoàn thành TASK-01 đến TASK-09

Ngày lập: 27/10/2026. Trạng thái: kế hoạch triển khai, chưa phải báo cáo nghiệm thu.

## 1. Căn cứ và giới hạn công việc

- Nguồn yêu cầu chính: `docs/PARTNER_TASKS.md`; hiện trạng bàn giao: `docs/PARTNER_HANDOVER_STATUS.md`.
- Các tài liệu checkout, account/order history, product detail, redesign và about dùng để giữ đúng thiết kế và hành vi đã có. Các báo cáo PASS cũ không thay thế kiểm thử phiên bản hiện tại.
- Khi docs mâu thuẫn nhau, đối chiếu tài liệu giao task, bản bàn giao mới hơn và code thực tế; ghi rõ sai khác trước khi quyết định. Không tự loại bỏ tiêu chí docs vì backend chưa hỗ trợ.
- Chỉ triển khai FE trong phạm vi task. Backend được đọc để kiểm tra contract; thiếu API/dữ liệu/nghiệp vụ thì lập mục phối hợp BE, không tự sửa `C:\koithe-api`.
- Không bổ sung CRUD nhân viên: TASK-04 chỉ giao quản lý khách hàng và yêu cầu giữ phần nhân viên. Không sửa `employees-page.tsx` trong kế hoạch này.
- Không refactor toàn dự án, đổi giao diện ngoài task, format hàng loạt, cập nhật thư viện hoặc sửa lỗi có sẵn không liên quan.
- API qua adapter feature và TanStack Query; tái sử dụng HTTP client, auth interceptor, UI primitives và thư viện đã cài.
- Thêm types/schema/hooks/components riêng trong feature tương ứng khi cần; pages compose giao diện. Dùng tên thư mục thực tế `orders`, `tables`, `promotions`, dù ví dụ docs ghi dạng số ít.

## 2. Quy trình Git và bảo vệ code của team

1. Trước mỗi task: kiểm tra branch, HEAD, `git status`, diff và danh sách file được phép sửa.
2. Mỗi task mới phải tạo nhánh từ **`integration/api-baseline`**, không tạo từ nhánh task trước hoặc nhánh `all`.
3. Fetch và cập nhật base bằng fast-forward trước khi tạo nhánh, nếu remote truy cập được. Không reset base để ép đồng bộ; nếu không cập nhật được phải ghi rõ base commit đang dùng.
4. Không commit/merge trực tiếp vào `main`, `develop`, `integration/api-baseline`. Không tự push hoặc mở PR khi người dùng chưa yêu cầu push. Có thể chuẩn bị mô tả và bằng chứng review tại local.
5. Không checkout khi còn thay đổi chưa được bảo toàn. Không tự stash, reset, clean, restore hoặc chuyển thay đổi hiện tại sang task khác.
6. Khi thực thi task mới, ưu tiên worktree riêng từ base để giữ nguyên workspace TASK-01 đang có thay đổi. Tạo branch task tại worktree đó; nếu branch đã tồn tại, kiểm tra nguồn gốc trước khi tái sử dụng, không xóa/ghi đè branch.
7. Các file dùng chung chỉ sửa phần tối thiểu cần cho tiêu chí task và ghi rõ trong diff. Nếu cần thay đổi hợp đồng công khai ảnh hưởng màn hình khác hoặc mở rộng quyền ở cấp ứng dụng, chuẩn bị đề xuất cụ thể để người dùng/team duyệt trước khi sửa.
8. Kết thúc mỗi task: đối chiếu diff với phạm vi, chạy kiểm tra, báo file đã sửa, kết quả và blocker. Commit local theo task chỉ sau khi kiểm tra; không gộp thay đổi của thành viên khác vào commit.

Nhánh theo tài liệu giao việc:

| Task | Branch |
|---|---|
| 01 | `feature/customer-track-order-api` — đã có, review tại đây |
| 02 | `feature/customer-qr-order-api` |
| 03 | `feature/customer-payment-api` |
| 04 | `feature/admin-customer-api` |
| 05 | `feature/admin-inventory-api` |
| 06 | `feature/admin-shift-api` |
| 07 | `feature/admin-report-api` |
| 08 | `feature/admin-promotion-api` |
| 09 | `test/frontend-e2e-regression` |

Các task 02/03 cùng sửa checkout, task 01/03 có thể dùng chung order adapter. Mỗi branch vẫn bắt đầu ở base; kiểm thử độc lập trước, sau đó tích hợp tại branch TASK-09. Không mang cả branch task trước vào task mới chỉ để lấy một thay đổi dùng chung. Nếu task cần một prerequisite chưa có ở base, ghi rõ commit phụ thuộc và phương án tích hợp trước khi thực hiện.

## 3. Bước đầu: kiểm tra contract và baseline

- Chụp lại HEAD FE/BE, trạng thái working tree, phiên bản dữ liệu thử và môi trường local.
- Với từng API: ghi endpoint, method, quyền, request, response, phân trang, enum, nullable và mã lỗi từ controller/DTO/service hiện tại; xác minh runtime khi môi trường sẵn sàng.
- Tách rõ: yêu cầu docs / backend hiện có / phần thiếu cần team BE xử lý.
- Đo baseline typecheck, lint, build trước khi code để phân biệt lỗi cũ với lỗi task. Không tự sửa lỗi baseline ngoài phạm vi.
- Chuẩn bị dữ liệu thử tái tạo được; không dựa vào một mã đơn đã tạo ở lần kiểm thử cũ.

## 4. TASK-01 — Review và nghiệm thu phần đã làm

Không viết lại từ đầu. Hiện có thay đổi chưa commit ở order adapter, track page, checkout và order-success; phải giữ nguyên cho đến khi review xong.

### Phạm vi

- Chính: `src/features/orders/api/order-api.ts`, `src/pages/customer/track-order-page.tsx`.
- Hai file checkout/order-success hiện đã sửa: chỉ review liên kết tới tra cứu; chỉ giữ thay đổi nếu cần trực tiếp cho luồng nghiệm thu TASK-01 và không phá route lịch sử đơn.

### Các bước review

1. Kiểm tra `trackOrder` gọi public GET `/orders/track` với code/phone, unwrap đúng envelope và dùng mapping hiện có.
2. Kiểm tra trim input, mã đơn bắt buộc, validation điện thoại, nhấn Enter, chống submit trùng và phân biệt 400/404/mất mạng/5xx.
3. Kiểm tra đủ sáu trạng thái backend qua enum FE: PENDING, CONFIRMED, PREPARING, SHIPPING, COMPLETED, CANCELLED. Nhãn CONFIRMED phải thể hiện đã thanh toán; SAN_SANG không được khẳng định đã giao hoặc shipper đang di chuyển khi API chỉ biết sẵn sàng.
4. Đối chiếu món, size, đường/đá, topping, số lượng, tổng thanh toán, loại phục vụ và địa chỉ giao hàng với response thật; không suy diễn dữ liệu không có.
5. Review các fallback vừa thêm vào mapper dùng chung: không dùng ID dòng đơn thay cho variantId/productId nếu khiến thao tác đặt lại đơn dùng sai sản phẩm. Nếu cần sửa, chọn cách tối thiểu và kiểm tra các nơi dùng mapper.
6. Kiểm tra kết quả cũ sau lần tìm thất bại, tìm lại đơn khác, reset, F5, query params và phản hồi bất đồng bộ. Không thêm yêu cầu chia sẻ số điện thoại lên URL vì docs không giao chức năng này.
7. Kiểm tra checkout → success → theo dõi cho guest và tài khoản. Phân biệt ID số với mã DH-...; xác minh route chi tiết đang dùng ID gì trước khi giữ thay đổi hiện tại.
8. Kiểm tra desktop và mobile 375/414px; chạy typecheck, lint, build.

### Nghiệm thu

- Tra cứu public đúng mã + điện thoại; sai thông tin không lộ đơn; sáu trạng thái hiển thị đúng; đủ loading/empty/error.
- Danh sách đối chiếu từng tiêu chí docs với bằng chứng PASS/FAIL/BLOCKED, chỉ sửa lỗi trong phạm vi.
- Không tuyên bố đúng 100% khi còn trạng thái hoặc luồng chưa kiểm thử.

## 5. TASK-02 — Đặt món qua QR bàn

### File và giới hạn

- `src/features/tables/api/table-api.ts`, `src/pages/customer/qr-order-page.tsx`, phần checkout phục vụ tại bàn.
- Thêm session store/type/hook thuộc feature tables nếu cần. Tái sử dụng cart hiện có, không sửa cơ chế merge giỏ.

### Thực hiện

1. Thêm `getByQrToken`; backend hiện trả `id`, `soBan`, `maQrToken`, `trangThai`. Adapter phải tương thích StoreTable hiện có.
2. Ghi sai khác docs về `tenBan`, `viTri`, `tokenQr`. Không tự dựng vị trí bàn. Yêu cầu BE bổ sung vị trí nếu tiêu chí banner tầng/khu vẫn bắt buộc; đánh dấu phần đó chưa đạt đến khi có dữ liệu.
3. Trang QR xác minh token, hiển thị welcome/loading/error và nút xem menu; chỉ lưu session sau xác minh thành công.
4. Session theo tab chứa ID bàn và tên/token cần thiết. Xóa session cũ khi quét token mới thất bại; xử lý đổi bàn và thoát chế độ tại bàn rõ ràng.
5. Checkout mở rộng schema/type/UI cho AT_TABLE; khóa bàn, không yêu cầu địa chỉ/chi nhánh/giờ lấy của takeaway, phí giao hàng bằng 0.
6. Gửi `channel: QUET_QR_BAN`, `serviceType: TAI_CHO`, `tableId` đúng; giữ nguyên cách xử lý cartToken và giới hạn thanh toán guest đang có.
7. Xác định mốc xóa session sau khi đơn đã tạo thành công; xử lý riêng trường hợp tạo đơn thành công nhưng tạo payment lỗi để không tạo lại đơn do mất ngữ cảnh.

### Nghiệm thu

- Token hợp lệ/không tồn tại; F5; đổi bàn; guest/tài khoản; đặt món và kiểm tra payload.
- Takeaway/delivery thông thường vẫn giữ hành vi cũ. Không thêm API bàn giả.

## 6. TASK-03 — Thanh toán và mô phỏng dev

### Phạm vi

- `payment-api.ts`, `payment-page.tsx`; chỉnh tối thiểu checkout để truyền paymentId/kết quả khởi tạo, callback chỉ khi cần cho luồng được giao.
- Không thay đổi auth interceptor, cơ chế callback/webhook hoặc nghiệp vụ backend.

### Thực hiện

1. Dùng POST `/payments`, POST `/payments/guest-cash`, GET `/payments/{id}` và endpoint dev đã có. Không gọi `/payments/order/{id}` vì backend hiện chưa cung cấp.
2. Giữ guest COD theo payload thực; online guest hiện cần đăng nhập. Không tự mở thêm thanh toán public.
3. Truyền `orderId` số và `paymentId`; kiểm tra payment thuộc đúng order, method và amount trước khi hiển thị. Không dùng ID mặc định 1001 khi thiếu query.
4. QR dùng `redirectUrl` backend trả cho CHUYEN_KHOAN_QR; MoMo/VNPay chuyển sang cổng tương ứng. Không hardcode ngân hàng/tài khoản hoặc tạo QR từ chuỗi giả.
5. Chốt contract thông tin ngân hàng và nội dung chuyển khoản: gateway hiện sinh nội dung khác ví dụ KOITHE trong docs, metadata chưa được DTO trả đầy đủ. Cần BE thống nhất nội dung/metadata và cách lấy lại QR sau reload; không tự suy đoán `noiDungVietqr` là nội dung QR vì service đang lưu transaction reference vào field này.
6. Kiểm tra trạng thái giao dịch thật bằng API hiện có; polling chỉ khi pending, dừng khi thành công/thất bại/unmount và khi hết hạn nếu có hạn được xác định. Nút xác minh không gọi simulate.
7. Nếu giữ countdown 15 phút, phải phân biệt thời gian hiển thị FE với thời hạn giao dịch BE. Không tuyên bố QR hết hiệu lực ngân hàng nếu BE chưa quy định; không reset hạn sau F5.
8. Nút simulate chỉ trong `import.meta.env.DEV`, dùng method của giao dịch hiện tại, disable khi đang gửi; xác minh lại dữ liệu rồi điều hướng success.
9. Xử lý hủy, giao dịch đang chờ, lỗi tạo payment sau tạo order, callback đến chậm và retry; không tạo trùng đơn/giao dịch từ việc render hoặc polling.

### Nghiệm thu

- VietQR hiển thị đúng dữ liệu BE; MoMo/VNPay redirect/callback; COD guest và tài khoản vẫn chạy.
- Pending/success/failure, thiếu ID, ID không khớp, F5, mạng lỗi, simulate; build production không có nút dev.
- Các tiêu chí thiếu metadata/expiry phải ghi BLOCKED và đề nghị BE, không đánh dấu hoàn tất giả.

## 7. TASK-04 — Quản lý khách hàng

### Phạm vi

- Tạo `src/features/customer/api/customer-api.ts` cùng types/schema/hooks/components cần thiết; hai trang customers và customer-detail.
- Không làm CRUD nhân viên. Không sửa profile khách hàng hoặc hệ thống tài khoản.

### Thực hiện

1. Adapter list/search/detail/create/update/delete với request và response types riêng.
2. Danh sách, tìm điện thoại debounce 300ms, loading/empty/error; phản hồi cũ không ghi đè truy vấn mới.
3. Form theo DTO thực: create hỗ trợ SĐT, họ tên, email, mật khẩu tùy chọn; update hiện chỉ họ tên/email. Không cho nhập thông tin rồi âm thầm bỏ qua khi submit.
4. Ghi yêu cầu BE cho địa chỉ/ngày sinh/giới tính và sửa SĐT nếu docs vẫn yêu cầu. Chưa đủ contract thì phần tiêu chí đó chưa thể nghiệm thu.
5. Quyền theo controller: ADMIN/MANAGER/CASHIER đọc và tạo, ADMIN/MANAGER sửa, ADMIN xóa. Xóa có xác nhận và cập nhật cache list/detail.
6. Chi tiết hiển thị thông tin, điểm/hạng có thật. Lịch sử mua hàng/tích điểm hiện thiếu contract riêng: yêu cầu BE cung cấp truy vấn theo customerId và lịch sử điểm; không dùng `/orders/my` hoặc phone tracking thay thế.
7. Thu ngân cần truy cập đúng màn khách hàng nhưng route cha đang chặn. Chuẩn bị patch route/nav tối thiểu, bảo vệ từng màn; đây là thay đổi dùng chung cần chốt trước khi áp dụng. Không cho CASHIER toàn quyền admin.

### Nghiệm thu

- CRUD theo quyền, tìm kiếm, validation, lỗi trùng điện thoại và trạng thái không có khách hàng.
- So sánh response với UI; các trường/lịch sử thiếu API được ghi riêng để team BE hoàn thiện.

## 8. TASK-05 — Nhà cung cấp và phiếu nhập

### Phạm vi

- Hai adapter supplier/purchase-order và hai trang suppliers/inventory; helper/type/UI nội bộ feature inventory.
- Đọc sản phẩm/biến thể qua API catalog có sẵn; không sửa quản lý sản phẩm hay logic tồn kho backend.

### Thực hiện

1. Chốt DTO và PageResponse; giữ metadata phân trang thay vì chỉ lấy content.
2. Danh sách NCC và CRUD có validation, xác nhận xóa, lỗi backend và cache invalidation.
3. Danh sách phiếu: NCC, thời gian, trạng thái, phân trang; chuyển đầu/cuối ngày theo Asia/Saigon sang Instant theo semantics filter BE.
4. Tạo phiếu chọn NCC, chọn variant thật, nhiều dòng, số lượng dương/giá hợp lệ; tính tổng preview và gửi payload đúng DTO.
5. Chi tiết phiếu để kiểm tra mặt hàng trước duyệt. Chỉ cho thao tác đúng trạng thái; xác nhận duyệt, chống double click và refetch chi tiết/list.
6. Sau duyệt khóa chỉnh sửa; kiểm tra tồn kho bằng đọc dữ liệu trước/sau, không cộng tồn kho ở FE.

### Nghiệm thu

- CRUD NCC, tạo/đọc/duyệt phiếu, phân trang/lọc, dữ liệu rỗng/lỗi và duyệt lại không cộng tồn lần hai.
- Không mở rộng sang hệ thống kho nguyên liệu, công thức, xuất kho nếu task không giao.

## 9. TASK-06 — Ca làm việc và đối soát

### Phạm vi

- Shift adapter, trang shifts và UI nội bộ feature shift.
- Route/nav cho CASHIER là dependency dùng chung, chỉ áp dụng patch tối thiểu đã được chốt; không xây POS mới trong task này.

### Thực hiện

1. Adapter list/current/open/detail/close đúng contract và nullable current.
2. ADMIN/MANAGER xem danh sách/lọc; CASHIER dùng current/open/close/detail theo quyền, không gọi list bị cấm.
3. Hiển thị ca hiện tại, banner chưa mở ca, form tiền đầu ca không âm và xử lý 409 đã có ca.
4. Form đóng ca hiển thị doanh thu, tiền đầu ca, tiền mặt kỳ vọng, tiền thực đếm và chênh lệch; đóng xong refetch trạng thái.
5. Công thức nghiệp vụ: tiền mặt kỳ vọng = tiền đầu ca + tiền mặt thực thu trong ca; chênh lệch = tiền thực đếm - tiền mặt kỳ vọng.
6. BE hiện cộng tổng đơn vào tiền mặt kỳ vọng, có thể trả ca người khác khi current không tìm thấy ca của người dùng, và không trả thông tin nhân viên/danh sách đơn đầy đủ. Lập yêu cầu BE sửa/xác định dữ liệu; không tự coi tổng doanh thu là tiền mặt, không tự suy đoán quyền sở hữu ca.
7. Kiểm thử đóng ca 0 đồng và nhiều phương thức thanh toán; kiểm tra chênh lệch API sau khi BE hoàn thiện.

### Nghiệm thu

- Mở/đóng ca, ca đã đóng, mở trùng, số âm, quyền từng vai trò và dữ liệu current đúng người.
- Ca có tiền đầu ca + tiền mặt + online tính đúng chênh lệch. Chưa sửa BE thì phần đối soát/current liên quan ghi BLOCKED.

## 10. TASK-07 — Báo cáo

### Phạm vi

- Report adapter và reports page, components/types/hooks nội bộ feature report. Không sửa dashboard admin hiện có.

### Thực hiện

1. Typed adapter GET `/reports?from=&to=&top=5`; ngày YYYY-MM-DD theo Asia/Saigon.
2. Preset hôm nay/7 ngày/tháng này và khoảng tùy chỉnh; validate từ <= đến, query key chứa bộ lọc.
3. Ba KPI doanh thu/số đơn/số ly, line chart doanh thu ngày, donut theo kênh và top 5 sản phẩm.
4. Dùng Recharts đã cài; xử lý số 0, mảng rỗng, lỗi và responsive. Chỉ điền ngày doanh thu 0 khi ý nghĩa API cho phép.
5. Quyền ADMIN/MANAGER, định dạng VND/ngày đồng nhất và đối chiếu tổng với API.

### Nghiệm thu

- Tất cả bộ lọc, KPI/chart/top khớp cùng response; khoảng không có doanh thu không làm chart lỗi.
- Không thêm báo cáo xuất file hoặc biểu đồ ngoài yêu cầu.

## 11. TASK-08 — Voucher và chương trình khuyến mãi

### Phạm vi

- Promotion adapter, promotions page, types/hooks/schema/components riêng.
- `vouchers-page.tsx` hiện có chỉ cần kiểm thử hồi quy; không tự thiết kế lại hoặc xóa route voucher.

### Thực hiện

1. Typed adapter voucher list/create/update/delete và chương trình list/create; giữ phân trang.
2. Dùng đúng field BE: maChuongTrinh, maCode, PHAN_TRAM/TIEN_CO_DINH, giaTriGiam, mucGiamToiDa, donHangToiThieu, gioiHanSuDung. Không gửi nguyên `Partial<Voucher>` UI vào BE.
3. Danh sách voucher, đã dùng/tổng phát hành, form CRUD và xác nhận xóa; chọn chương trình có thật, không hardcode maChuongTrinh=1 trong luồng mới.
4. Danh sách/tạo chương trình, validate ngày bắt đầu/kết thúc và trạng thái hoạt động.
5. Thời hạn voucher lấy từ chương trình liên kết nếu đây là nghiệp vụ được thống nhất. Nếu docs yêu cầu tên/thời hạn riêng từng voucher thì cần BE bổ sung, không giả lưu các field chưa hỗ trợ.
6. Hiển thị trạng thái sắp diễn ra/đang diễn ra/hết hạn đúng ngày và active flag. Thống kê số voucher/chương trình chỉ khi có toàn bộ dữ liệu hoặc count từ API, không đếm một trang rồi coi là tổng.
7. Validation % >0 và <=100, tiền cố định dương, giới hạn sử dụng hợp lệ; backend là nơi quyết định mã trùng và điều kiện áp dụng.
8. Thay adapter dùng chung phải giữ hợp đồng cũ cho trang voucher/cart; nếu không thể giữ tương thích, tách API/hook mới thay vì refactor diện rộng.

### Nghiệm thu

- Voucher CRUD, chương trình list/create, validation, thời hạn, mã trùng, lỗi API và phân trang.
- Trang voucher cũ và áp mã giỏ hàng không bị ảnh hưởng.

## 12. TASK-09 — Tích hợp, E2E và responsive

1. Tạo branch test từ integration/api-baseline; bảo toàn thay đổi local trước khi thao tác Git.
2. Tích hợp các commit local đã review của task 01–08 vào branch test, không merge ngược vào base. Giải quyết xung đột checkout/adapter theo từng hunk và kiểm thử lại luồng liên quan.
3. Nếu TASK-01 chưa có commit để tích hợp, hoàn thành review và lưu thay đổi trên branch TASK-01 trước; không copy bừa working tree sang task mới.
4. Chạy năm kịch bản docs: guest order/tracking; cart merge; QR bàn; cashier mở ca → POS → đóng ca; mobile 375/414px.
5. POS chưa có màn hình/route trong FE hiện tại: xác định module do thành viên nào phụ trách và phiên bản tích hợp. Chưa có thì kịch bản POS ghi BLOCKED; không tự xây hệ POS trong task kiểm thử hoặc dùng Swagger rồi gọi là E2E giao diện đã đạt.
6. Bổ sung hồi quy vùng bị tác động: payment pending/success/failure/F5; khách hàng theo role; NCC/phiếu nhập; ca tiền mặt + online; báo cáo; voucher và cart.
7. Kiểm tra console/network, loading/empty/error, overflow, modal, keyboard cơ bản và thao tác mobile. Với lỗi ngoài phạm vi, ghi repro và chuyển người phụ trách; chỉ sửa lỗi nằm trong phần task đã giao.
8. Chạy npx tsc -b, npm run lint, npm run build. Ghi rõ lỗi baseline nếu còn, không ghi PASS toàn dự án khi lệnh thất bại.
9. Lưu báo cáo local theo từng scenario: commit, role, dữ liệu thử, bước thực hiện, kết quả, ảnh/video nếu có, PASS/FAIL/BLOCKED.

## 13. Thứ tự thực hiện và điều kiện kết thúc

Thứ tự đề xuất: review TASK-01 → TASK-02 → TASK-03 → TASK-04 → TASK-05 → TASK-06 → TASK-07 → TASK-08 → tích hợp TASK-09.

Các mục thiếu contract phải được chốt trước khi code phần phụ thuộc. Trong khi chờ có thể làm phần độc lập của task hoặc TASK-05/07 trên branch riêng từ base; không tự thay scope để né blocker.

Mỗi task có checklist kết thúc:

- Đã đối chiếu toàn bộ acceptance criteria trong PARTNER_TASKS.md.
- Diff chỉ chứa file/phần code được giao hoặc dependency tối thiểu đã được chốt.
- Không có dữ liệu giả được dùng để khẳng định đáp ứng API/nghiệp vụ.
- Loading, empty, error; phân quyền và validation đầy đủ trong phạm vi.
- Typecheck/lint/build và kiểm thử tương tác có kết quả ghi nhận rõ ràng.
- Hồi quy các màn hình cùng dùng adapter đã sửa.
- Blocker backend/team có mô tả cụ thể; task có blocker chưa được ghi hoàn thành toàn bộ.
- Không tự push, mở PR hoặc merge vào base. Báo người dùng kết quả local và những việc còn cần phối hợp.

Thời lượng chỉ ước tính sau review TASK-01 và chốt các khoảng trống BE/quyền/POS; con số 17,5 ngày ở plan cũ chưa đủ căn cứ để cam kết.
