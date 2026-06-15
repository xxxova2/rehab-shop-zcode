'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ShoppingCart, Minus, Plus, Trash2, ChevronLeft, ShoppingBag, ArrowRight } from 'lucide-react'

export function CartView() {
  const { cart, updateQuantity, removeFromCart, clearCart, setView, cartSavings } = useStore()
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings = cartSavings()
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (cart.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-6">🛒</div><h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet</p>
      <Button onClick={() => setView('home')} className="bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white"><ShoppingBag className="w-4 h-4 mr-2" /> Start Shopping</Button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" onClick={() => setView('home')} className="mb-4"><ChevronLeft className="w-4 h-4 mr-1" /> Continue Shopping</Button>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({cart.length} items)</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, i) => (
            <Card key={`${item.productId}-${item.size}-${item.color}-${i}`} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                  {item.subtitle && <p className="text-xs text-gray-400">{item.subtitle}</p>}
                  <p className="text-xs text-gray-500 mt-0.5">Size: {item.size} | Color: {item.color}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-rose-600">${item.price.toFixed(2)}</span>
                    {item.comparePrice && item.comparePrice > item.price && <span className="text-xs text-gray-400 line-through">${item.comparePrice.toFixed(2)}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 ml-auto text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeFromCart(item.productId, item.size, item.color)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
                <div className="text-right"><p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p></div>
              </div>
            </Card>
          ))}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 mr-2" /> Clear Cart</Button>
            {savings > 0 && <p className="text-sm text-green-600 font-medium">You save ${savings.toFixed(2)}!</p>}
          </div>
        </div>
        <div>
          <Card className="sticky top-28"><CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg">Order Summary</h3><Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {savings > 0 && <div className="flex justify-between text-green-600"><span>Savings</span><span>-${savings.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="bg-gradient-to-r from-rose-500 to-fuchsia-600 bg-clip-text text-transparent">${total.toFixed(2)}</span></div>
            {subtotal < 100 && <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700"><Progress value={(subtotal / 100) * 100} className="h-1.5 mb-2" />Add ${(100 - subtotal).toFixed(2)} more for free shipping!</div>}
            <Button className="w-full bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white h-12 shadow-lg shadow-rose-200" onClick={() => setView('checkout')}>Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </CardContent></Card>
        </div>
      </div>
    </div>
  )
}
