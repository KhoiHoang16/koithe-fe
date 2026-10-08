# 🎯 Koi Thé Omnichannel Frontend

<p align="center">
  Frontend cho hệ thống quản lý bán hàng đa kênh (Omnichannel) cho chuỗi trà sữa.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="React Query" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=zustand&logoColor=white" alt="Zustand" />
</p>

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Core & Styling

- **React (ReactJS) + Vite**: Bộ đôi build tool và UI library mạnh mẽ, tối ưu tốc độ build và phát triển.
- **TypeScript**: Tăng cường type safety, hạn chế lỗi runtime.
- **Tailwind CSS + shadcn/ui**: Tiện lợi và nhanh chóng trong việc xây dựng giao diện tùy chỉnh và đồng bộ.

### State Management, Routing & Form

- **React Router**: Điều hướng trang Client-side mượt mà.
- **TanStack Query (React Query)**: Quản lý cache và đồng bộ hóa state server.
- **Zustand**: Quản lý global state (client state).
- **React Hook Form + Zod**: Quản lý state của form và kiểm định dữ liệu (validation).
- **Axios**: HTTP client mạnh mẽ hỗ trợ interceptor, request/response transformer.

### Yêu Cầu Hệ Thống (Environment & Tools)

Project hiện được cấu hình và phát triển với:

- **Node.js**: `>= 20.0.0` (Khuyến nghị dùng phiên bản LTS mới nhất)
- **npm**: Dùng phiên bản đi kèm Node.js

---

## 📂 Cấu Trúc Source Code

```txt
src/
  app/                         # Cấu hình cấp app: App root, providers, query client
    app.tsx                    # Compose AppProviders + AppRouter
    providers.tsx              # Bọc các provider global như QueryClientProvider, TooltipProvider, Toaster
    query-client.ts            # Cấu hình TanStack Query client

  assets/                      # Asset được import trực tiếp trong code
    logo.png

  components/                  # Component gắn với application shell, không phải shared generic
    layout/                    # Layout chính của dashboard và auth
      navigation/              # Định nghĩa cấu hình route & sidebar theo phân quyền (role-based)
      app-header.tsx           # Header trên cùng: logo, user menu, notification, mobile menu
      app-sidebar.tsx          # Sidebar điều hướng
      auth-layout.tsx          # Layout cho luồng xác thực (Login, Forgot Password...)
      dashboard-layout.tsx     # Layout dashboard gồm header, sidebar, main outlet
      role-context.tsx         # Context quản lý phân quyền (User Roles)

  features/                    # Module nghiệp vụ theo feature/domain
    catalog/                   # Quản lý sản phẩm (menu trà sữa, topping...)
    orders/                    # Quản lý đơn hàng (POS, online)
    promotions/                # Quản lý chương trình khuyến mãi
    tables/                    # Quản lý bàn / khu vực
    ...
      api/                     # Endpoint/API functions riêng của feature
      components/              # UI riêng của feature
        [feature]-management.tsx # Container màn hình quản lý feature
        [feature]-table.tsx      # Bảng danh sách hiển thị (nếu có)
        [feature]-toolbar.tsx    # Thanh tìm kiếm và bộ lọc của feature
      constants/               # Hằng số riêng của feature
      hooks/                   # Custom hooks riêng của feature
      mock/                    # Mock data tạm thời trước khi nối API
      schema/                  # Zod/form schema riêng của feature
      services/                # Optional: pure business logic phức tạp, không gọi API
      types/                   # Type riêng của feature
        index.ts
      index.ts                 # Public barrel export của feature

  pages/                       # Route-level page wrappers
    catalog-page.tsx           # Page route "/catalog", compose RoutePageLayout + CatalogManagement
    placeholder-page.tsx       # Page tạm cho các route chưa phát triển
    ...                        # Và các route page khác

  router/                      # Cấu hình React Router
    index.tsx                  # Khởi chạy router và RouterProvider cấp ứng dụng
    lazy-pages.tsx             # Lazy-load toàn bộ pages/layouts giúp tối ưu bundle size
    route-elements.tsx         # Định nghĩa các element chuyển hướng nội bộ (ví dụ: RootRedirect)
    route-helpers.tsx          # Helpers bọc Suspense, tạo breadcrumb & placeholder route
    routes.tsx                 # Cấu hình danh sách routes theo phân quyền (role-based)

  shared/                      # Code dùng chung, không phụ thuộc nghiệp vụ cụ thể
    api/                       # HTTP foundation dùng chung
      http-client.ts           # Axios instance, apiClient, ApiError, withCredentials

    components/                # Các UI component dùng chung phân chia theo nhóm chức năng
      ui/                      # UI primitives gốc (Button, Input, Select, Table...) theo shadcn/ui
      common/                  # Component UI dùng chung hỗ trợ chung cấp ứng dụng
      feedback/                # Component phản hồi giao diện (error-page.tsx, status-badge.tsx...)
      overlay/                 # Component hiển thị lớp đè (notification-popover.tsx, base-modal.tsx...)
      data-display/            # Component hiển thị thông tin (user-avatar.tsx, timeline.tsx...)
      layout/                  # Component cấu trúc layout dùng chung (page-layout.tsx, route-page-layout.tsx...)
      ...                      # Các nhóm khác (form, filter, table, statistics...)

    hooks/                     # Hook dùng chung, không thuộc feature cụ thể
      use-client-pagination.ts # Hook quản lý phân trang client
      use-client-table-state.ts # Hook quản lý trạng thái bảng dữ liệu client
      use-debounce.ts          # Hook trì hoãn thay đổi giá trị (debounce)
      use-mobile.ts            # Hook nhận diện kích thước thiết bị di động

    libs/                      # Utility dùng chung (design tokens, pagination, date, text...)
      date.ts                  # Helpers format ngày tháng
      design-tokens.ts         # Cấu hình giá trị màu sắc, font...
      pagination.ts            # Helpers phân trang dữ liệu
      text.ts                  # Helpers định dạng chuỗi văn bản
      utils.ts                 # Hàm cn(), helper className

    schema/                    # Schema dùng chung thật sự giữa nhiều feature
    stores/                    # Global state (Zustand)

  styles/                      # Global styles và design tokens
    globals.css                # Tailwind import, shadcn CSS, CSS variables, base styles

  main.tsx                     # Entry point ReactDOM
```

