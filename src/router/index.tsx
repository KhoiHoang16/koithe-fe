import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import { ProtectedRoute, GuestRoute } from './route-helpers';
import * as LazyPages from './lazy-pages';

// =====================================================================
// LAYOUTS
// =====================================================================
import { CustomerLayout } from '@/components/layout/customer-layout';
import { AdminLayout } from '@/components/layout/admin-layout';
import { AuthLayout } from '@/components/layout/auth-layout';

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingScreen />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  // ===================================================================
  // AUTH ROUTES (chỉ cho khách chưa đăng nhập)
  // ===================================================================
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <GuestRoute>
            {withSuspense(<LazyPages.LoginPage />)}
          </GuestRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <GuestRoute>
            {withSuspense(<LazyPages.RegisterPage />)}
          </GuestRoute>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <GuestRoute>
            {withSuspense(<LazyPages.ForgotPasswordPage />)}
          </GuestRoute>
        ),
      },
    ],
  },

  // ===================================================================
  // CUSTOMER / PUBLIC ROUTES
  // ===================================================================
  {
    element: <CustomerLayout />,
    children: [
      { path: '/', element: withSuspense(<LazyPages.HomePage />) },
      { path: '/menu', element: withSuspense(<LazyPages.MenuPage />) },
      { path: '/menu/:productId', element: withSuspense(<LazyPages.ProductDetailPage />) },
      { path: '/cart', element: withSuspense(<LazyPages.CartPage />) },
      { path: '/checkout', element: withSuspense(<LazyPages.CheckoutPage />) },
      { path: '/checkout/payment', element: withSuspense(<LazyPages.PaymentPage />) },
      {
        path: '/checkout/payment/callback',
        element: withSuspense(<LazyPages.PaymentCallbackPage />),
      },
      { path: '/order-success/:orderId', element: withSuspense(<LazyPages.OrderSuccessPage />) },
      { path: '/track-order', element: withSuspense(<LazyPages.TrackOrderPage />) },
      { path: '/qr/:tableToken', element: withSuspense(<LazyPages.QrOrderPage />) },

      // Customer routes (yêu cầu đăng nhập)
      {
        path: '/profile',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'MANAGER', 'CASHIER', 'BARISTA']}>
            {withSuspense(<LazyPages.ProfilePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            {withSuspense(<LazyPages.OrderHistoryPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders/:orderId',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            {withSuspense(<LazyPages.OrderTrackingPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/loyalty',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            {withSuspense(<LazyPages.LoyaltyPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/addresses',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            {withSuspense(<LazyPages.AddressBookPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: '/favorites',
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            {withSuspense(<LazyPages.FavoritesPage />)}
          </ProtectedRoute>
        ),
      },
    ],
  },

  // ===================================================================
  // ADMIN / MANAGER ROUTES
  // ===================================================================
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(<LazyPages.AdminDashboardPage />) },
      { path: 'products', element: withSuspense(<LazyPages.AdminProductsPage />) },
      { path: 'products/new', element: withSuspense(<LazyPages.AdminProductFormPage />) },
      { path: 'products/:id/edit', element: withSuspense(<LazyPages.AdminProductFormPage />) },
      { path: 'categories', element: withSuspense(<LazyPages.AdminCategoriesPage />) },
      { path: 'toppings', element: withSuspense(<LazyPages.AdminToppingsPage />) },
      { path: 'orders', element: withSuspense(<LazyPages.AdminOrdersPage />) },
      { path: 'orders/:id', element: withSuspense(<LazyPages.AdminOrderDetailPage />) },
      { path: 'promotions', element: withSuspense(<LazyPages.AdminPromotionsPage />) },
      { path: 'vouchers', element: withSuspense(<LazyPages.AdminVouchersPage />) },
      { path: 'customers', element: withSuspense(<LazyPages.AdminCustomersPage />) },
      { path: 'customers/:id', element: withSuspense(<LazyPages.AdminCustomerDetailPage />) },
      {
        path: 'employees',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            {withSuspense(<LazyPages.AdminEmployeesPage />)}
          </ProtectedRoute>
        ),
      },
      { path: 'shifts', element: withSuspense(<LazyPages.AdminShiftsPage />) },
      { path: 'tables', element: withSuspense(<LazyPages.AdminTablesPage />) },
      { path: 'inventory', element: withSuspense(<LazyPages.AdminInventoryPage />) },
      { path: 'suppliers', element: withSuspense(<LazyPages.AdminSuppliersPage />) },
      { path: 'reports', element: withSuspense(<LazyPages.AdminReportsPage />) },
      { path: 'settings', element: withSuspense(<LazyPages.AdminSettingsPage />) },
    ],
  },

  // ===================================================================
  // ERROR ROUTES
  // ===================================================================
  { path: '/forbidden', element: withSuspense(<LazyPages.ForbiddenPage />) },
  { path: '*', element: withSuspense(<LazyPages.NotFoundPage />) },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
