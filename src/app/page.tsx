'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Header } from '@/components/views/Header'
import { HeroSection, FeaturesBar } from '@/components/views/HeroSection'
import { ProductGrid } from '@/components/views/ProductGrid'
import { ProductDetail } from '@/components/views/ProductDetail'
import { CartView } from '@/components/views/CartView'
import { CheckoutView } from '@/components/views/CheckoutView'
import { OrdersView } from '@/components/views/OrdersView'
import { WishlistView } from '@/components/views/WishlistView'
import { AdminDashboard } from '@/components/views/AdminDashboard'
import { Footer } from '@/components/views/Footer'

export default function RehabShop() {
  const { currentView } = useStore()
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    if (!seeded) { fetch('/api/seed', { method: 'POST' }).then(() => setSeeded(true)).catch(() => setSeeded(true)) }
  }, [seeded])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {currentView === 'home' && (<><HeroSection /><FeaturesBar /><ProductGrid /></>)}
        {currentView === 'product' && <ProductDetail />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'orders' && <OrdersView />}
        {currentView === 'wishlist' && <WishlistView />}
        {currentView === 'admin' && <AdminDashboard />}
        {currentView === 'profile' && <OrdersView />}
      </main>
      <Footer />
    </div>
  )
}