---

## 📐 Quy Tắc Tổ Chức Folder

### 🚀 `app`

Dùng cho cấu hình cấp ứng dụng:

- Provider global
- Query client
- App root

> [!NOTE]  
> Không đặt business logic hoặc component nghiệp vụ ở đây.

### 🖼️ `components/layout`

Dùng cho layout gắn với app hiện tại:

- Header & Sidebar chính
- Layout luồng xác thực (`auth-layout.tsx`) và Dashboard (`dashboard-layout.tsx`)
- Quản lý phân quyền hiển thị sidebar/routes (`navigation/`, `role-context.tsx`)

> [!NOTE]  
> Không đưa vào `shared` vì các component này phụ thuộc cấu trúc dashboard và phân quyền của dự án.

### 🧩 `features`

Mỗi nghiệp vụ lớn là một feature riêng.

Ví dụ:

```txt
features/
  catalog/         # Quản lý sản phẩm (menu trà sữa, topping...)
  orders/          # Quản lý đơn hàng (POS, online)
  promotions/      # Quản lý chương trình khuyến mãi
  tables/          # Quản lý bàn / khu vực
  ...
```

Trong mỗi feature, tổ chức theo nhu cầu:

```txt
features/<feature>/
  api/             # Endpoint/API functions của feature
  components/      # Component riêng của feature
  constants/       # Hằng số riêng của feature
  hooks/           # TanStack Query hooks hoặc hook riêng của feature
  mock/            # Mock data tạm thời
  schema/          # Zod/form schema riêng của feature
  services/        # Optional: pure business logic phức tạp, không gọi API
  types/           # Type riêng định nghĩa kiểu dữ liệu của feature
  index.ts         # Public barrel export của feature
```

### 📄 `pages`

Dùng cho route-level wrapper.

Page nên mỏng, chủ yếu compose layout + feature component.

Ví dụ:

```tsx
export function CatalogPage() {
  return (
    <RoutePageLayout breadcrumbs={['Quản lý sản phẩm', 'Danh sách sản phẩm']}>
      <CatalogManagement />
    </RoutePageLayout>
  )
}
```

### 🛣️ `router`

Dùng để khai báo cấu hình route, lazy-load trang và điều phối luồng truy cập theo phân quyền.

Hiện tại router hỗ trợ:

- Lazy-loading toàn bộ pages/layouts qua `lazy-pages.tsx` nhằm tối ưu hóa bundle size.
- Tổ chức route theo prefix vai trò thông qua hàm `roleRoutes` để phục vụ UI-only navigation (admin, manager, staff).
- Điều hướng các route cũ và fallback lỗi qua `ErrorPage`.

> [!NOTE]
> Đây mới là tổ chức route theo vai trò ở tầng UI. Auth guard và permission guard thật sự sẽ được bổ sung khi tích hợp backend.

### 🤝 `shared`

Chỉ đặt code thật sự dùng chung vào đây.

Nên đặt vào `shared` khi:

- Không phụ thuộc nghiệp vụ cụ thể.
- Có thể dùng bởi nhiều feature.
- Là UI primitive, utility, hook dùng chung hoặc HTTP foundation.

