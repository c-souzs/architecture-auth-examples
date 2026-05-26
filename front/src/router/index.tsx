import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AuthorizedRoute } from '@/components/layout/AuthorizedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForbiddenPage } from '@/pages/auth/ForbiddenPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { CategoriesPage } from '@/pages/catalog/CategoriesPage'
import { ProductsPage } from '@/pages/catalog/ProductsPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { StockPage } from '@/pages/stock/StockPage'
import { OrdersPage } from '@/pages/commerce/OrdersPage'
import { appRoutes } from './routeConfig'

const pageComponents: Record<string, React.ReactElement> = {
  '/users':      <UsersPage />,
  '/categories': <CategoriesPage />,
  '/products':   <ProductsPage />,
  '/customers':  <CustomersPage />,
  '/stock':      <StockPage />,
  '/orders':     <OrdersPage />,
}

export const router = createBrowserRouter([
  { path: '/login',     element: <LoginPage /> },
  { path: '/register',  element: <RegisterPage /> },
  { path: '/forbidden', element: <ForbiddenPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      ...appRoutes.map(route => ({
        path: route.path,
        element: (
          <AuthorizedRoute permission={route.permission}>
            {pageComponents[route.path]}
          </AuthorizedRoute>
        ),
      })),
      { path: '/',  element: <Navigate to="/users" replace /> },
      { path: '*',  element: <Navigate to="/users" replace /> },
    ],
  },
])
