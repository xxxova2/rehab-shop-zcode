import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  size: string
  color: string
}

export type View = 
  | 'home' 
  | 'product' 
  | 'cart' 
  | 'checkout' 
  | 'orders' 
  | 'admin' 
  | 'admin-add' 
  | 'admin-orders'

type Store = {
  // Navigation
  currentView: View
  setView: (view: View) => void
  
  // Selected product
  selectedProductId: string | null
  setSelectedProduct: (id: string | null) => void
  
  // Cart
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  cartTotal: () => number
  cartCount: () => number
  
  // Search & Filter
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (c: string) => void
  
  // Admin
  editingProductId: string | null
  setEditingProduct: (id: string | null) => void

  // User session (simplified)
  userId: string
  userName: string
  setUser: (id: string, name: string) => void
  isLoggedIn: boolean
  setIsLoggedIn: (v: boolean) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      currentView: 'home',
      setView: (view) => set({ currentView: view }),
      
      selectedProductId: null,
      setSelectedProduct: (id) => set({ selectedProductId: id }),
      
      cart: [],
      addToCart: (item) => {
        const cart = get().cart
        const existing = cart.find(
          (c) => c.productId === item.productId && c.size === item.size && c.color === item.color
        )
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.productId === item.productId && c.size === item.size && c.color === item.color
                ? { ...c, quantity: c.quantity + item.quantity }
                : c
            ),
          })
        } else {
          set({ cart: [...cart, item] })
        }
      },
      removeFromCart: (productId, size, color) => {
        set({
          cart: get().cart.filter(
            (c) => !(c.productId === productId && c.size === size && c.color === color)
          ),
        })
      },
      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size, color)
          return
        }
        set({
          cart: get().cart.map((c) =>
            c.productId === productId && c.size === size && c.color === color
              ? { ...c, quantity }
              : c
          ),
        })
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
      
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      selectedCategory: 'all',
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      
      editingProductId: null,
      setEditingProduct: (id) => set({ editingProductId: id }),
      
      userId: '',
      userName: '',
      setUser: (id, name) => set({ userId: id, userName: name, isLoggedIn: true }),
      isLoggedIn: false,
      setIsLoggedIn: (v) => set({ isLoggedIn: v }),
    }),
    {
      name: 'rehab-shop-storage',
      partialize: (state) => ({
        cart: state.cart,
        userId: state.userId,
        userName: state.userName,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