> [!WARNING]  
> Không nên đặt vào `shared` nếu file chỉ phục vụ một feature.

### 🔗 `shared/api`

Dùng cho HTTP foundation.

Hiện tại có:

```txt
shared/api/http-client.ts
```

File này cấu hình:

- Axios instance
- `baseURL` từ `VITE_API_BASE_URL`
- `withCredentials: true`
- timeout
- `ApiError`
- `apiClient.get/post/put/patch/delete`

> [!IMPORTANT]  
> Endpoint theo nghiệp vụ không đặt ở đây. Endpoint của từng feature sẽ được định nghĩa riêng tại `features/[feature]/api/`.

### 🎨 `shared/components/ui`

Dùng cho UI primitives:

- Button
- Card
- Input
- Select
- Table
- ...

Đây là nơi shadcn/ui components được đặt.

### 🧱 `shared/components`

Dùng cho các component dùng chung trên toàn ứng dụng, được chia vào các nhóm thư mục chức năng:

- **`ui/`**: Các UI primitives gốc (Button, Input, Select, Table...) theo shadcn/ui.
- **`common/`**: Các component UI hỗ trợ chung cấp ứng dụng.
- **`layout/`**: Cấu trúc layout trang (`page-layout.tsx`, `route-page-layout.tsx`...).
- **`feedback/`**: Component phản hồi giao diện (`error-page.tsx`, `status-badge.tsx`...).
- **`overlay/`**: Component hiển thị lớp đè (`notification-popover.tsx`, Dialogs...).
- **`data-display/`**: Component hiển thị thông tin (`user-avatar.tsx`, Timeline...).
- **Các nhóm khác**: `form/`, `filter/`, `statistics/`, `table/`...

### 🪝 `shared/hooks`

Dùng cho hook generic không gắn liền với business logic nào:

- `useDebounce`
- `useMobile`
- `useClientPagination`
- `useClientTableState`

_Hook riêng của feature thì đặt trong:_

```txt
features/<feature>/hooks/
```

### 📚 `shared/libs`

Dùng cho utility generic:

- `utils.ts` (chứa `cn()`, helper classnames...)
- `pagination.ts` (helpers tính toán phân trang)
- `date.ts` (helpers format ngày tháng)
- `text.ts` (helpers xử lý văn bản)
- `design-tokens.ts` (các giá trị cấu hình design tokens)

_Không đặt business logic nghiệp vụ vào đây._

### 📋 `shared/schema`

Dùng cho schema kiểm định dữ liệu thật sự được chia sẻ giữa nhiều feature.

Schema riêng của feature nên đặt tại:

```txt
features/<feature>/schema/
```

### 🎨 `styles`

Dùng cho global CSS:

- Tailwind import
- shadcn CSS import
- CSS variables, base styles

---

## 🚫 Các Folder Không Dùng Ở Root

Hiện tại cố ý không dùng:

```txt
src/services
src/hooks
src/lib
src/types
```

**Lý do:**

- `services`: không dùng ở root; API đặt trong `features/<feature>/api`, pure logic phức tạp có thể đặt trong `features/<feature>/services`.
- `hooks`: thay bằng `shared/hooks` hoặc `features/<feature>/hooks`.
- `lib`: thay bằng `shared/libs`.
- `types`: type nên nằm trong feature; chỉ tạo `shared/types` khi có type dùng chung thật sự.

---

## 📡 Pattern API

Mỗi feature tổ chức API theo cấu trúc:

```txt
features/[feature]/
  api/
    [feature]-api.ts           # Định nghĩa các hàm gọi HTTP endpoint
    [feature]-query-keys.ts    # Quản lý query keys cho TanStack Query
  hooks/
    use-[feature]-query.ts           # useQuery hook lấy dữ liệu
    use-[feature]-mutation.ts        # useMutation hook tạo/cập nhật/xóa dữ liệu
  services/
    [feature]-utils.ts               # Pure logic nghiệp vụ, không phụ thuộc React hay API
```

> [!NOTE]
> Feature nào chưa kết nối backend sẽ dùng mock data tạm trong `mock/`.
> Khi backend sẵn sàng, chỉ cần bổ sung vào `api/` và `hooks/` mà không cần thay đổi cấu trúc.

---

### Query Keys (`features/[feature]/api/[feature]-query-keys.ts`)

Query keys được đặt trong `api/` để khi cần invalidate cache từ nơi khác, chỉ cần import từ một chỗ duy nhất.

```ts
export const catalogQueryKeys = {
  all: ['catalog'] as const,
  lists: () => [...catalogQueryKeys.all, 'list'] as const,
  list: (params: GetCatalogParams) => [...catalogQueryKeys.lists(), params] as const,
  detail: (id: string) => [...catalogQueryKeys.all, 'detail', id] as const,
}
```

