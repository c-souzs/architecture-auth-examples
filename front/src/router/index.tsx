import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthorizedRoute } from '@/components/auth/AuthorizedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForbiddenPage } from '@/pages/auth/ForbiddenPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { CategoriesPage } from '@/pages/catalog/CategoriesPage'
import { ProductsPage } from '@/pages/catalog/ProductsPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { StockPage } from '@/pages/stock/StockPage'
import { OrdersPage } from '@/pages/commerce/OrdersPage'
import { Authority } from '@/models/permissions'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forbidden', element: <ForbiddenPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout><Outlet /></AppLayout>,
        children: [
          {
            path: '/users',
            element: (
              <AuthorizedRoute permission={{ authorities: [Authority.USER_READ] }}>
                <UsersPage />
              </AuthorizedRoute>
            ),
          },
          {
            path: '/categories',
            element: (
              <AuthorizedRoute permission={{ authorities: [Authority.CATEGORY_READ] }}>
                <CategoriesPage />
              </AuthorizedRoute>
            ),
          },
          {
            path: '/products',
            element: (
              <AuthorizedRoute permission={{ authorities: [Authority.PRODUCT_READ, Authority.PRODUCT_CATALOG] }}>
                <ProductsPage />
              </AuthorizedRoute>
            ),
          },
          {
            path: '/customers',
            element: (
              <AuthorizedRoute permission={{ authorities: [Authority.CUSTOMER_READ] }}>
                <CustomersPage />
              </AuthorizedRoute>
            ),
          },
          {
            path: '/stock',
            element: (
              <AuthorizedRoute permission={{ authorities: [Authority.STOCK_READ] }}>
                <StockPage />
              </AuthorizedRoute>
            ),
          },
          {
            path: '/orders',
            element: (
              <AuthorizedRoute permission={{ authorities: [Authority.ORDER_READ, Authority.ORDER_OWN] }}>
                <OrdersPage />
              </AuthorizedRoute>
            ),
          },
          { path: '/', element: <Navigate to="/products" replace /> },
          { path: '*', element: <Navigate to="/products" replace /> },
        ],
      },
    ],
  },
])
