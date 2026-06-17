'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { PAYMENT_METHODS } from '@/lib/medusa'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ArrowRight, MapPin, CreditCard, CheckCircle, Package, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

export function CheckoutView() {
  const { cart, clearCart, setView, userId, isLoggedIn, setUser } = useStore()
  const [step, setStep] = useState(1)
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '', city: '' })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '', phone: '' })

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleAuth = async () => {
    try {
      if (loginMode === 'register') {
        const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) })
        const data = await res.json()
        if (data.error) { toast.error(data.error); return }
        setUser(data.id, data.name, data.email, data.role)
      } else {
        const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginForm.email, password: loginForm.password, action: 'login' }) })
        const data = await res.json()
        if (data.error) { toast.error(data.error); return }
        setUser(data.id, data.name, data.email, data.role)
      }
      setStep(2); toast.success(loginMode === 'register' ? 'Account created!' : 'Welcome back!')
    } catch { toast.error('Authentication failed') }
  }

  const handlePlaceOrder = async () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) { toast.error('Please fill in all shipping details'); return }
    setProcessing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId || 'guest', items: cart.map((item) => ({ productId: item.productId, name: item.name, price: item.price, quantity: item.quantity, size: item.size, color: item.color, image: item.image })),
          shippingName: shippingInfo.name, shippingPhone: shippingInfo.phone, shippingAddress: shippingInfo.address, shippingCity: shippingInfo.city,
          paymentMethod, subtotal, shipping, tax, total, whatsappNumber }),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error); setProcessing(false); return }
      setOrderResult(data); clearCart(); setStep(4); toast.success('Order placed successfully!')
    } catch { toast.error('Failed to place order') }
    setProcessing(false)
  }

  if (step === 4 && orderResult) return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-600" /></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
      <p className="text-gray-500 mb-4">Your order has been placed successfully</p>
      <Card className="text-left mb-6"><CardContent className="p-6 space-y-3">
        <div className="flex justify-between"><span className="text-gray-500">Order Number</span><span className="font-bold bg-gradient-to-r from-rose-500 to-fuchsia-600 bg-clip-text text-transparent">#{orderResult.orderNumber}</span></div>
        <Separator />
        <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">${orderResult.total?.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="capitalize">{orderResult.paymentMethod === 'cod' ? 'Cash on Delivery' : orderResult.paymentMethod}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">WhatsApp</span><span>{orderResult.whatsAppNotified ? '✅ Notified' : '⏳ Pending'}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Drive Backup</span><span>{orderResult.driveBackedUp ? '✅ Backed Up' : '⏳ Pending'}</span></div>
      </CardContent></Card>
      <div className="flex gap-3 justify-center">
        <Button onClick={() => setView('orders')} variant="outline"><Package className="w-4 h-4 mr-2" /> View Orders</Button>
        <Button onClick={() => setView('home')} className="bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white">Continue Shopping</Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" onClick={() => setView('cart')} className="mb-4"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Cart</Button>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>
      <div className="flex items-center gap-2 mb-8">
        {[{ n: 1, label: 'Account' }, { n: 2, label: 'Shipping' }, { n: 3, label: 'Payment' }].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s.n ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>{s.n}</div>
            <span className={`text-sm ${step >= s.n ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s.label}</span>
            {i < 2 && <div className={`w-8 h-0.5 transition-all ${step > s.n ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 1 && (
            <Card><CardContent className="p-6">
              <Tabs value={loginMode} onValueChange={(v) => setLoginMode(v as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2 mb-4"><TabsTrigger value="login">Sign In</TabsTrigger><TabsTrigger value="register">Create Account</TabsTrigger></TabsList>
                <TabsContent value="login" className="space-y-4">
                  <div><Label>Email</Label><Input placeholder="your@email.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} /></div>
                  <div><Label>Password</Label><Input type="password" placeholder="••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} /></div>
                  <p className="text-xs text-gray-500">Demo: demo@rehabshop.com / demo123</p>
                </TabsContent>
                <TabsContent value="register" className="space-y-4">
                  <div><Label>Full Name</Label><Input placeholder="Jane Doe" value={loginForm.name} onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })} /></div>
                  <div><Label>Email</Label><Input placeholder="your@email.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input placeholder="+1234567890" value={loginForm.phone} onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })} /></div>
                  <div><Label>Password</Label><Input type="password" placeholder="••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} /></div>
                </TabsContent>
              </Tabs>
              <Button className="w-full mt-4 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white" onClick={handleAuth}>
                {loginMode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {isLoggedIn && <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-green-700 text-sm"><CheckCircle className="w-4 h-4" /> Signed in</div>}
            </CardContent></Card>
          )}
          {step === 2 && (
            <Card><CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-rose-600" /> Shipping Details</h3>
              <div><Label>Full Name</Label><Input placeholder="Jane Doe" value={shippingInfo.name} onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })} /></div>
              <div><Label>Phone Number</Label><Input placeholder="+1234567890" value={shippingInfo.phone} onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })} /></div>
              <div><Label>Address</Label><Textarea placeholder="123 Main St, Apt 4B" value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} /></div>
              <div><Label>City</Label><Input placeholder="New York" value={shippingInfo.city} onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })} /></div>
              <div><Label>WhatsApp Number (for order updates)</Label><Input placeholder="+1234567890" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} /></div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white" onClick={() => setStep(3)}>Continue to Payment <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </CardContent></Card>
          )}
          {step === 3 && (
            <Card><CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-rose-600" /> Payment Method</h3>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.value} className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${paymentMethod === method.value ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={() => setPaymentMethod(method.value)} className="accent-rose-600" />
                    <div><p className="font-medium text-sm">{method.label}</p><p className="text-xs text-gray-500">{method.desc}</p></div>
                  </label>
                ))}
              </div>
              {paymentMethod === 'card' && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div><Label>Card Number</Label><Input placeholder="4242 4242 4242 4242" /></div>
                  <div className="grid grid-cols-2 gap-3"><div><Label>Expiry</Label><Input placeholder="MM/YY" /></div><div><Label>CVV</Label><Input placeholder="123" /></div></div>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white" onClick={handlePlaceOrder} disabled={processing}>
                  {processing ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" /> Processing...</> : <>Place Order - ${total.toFixed(2)}</>}
                </Button>
              </div>
            </CardContent></Card>
          )}
        </div>
        <Card className="h-fit sticky top-28"><CardContent className="p-6 space-y-4">
          <h3 className="font-bold">Order Summary</h3>
          <ScrollArea className="max-h-48"><div className="space-y-3">{cart.map((item, i) => (
            <div key={i} className="flex gap-3"><div className="w-12 h-12 bg-gray-50 rounded overflow-hidden flex-shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>
            <div className="min-w-0 flex-1"><p className="text-xs font-medium truncate">{item.name}</p><p className="text-xs text-gray-500">x{item.quantity} | {item.size}</p></div>
            <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span></div>
          ))}</div></ScrollArea>
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>${tax.toFixed(2)}</span></div>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="bg-gradient-to-r from-rose-500 to-fuchsia-600 bg-clip-text text-transparent">${total.toFixed(2)}</span></div>
        </CardContent></Card>
      </div>
    </div>
  )
}