---

### API Endpoint (`features/[feature]/api/[feature]-api.ts`)

```ts
import { apiClient } from '@/shared/api/http-client'

export const catalogApi = {
  getProducts: (params: GetProductsParams) =>
    apiClient.get<GetProductsResponse>('/products', { params }),

  getProductById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`),

  createProduct: (body: CreateProductPayload) =>
    apiClient.post<Product>('/products', body),

  updateProduct: (id: string, body: UpdateProductPayload) =>
    apiClient.put<Product>(`/products/${id}`, body),

  deleteProduct: (id: string) =>
    apiClient.delete(`/products/${id}`),
}
```

---

### Custom Hooks (`features/[feature]/hooks/`)

```ts
// use-products-query.ts
import { useQuery } from '@tanstack/react-query'

export function useProductsQuery(params: GetProductsParams) {
  return useQuery({
    queryKey: catalogQueryKeys.list(params),
    queryFn: () => catalogApi.getProducts(params),
  })
}
```

```ts
// use-product-mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateProductPayload) => catalogApi.createProduct(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.lists() })
    },
  })
}
```

---

### Services (`features/[feature]/services/`)

Dùng cho pure logic nghiệp vụ: không import React, không gọi API, chỉ nhận input và trả output.

```ts
// catalog-utils.ts
export function calculateDiscountPrice(originalPrice: number, discountPercent: number): number { ... }

export function formatProductName(product: Product): string { ... }

export function isProductAvailable(product: Product, store: Store): boolean { ... }
```

> [!NOTE]
> Nếu logic đủ đơn giản, có thể bỏ qua `services/` và đặt thẳng vào component hoặc hook.
> Chỉ tạo khi logic đủ phức tạp và cần tái sử dụng.

---

## ⌨️ Scripts

Các câu lệnh build và run project:

```bash
# Cài đặt các thư viện dependencies
npm install

# Khởi chạy dự án ở môi trường local (development mode)
npm run dev

# Định dạng tự động toàn bộ mã nguồn với Prettier
npm run format

# Kiểm tra định dạng mã nguồn với Prettier
npm run format:check

# Kiểm tra chất lượng và định dạng mã nguồn với ESLint
npm run lint

# Build dự án sang phiên bản sản xuất (production)
npm run build

# Chạy thử phiên bản production vừa build ở môi trường local
npm run preview
```

---

## 🌐 Environment

Hệ thống quản lý biến môi trường tập trung sử dụng [Zod](https://zod.dev) để kiểm định dữ liệu tại cả **build-time** (Vite config) và **bootstrap runtime** (trình duyệt). Nếu thiếu hoặc cấu hình sai biến môi trường bắt buộc, ứng dụng sẽ throw lỗi dừng hoạt động ngay lập tức (fail-fast).

Sao chép `.env.example` thành `.env` ở thư mục gốc của dự án:
```bash
cp .env.example .env
```

> [!WARNING]
> Tệp `.env.example` cung cấp khuôn mẫu cấu hình mẫu và không tự động cập nhật đè lên tệp `.env` hiện có của các nhà phát triển khác. Vui lòng tự cập nhật thủ công tệp `.env` cá nhân của bạn nếu có tham số mới.

Các biến môi trường được hỗ trợ:

- **`VITE_API_BASE_URL`** (Bắt buộc): URL dẫn đến Backend API. Trailing slashes `/` ở cuối sẽ tự động được lọc sạch trước khi kiểm định. Yêu cầu định dạng:
  - Nếu là absolute URL: chỉ hỗ trợ giao thức HTTP hoặc HTTPS (ví dụ: `http://localhost:8080/api` hoặc `https://domain.com/api`).
  - Nếu là relative URL: phải bắt đầu bằng ký tự `/`, không được chứa query parameters (`?`) hoặc hash (`#`), và bắt buộc phải kết thúc bằng `/api` (ví dụ: `/api` hoặc `/gateway/api`).
- **`VITE_ENABLE_QUERY_DEVTOOLS`** (Tùy chọn): Bật/Tắt React Query Devtools trong môi trường phát triển (development). Chỉ nhận giá trị `"true"` hoặc `"false"` (mặc định là `"true"`). Devtools sẽ luôn luôn bị tắt trong môi trường sản xuất (production) bất kể giá trị cấu hình này thế nào.

> [!IMPORTANT]
> Biến môi trường Vite được đóng gói tĩnh tại build-time. Mọi thay đổi trong tệp `.env` chỉ có hiệu lực sau khi khởi động lại server dev hoặc chạy lại lệnh build (`npm run build`).
