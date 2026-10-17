# 📌 HƯỚNG DẪN PULL CODE & CẬP NHẬT THƯ VIỆN CHO TEAM

> **Dành cho:** Tất cả thành viên trong nhóm phát triển dự án KOI Thé FE  
> **Mục đích:** Hướng dẫn nhanh quy trình kéo mã nguồn (Git Pull) và đồng bộ thư viện mới để dự án khởi chạy mượt mà, tránh lỗi thiếu package.

---

## ⚡ 1. HƯỚNG DẪN NHANH (QUICK START)

Mỗi khi bạn `git pull` nhánh mới hoặc thấy có cập nhật về giao diện/tính năng, **hãy luôn chạy lệnh sau trước khi khởi động dev server**:

```bash
# Bước 1: Kéo code mới nhất về
git pull

# Bước 2: BẮT BUỘC - Tải các thư viện mới bổ sung (như lenis)
npm install
# (hoặc viết tắt: npm i)

# Bước 3: Chạy ứng dụng
npm run dev
```

---

## ⚠️ 2. VẤN ĐỀ THƯỜNG GẶP NẾU KHÔNG CHẠY `npm install`

Nếu bạn vừa `git pull` code mới về mà gõ ngay `npm run dev`, bạn có thể gặp thông báo lỗi màu đỏ trên terminal hoặc trình duyệt:

```text
[vite] Internal server error: Failed to resolve import "lenis" from "src/components/common/smooth-scroll.tsx". Does the file exist?
hoặc
Cannot find module 'lenis'
```

### 💡 Tại sao lại bị lỗi này?
- Thư mục `node_modules` (nơi lưu trữ mã nguồn của các thư viện) **không bao giờ được đẩy lên Git** vì dung lượng rất lớn.
- Khi người khác cài thêm thư viện mới (ví dụ: `lenis`), Git chỉ lưu tên thư viện đó trong file [`package.json`](file:///e:/proc_uni/KoiTheFE/koithe-fe/package.json) và `package-lock.json`.
- Khi bạn kéo code về, máy tính của bạn **chưa tự động tải mã nguồn của thư viện đó về thư mục `node_modules` cục bộ**.
- Do đó, bạn chỉ cần gõ:
  ```bash
  npm i
  ```
  NPM sẽ đọc file cấu hình và tự động tải đúng phiên bản về máy trong vài giây!

---

## 📦 3. DANH MỤC THƯ VIỆN MỚI ĐƯỢC BỔ SUNG GẦN ĐÂY

| Tên Package | Phiên bản | Mục đích sử dụng trong dự án |
| :--- | :--- | :--- |
| **`lenis`** | `^1.3.26` | Cung cấp cơ chế cuộn mượt mà toàn trang (Smooth Scroll) chuẩn 60fps/120fps theo phong cách cao cấp của CHAGEE, khắc phục hiện tượng khựng giật của con lăn chuột mặc định. |

---

## 🛠️ 4. XỬ LÝ SỰ CỐ (TROUBLESHOOTING)

Nếu sau khi chạy `npm i` mà trình duyệt vẫn báo lỗi cache hoặc không tải được trang:

1. **Xóa cache build của Vite và chạy lại:**
   ```bash
   npm run dev -- --force
   ```

2. **Nếu gặp xung đột node_modules cũ (Trường hợp hiếm gặp):**
   ```bash
   # Xóa thư mục node_modules và cài đặt lại sạch sẽ theo đúng package-lock.json:
   npm ci
   ```

---

*Mọi thắc mắc trong quá trình làm việc, hãy liên hệ team frontend để được hỗ trợ nhanh nhất! Chúc team làm việc hiệu quả! 🚀*
