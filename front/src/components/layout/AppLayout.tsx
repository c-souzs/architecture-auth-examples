import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { CartProvider } from '@/context/CartContext'
import { CartModal } from '@/components/cart/CartModal'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <CartProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </CartProvider>
  )
}

function AppLayoutInner({ children }: AppLayoutProps) {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="flex min-h-screen max-h-screen bg-gray-50">
      <Sidebar onCartClick={() => setCartOpen(true)} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
