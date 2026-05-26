import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (product: { id: number; name: string; price: number }) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_KEY = 'cart'

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  const addItem = useCallback((product: { id: number; name: string; price: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id)
      const next = existing
        ? prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
      saveCart(next)
      return next
    })
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems(prev => {
      const next = prev.filter(i => i.productId !== productId)
      saveCart(next)
      return next
    })
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems(prev => {
      const next = quantity < 1
        ? prev.filter(i => i.productId !== productId)
        : prev.map(i => i.productId === productId ? { ...i, quantity } : i)
      saveCart(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(CART_KEY)
  }, [])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
