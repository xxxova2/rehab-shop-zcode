import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  name: string
  subtitle?: string
  price: number
  comparePrice?: number
  image: string
  quantity: number
  size: string
  color: string
}

export type WishlistItem = {
  productId: string
  name: string
  price: number
  image: string
}

export type Address = {
  id?: string
  label: string
  firstName: string
  lastName: string
  phone: string
  address1: string
  address2?: string
  city: string
  province?: string
  postalCode?: string
  country: string
  isDefault: boolean
}

export type View = 
  | 'home' 
  | 'product' 
  | 'cart' 
  | 'checkout' 
  | 'orders' 
  | 'admin' 
  | 'wishlist'
  | 'profile'

type Store = {
  // Navigation
  currentView: View
  setView: (view: View) => void
  
  // Selected product
  selectedProductId: string | null
  setSelectedProduct: (id: string | null) => void
  
  // Cart (Medusa-style with compare pricing)
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  cartTotal: () => number
  cartCount: () => number
  cartSavings: () => number
  
  // Wishlist
  wishlist: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  
  // Search & Filter
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (c: string) => void
  sortBy: string
  setSortBy: (s: string) => void
  priceRange: [number, number]
  setPriceRange: (r: [number, number]) => void
  
  // Locale (i18n)
  locale: string
  setLocale: (l: string) => void

  // Currency
  currency: string
  currencySymbol: string
  setCurrency: (c: string, s: string) => void

  // Admin
  editingProductId: string | null
  setEditingProduct: (id: string | null) => void

  // User session
  userId: string
  userName: string
  userEmail: string
  userRole: string
  setUser: (id: string, name: string, email: string, role: string) => void
  isLoggedIn: boolean
  setIsLoggedIn: (v: boolean) => void
  logout: () => void
  
  // Saved addresses
  addresses: Address[]
  addAddress: (a: Address) => void
  removeAddress: (id: string) => void

  // Theme
  darkMode: boolean
  toggleDarkMode: () => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      currentView: 'home',
      setView: (view) => set({ currentView: view }),
      
      selectedProductId: null,
      setSelectedProduct: (id) => set({ selectedProductId: id }),
      
      // Cart
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
      cartSavings: () => get().cart.reduce((sum, item) => sum + ((item.comparePrice || item.price) - item.price) * item.quantity, 0),
      
      // Wishlist
      wishlist: [],
      addToWishlist: (item) => {
        if (!get().wishlist.find((w) => w.productId === item.productId)) {
          set({ wishlist: [...get().wishlist, item] })
        }
      },
      removeFromWishlist: (productId) => {
        set({ wishlist: get().wishlist.filter((w) => w.productId !== productId) })
      },
      isInWishlist: (productId) => get().wishlist.some((w) => w.productId === productId),
      
      // Search & Filter
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      selectedCategory: 'all',
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      sortBy: 'newest',
      setSortBy: (s) => set({ sortBy: s }),
      priceRange: [0, 500],
      setPriceRange: (r) => set({ priceRange: r }),
      
      // Locale
      locale: 'en',
      setLocale: (l) => set({ locale: l }),
      
      // Currency
      currency: 'USD',
      currencySymbol: '$',
      setCurrency: (c, s) => set({ currency: c, currencySymbol: s }),

      // Admin
      editingProductId: null,
      setEditingProduct: (id) => set({ editingProductId: id }),

      // User
      userId: '',
      userName: '',
      userEmail: '',
      userRole: 'customer',
      setUser: (id, name, email, role) => set({ userId: id, userName: name, userEmail: email, userRole: role, isLoggedIn: true }),
      isLoggedIn: false,
      setIsLoggedIn: (v) => set({ isLoggedIn: v }),
      logout: () => set({ userId: '', userName: '', userEmail: '', userRole: 'customer', isLoggedIn: false }),
      
      // Addresses
      addresses: [],
      addAddress: (a) => set({ addresses: [...get().addresses, { ...a, id: Date.now().toString() }] }),
      removeAddress: (id) => set({ addresses: get().addresses.filter((a) => a.id !== id) }),

      // Theme
      darkMode: false,
      toggleDarkMode: () => set({ darkMode: !get().darkMode }),
    }),
    {
      name: 'rehab-shop-storage',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        userId: state.userId,
        userName: state.userName,
        userEmail: state.userEmail,
        userRole: state.userRole,
        isLoggedIn: state.isLoggedIn,
        locale: state.locale,
        currency: state.currency,
        currencySymbol: state.currencySymbol,
        addresses: state.addresses,
        darkMode: state.darkMode,
      }),
    }
  )
)
