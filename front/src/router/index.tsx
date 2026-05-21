import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { CategoriesPage } from '@/pages/catalog/CategoriesPage'
import { ProductsPage } from '@/pages/catalog/ProductsPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { StockPage } from '@/pages/stock/StockPage'
import { OrdersPage } from '@/pages/commerce/OrdersPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/users', element: <UsersPage /> },
  { path: '/categories', element: <CategoriesPage /> },
  { path: '/products', element: <ProductsPage /> },
  { path: '/customers', element: <CustomersPage /> },
  { path: '/stock', element: <StockPage /> },
  { path: '/orders', element: <OrdersPage /> },
  { path: '/', element: <Navigate to="/users" replace /> },
  { path: '*', element: <Navigate to="/users" replace /> },
])
