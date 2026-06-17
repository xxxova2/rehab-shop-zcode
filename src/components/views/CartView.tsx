'use client'

import { useState } from 'react'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ShoppingCart, Minus, Plus, Trash2, ChevronLeft, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { buildWhatsappOrderLink, buildWhatsappOrderMessage } from '@/lib/whatsapp'
import { formatPriceMulti } from '@/lib/currency'

export function CartView() {
  const { cart, updateQuantity, removeFromCart, clearCart, setView, cartSavings } = useStore()
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings = cartSavings()
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const { locale } = useStore()
  const [waForm, setWaForm] = useState({ name: '', phone: '', address: '', city: '', notes: '' })
  const [waError, setWaError] = useState('')

  function handleWhatsappOrder() {
    setWaError('')
    if (!waForm.name.trim()) return setWaError(locale === 'ar' ? '\u0627\u0644\u0627\u0633\u0645 \u0645\u0637\u0644\u0648\u0628' : 'Name is required')
    if (!/^\+?[0-9]{8,15}$/.test(waForm.phone.trim())) return setWaError(locale === 'ar' ? '\u0631\u0642\u0645 \u0627\u0644\u062c\u0648\u0627\u0644 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d' : 'Invalid phone number')
    if (!waForm.address.trim()) return setWaError(locale === 'ar' ? '\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0645\u0637\u0644\u0648\u0628' : 'Address is required')
    const msg = buildWhatsappOrderMessage(cart, {
      name: waForm.name.trim(),
      phone: waForm.phone.trim(),
      address: waForm.address.trim(),
      city: waForm.city.trim(),
      notes: waForm.notes.trim()
    }, locale === 'ar' ? 'ar' : 'en')
    const link = buildWhatsappOrderLink(msg)
    window.open(link, '_blank', 'noopener,noreferrer')
    clearCart()
  }

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
                    <span className="font-bold text-rose-600 text-sm leading-tight" dir="ltr">{formatPriceMulti(item.price)}</span>
                    {item.comparePrice && item.comparePrice > item.price && <span className="text-xs text-gray-400 line-through" dir="ltr">{formatPriceMulti(item.comparePrice)}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 ml-auto text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeFromCart(item.productId, item.size, item.color)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
                <div className="text-right"><p className="font-semibold text-gray-900">{formatPriceMulti(item.price * item.quantity)}</p></div>
              </div>
            </Card>
          ))}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 mr-2" /> Clear Cart</Button>
            {savings > 0 && <p className="text-sm text-green-600 font-medium" dir="ltr">You save {formatPriceMulti(savings)}!</p>}
          </div>
        </div>
        <div>
          <Card className="sticky top-28"><CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg">Order Summary</h3><Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="leading-tight" dir="ltr">{formatPriceMulti(subtotal)}</span></div>
              {savings > 0 && <div className="flex justify-between text-green-600"><span>Savings</span><span dir="ltr">-{formatPriceMulti(savings)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={shipping === 0 ? 'text-green-600 font-medium' : ''} dir="ltr">{shipping === 0 ? 'FREE' : formatPriceMulti(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax (8%)</span><span dir="ltr">{formatPriceMulti(tax)}</span></div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="bg-gradient-to-r from-rose-500 to-fuchsia-600 bg-clip-text text-transparent leading-tight" dir="ltr">{formatPriceMulti(total)}</span></div>
            {subtotal < 100 && <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700"><Progress value={(subtotal / 100) * 100} className="h-1.5 mb-2" />Add {formatPriceMulti(100 - subtotal)} more for free shipping!</div>}
            <Button className="w-full bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white h-12 shadow-lg shadow-rose-200" onClick={() => setView('checkout')}>Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" /></Button>

            <div className="relative my-3"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-[10px] uppercase tracking-wider"><span className="bg-white px-2 text-gray-400">{locale === 'ar' ? '\u0623\u0648 \u0627\u0637\u0644\u0628 \u0645\u0628\u0627\u0634\u0631\u0629' : 'or order directly'}</span></div></div>

            <div className="space-y-2">
              <div className="text-sm font-semibold flex items-center gap-1.5 text-gray-700"><MessageCircle className="w-4 h-4 text-green-600" /> {locale === 'ar' ? '\u0627\u0637\u0644\u0628 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628' : 'Order via WhatsApp'}</div>
              <div><Label className="text-xs">{locale === 'ar' ? '\u0627\u0644\u0627\u0633\u0645' : 'Name'} *</Label><Input className="h-9 mt-1" value={waForm.name} onChange={(e) => setWaForm({ ...waForm, name: e.target.value })} autoComplete="name" /></div>
              <div><Label className="text-xs">{locale === 'ar' ? '\u0627\u0644\u062c\u0648\u0627\u0644' : 'Phone'} *</Label><Input className="h-9 mt-1" dir="ltr" placeholder="+9665XXXXXXXX" value={waForm.phone} onChange={(e) => setWaForm({ ...waForm, phone: e.target.value })} autoComplete="tel" /></div>
              <div><Label className="text-xs">{locale === 'ar' ? '\u0627\u0644\u0639\u0646\u0648\u0627\u0646' : 'Address'} *</Label><Input className="h-9 mt-1" value={waForm.address} onChange={(e) => setWaForm({ ...waForm, address: e.target.value })} autoComplete="street-address" /></div>
              <div><Label className="text-xs">{locale === 'ar' ? '\u0627\u0644\u0645\u062f\u064a\u0646\u0629' : 'City'}</Label><Input className="h-9 mt-1" value={waForm.city} onChange={(e) => setWaForm({ ...waForm, city: e.target.value })} autoComplete="address-level2" /></div>
              <div><Label className="text-xs">{locale === 'ar' ? '\u0645\u0644\u0627\u062d\u0638\u0627\u062a' : 'Notes'}</Label><Textarea className="mt-1" rows={2} value={waForm.notes} onChange={(e) => setWaForm({ ...waForm, notes: e.target.value })} /></div>
              {waError && <div className="text-xs text-red-600">{waError}</div>}
              <Button type="button" onClick={handleWhatsappOrder} className="w-full bg-green-600 hover:bg-green-700 text-white h-11 shadow-md">
                <MessageCircle className="w-4 h-4 mr-2" /> {locale === 'ar' ? '\u0623\u0631\u0633\u0644 \u0627\u0644\u0637\u0644\u0628 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628' : 'Send Order via WhatsApp'}
              </Button>
              <p className="text-[11px] text-gray-500 text-center leading-snug">{locale === 'ar' ? '\u0633\u064a\u062a\u0645 \u0641\u062a\u062d \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u0637\u0644\u0628\u0643 \u062c\u0627\u0647\u0632\u0627\u064b \u0644\u0644\u0625\u0631\u0633\u0627\u0644 \u0625\u0644\u0649 \u0627\u0644\u0625\u062f\u0627\u0631\u0629.' : 'WhatsApp opens with your order pre-filled, sent straight to the store admin.'}</p>
            </div>
          </CardContent></Card>
        </div>
      </div>
    </div>
  )
}
