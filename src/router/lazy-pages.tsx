import { lazy, Suspense } from 'react';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';

// =====================================================================
// AUTH PAGES
// =====================================================================
export const LoginPage = lazy(() =>
  import('@/pages/auth/login-page').then((m) => ({ default: m.LoginPage })),
);
export const RegisterPage = lazy(() =>
  import('@/pages/auth/register-page').then((m) => ({ default: m.RegisterPage })),
);
export const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/forgot-password-page').then((m) => ({ default: m.ForgotPasswordPage })),
);

// =====================================================================
// CUSTOMER PAGES
// =====================================================================
export const HomePage = lazy(() =>
  import('@/pages/customer/home-page').then((m) => ({ default: m.HomePage })),
);
export const AboutPage = lazy(() =>
  import('@/pages/customer/about-page').then((m) => ({ default: m.AboutPage })),
);
export const MenuPage = lazy(() =>
  import('@/pages/customer/menu-page').then((m) => ({ default: m.MenuPage })),
);
export const ProductDetailPage = lazy(() =>
  import('@/pages/customer/product-detail-page').then((m) => ({ default: m.ProductDetailPage })),
);
export const CartPage = lazy(() =>
  import('@/pages/customer/cart-page').then((m) => ({ default: m.CartPage })),
);
export const CheckoutPage = lazy(() =>
  import('@/pages/customer/checkout-page').then((m) => ({ default: m.CheckoutPage })),
);
export const PaymentPage = lazy(() =>
  import('@/pages/customer/payment-page').then((m) => ({ default: m.PaymentPage })),
);
export const PaymentCallbackPage = lazy(() =>
  import('@/pages/customer/payment-callback-page').then((m) => ({
    default: m.PaymentCallbackPage,
  })),
);
export const OrderSuccessPage = lazy(() =>
  import('@/pages/customer/order-success-page').then((m) => ({ default: m.OrderSuccessPage })),
);
export const TrackOrderPage = lazy(() =>
  import('@/pages/customer/track-order-page').then((m) => ({ default: m.TrackOrderPage })),
);
export const QrOrderPage = lazy(() =>
  import('@/pages/customer/qr-order-page').then((m) => ({ default: m.QrOrderPage })),
);
export const ProfilePage = lazy(() =>
  import('@/pages/customer/profile-page').then((m) => ({ default: m.ProfilePage })),
);
export const OrderHistoryPage = lazy(() =>
  import('@/pages/customer/order-history-page').then((m) => ({ default: m.OrderHistoryPage })),
);
export const OrderTrackingPage = lazy(() =>
  import('@/pages/customer/order-tracking-page').then((m) => ({ default: m.OrderTrackingPage })),
);
export const LoyaltyPage = lazy(() =>
  import('@/pages/customer/loyalty-page').then((m) => ({ default: m.LoyaltyPage })),
);
export const AddressBookPage = lazy(() =>
  import('@/pages/customer/address-book-page').then((m) => ({ default: m.AddressBookPage })),
);
export const FavoritesPage = lazy(() =>
  import('@/pages/customer/favorites-page').then((m) => ({ default: m.FavoritesPage })),
);

// =====================================================================
// ADMIN PAGES
// =====================================================================
export const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/dashboard-page').then((m) => ({ default: m.DashboardPage })),
);
export const AdminProductsPage = lazy(() =>
  import('@/pages/admin/products-page').then((m) => ({ default: m.ProductsPage })),
);
export const AdminProductFormPage = lazy(() =>
  import('@/pages/admin/product-form-page').then((m) => ({ default: m.ProductFormPage })),
);
export const AdminCategoriesPage = lazy(() =>
  import('@/pages/admin/categories-page').then((m) => ({ default: m.CategoriesPage })),
);
export const AdminToppingsPage = lazy(() =>
  import('@/pages/admin/toppings-page').then((m) => ({ default: m.ToppingsPage })),
);
export const AdminOrdersPage = lazy(() =>
  import('@/pages/admin/orders-page').then((m) => ({ default: m.OrdersPage })),
);
export const AdminOrderDetailPage = lazy(() =>
  import('@/pages/admin/order-detail-page').then((m) => ({ default: m.OrderDetailPage })),
);
export const AdminPromotionsPage = lazy(() =>
  import('@/pages/admin/promotions-page').then((m) => ({ default: m.PromotionsPage })),
);
export const AdminVouchersPage = lazy(() =>
  import('@/pages/admin/vouchers-page').then((m) => ({ default: m.VouchersPage })),
);
export const AdminCustomersPage = lazy(() =>
  import('@/pages/admin/customers-page').then((m) => ({ default: m.CustomersPage })),
);
export const AdminCustomerDetailPage = lazy(() =>
  import('@/pages/admin/customer-detail-page').then((m) => ({ default: m.CustomerDetailPage })),
);
export const AdminEmployeesPage = lazy(() =>
  import('@/pages/admin/employees-page').then((m) => ({ default: m.EmployeesPage })),
);
export const AdminShiftsPage = lazy(() =>
  import('@/pages/admin/shifts-page').then((m) => ({ default: m.ShiftsPage })),
);
export const AdminTablesPage = lazy(() =>
  import('@/pages/admin/tables-page').then((m) => ({ default: m.TablesPage })),
);
export const AdminInventoryPage = lazy(() =>
  import('@/pages/admin/inventory-page').then((m) => ({ default: m.InventoryPage })),
);
export const AdminSuppliersPage = lazy(() =>
  import('@/pages/admin/suppliers-page').then((m) => ({ default: m.SuppliersPage })),
);
export const AdminReportsPage = lazy(() =>
  import('@/pages/admin/reports-page').then((m) => ({ default: m.ReportsPage })),
);
export const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/settings-page').then((m) => ({ default: m.SettingsPage })),
);

// =====================================================================
// ERROR PAGES
// =====================================================================
export const ForbiddenPage = lazy(() =>
  import('@/pages/forbidden-page').then((m) => ({ default: m.ForbiddenPage })),
);
export const NotFoundPage = lazy(() =>
  import('@/pages/not-found-page').then((m) => ({ default: m.NotFoundPage })),
);

/** HOC wrap với Suspense để lazy load */
export function withSuspense(Component: React.ComponentType) {
  return function SuspenseWrapper(props: Record<string, unknown>) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
