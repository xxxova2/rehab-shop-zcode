'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ShoppingCart, Trash2, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

export function WishlistView() {
  const { wishlist, removeFromWishlist, addToCart, setView, setSelectedProduct } = useStore()
  if (wishlist.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-6">💝</div><h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
      <p className="text-gray-500 mb-6">Save items you love for later</p>
      <Button onClick={() => setView('home')} className="bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white"><ShoppingBag className="w-4 h-4 mr-2" /> Browse Products</Button>
    </div>
  )
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({wishlist.length} items)</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map((item) => (
          <Card key={item.productId} className="group overflow-hidden">
            <div className="aspect-square bg-gray-50 overflow-hidden cursor-pointer" onClick={() => { setSelectedProduct(item.productId); setView('product') }}>
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm truncate">{item.name}</h3>
              <p className="font-bold text-rose-600">${item.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="p-3 pt-0 flex gap-2">
              <Button size="sm" className="flex-1 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white text-xs" onClick={() => { addToCart({ productId: item.productId, name: item.name, price: item.price, image: item.image, quantity: 1, size: 'M', color: 'Default' }); toast.success('Added to cart!') }}>
                <ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart
              </Button>
              <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => removeFromWishlist(item.productId)}><Trash2 className="w-3 h-3" /></Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
