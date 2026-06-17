'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Product } from '@/lib/types'
import { calculateDiscount } from '@/lib/medusa'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Heart, Star, Minus, Plus, ChevronLeft, ImageIcon, Truck, RotateCcw, Shield, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatPriceMulti } from '@/lib/currency'
import { buildSingleProductWhatsappMessage, buildWhatsappOrderLink } from '@/lib/whatsapp'

export function ProductDetail() {
  const { selectedProductId, setView, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!selectedProductId) return
    fetch(`/api/products/${selectedProductId}`).then((r) => r.json()).then((data) => {
      setProduct(data)
      if (data.sizes) setSelectedSize(data.sizes.split(',')[0])
      if (data.colors) setSelectedColor(data.colors.split(',')[0])
    }).catch(console.error)
  }, [selectedProductId])

  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full mx-auto mb-4" /><p className="text-gray-500">Loading...</p></div>

  const discount = calculateDiscount(product.price, product.comparePrice)
  const wishlisted = isInWishlist(product.id)

  const handleAddToCart = () => {
    addToCart({ productId: product.id, name: product.name, subtitle: product.subtitle, price: product.price, comparePrice: product.comparePrice || undefined, image: product.images, quantity, size: selectedSize, color: selectedColor })
    toast.success(`${product.name} added to cart!`, { action: { label: 'View Cart', onClick: () => setView('cart') } })
  }

  const handleBuyViaWhatsapp = () => {
    const msg = buildSingleProductWhatsappMessage({ name: product.name, subtitle: product.subtitle, size: selectedSize, color: selectedColor, quantity, price: product.price }, typeof window !== 'undefined' && (window as any).__rehabLocale === 'ar' ? 'ar' : 'en')
    window.open(buildWhatsappOrderLink(msg), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" onClick={() => setView('home')} className="mb-4"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Shop</Button>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden">
          {imgError ? <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-fuchsia-100"><ImageIcon className="w-24 h-24 text-rose-300" /></div>
           : <img src={product.images} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />}
        </div>
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-rose-600 font-medium uppercase">{product.category}</p>
              {product.isNew && <Badge className="bg-emerald-100 text-emerald-700 text-xs">New Arrival</Badge>}
              {product.isSale && <Badge className="bg-rose-100 text-rose-700 text-xs">On Sale</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>
            {product.subtitle && <p className="text-lg text-gray-500">{product.subtitle}</p>}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}</div>
              <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight" dir="ltr">{formatPriceMulti(product.price)}</span>
            {product.comparePrice && <><span className="text-xl text-gray-400 line-through" dir="ltr">{formatPriceMulti(product.comparePrice)}</span><Badge className="bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white">{discount}% OFF</Badge></>}
          </div>
          {product.material && <p className="text-sm text-gray-600"><span className="font-medium">Material:</span> {product.material}</p>}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <div>
            <Label className="text-sm font-semibold mb-2 block">Size</Label>
            <div className="flex gap-2 flex-wrap">{product.sizes.split(',').map((size) => (
              <Button key={size} variant={selectedSize === size ? 'default' : 'outline'} size="sm" onClick={() => setSelectedSize(size)}
                className={selectedSize === size ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white' : ''}>{size}</Button>
            ))}</div>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-2 block">Color</Label>
            <div className="flex gap-2 flex-wrap">{product.colors.split(',').map((color) => (
              <Button key={color} variant={selectedColor === color ? 'default' : 'outline'} size="sm" onClick={() => setSelectedColor(color)}
                className={selectedColor === color ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white' : ''}>{color}</Button>
            ))}</div>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-2 block">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="w-4 h-4" /></Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}><Plus className="w-4 h-4" /></Button>
              <span className="text-xs text-gray-500 ml-2">{product.stockQuantity} in stock</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button size="lg" className="flex-1 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white h-12 shadow-lg shadow-rose-200" onClick={handleAddToCart} disabled={!product.inStock}>
              <ShoppingCart className="w-5 h-5 mr-2" />{product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button size="lg" variant="outline" className={`h-12 ${wishlisted ? 'border-rose-300 text-rose-600' : 'border-gray-200'}`} onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist({ productId: product.id, name: product.name, price: product.price, image: product.images })}>
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
            </Button>
            </div>
            <Button size="lg" variant="outline" className="w-full h-12 border-green-500 text-green-700 hover:bg-green-50" onClick={handleBuyViaWhatsapp}>
              <MessageCircle className="w-5 h-5 mr-2" /> Buy via WhatsApp
            </Button>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            <div className="text-center"><Truck className="w-5 h-5 text-rose-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Free Shipping</p></div>
            <div className="text-center"><RotateCcw className="w-5 h-5 text-rose-600 mx-auto mb-1" /><p className="text-xs text-gray-500">30-Day Returns</p></div>
            <div className="text-center"><Shield className="w-5 h-5 text-rose-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Secure Checkout</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
