'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore, CartItem as StoreCartItem, WishlistItem } from '@/lib/store'
import { t, formatPrice, formatDate, CURRENCIES, COUNTRIES } from '@/lib/i18n'
import { CATEGORY_ICONS, calculateDiscount, getWhatsAppUrl, buildOrderWhatsAppMessage, getStatusColor, getPaymentStatusColor, PAYMENT_METHODS, ORDER_STATUSES, SORT_OPTIONS } from '@/lib/medusa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ShoppingCart, Search, Heart, Star, Minus, Plus, Trash2, 
  Package, ChevronLeft, Store, Menu, X,
  Truck, Shield, RotateCcw, CreditCard, Phone, MapPin,
  User, LogIn, UserPlus, Settings, LayoutDashboard, 
  Image as ImageIcon, Tag, Eye, Edit, Trash, PlusCircle,
  Download, MessageCircle, CheckCircle, Clock, AlertCircle,
  ArrowRight, ShoppingBag, Gift, Percent, HeartHandshake,
  Globe, Moon, Sun, Filter, ChevronDown, ExternalLink,
  Sparkles, TrendingUp, DollarSign, BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

// ═══════════════ TYPES ═══════════════
type Product = {
  id: string; name: string; slug: string; subtitle?: string; description: string
  material?: string; price: number; comparePrice: number | null; images: string
  category: string; sizes: string; colors: string; inStock: boolean; stockQuantity: number
  featured: boolean; isNew: boolean; isSale: boolean; rating: number; reviewCount: number
  tags?: string
}

type Category = { id: string; name: string; slug: string; icon?: string | null }
type Collection = { id: string; title: string; slug: string; description?: string | null; isActive: boolean }

type OrderType = {
  id: string; orderNumber: string; status: string; fulfillmentStatus: string
  total: number; subtotal: number; shipping: number; tax: number; discount: number
  couponCode?: string | null; shippingName: string; shippingPhone: string
  shippingAddress: string; shippingCity: string; paymentMethod: string
  paymentStatus: string; whatsAppNotified: boolean; driveBackedUp: boolean
  createdAt: string; items: OrderItemType[]; user?: { name: string; email: string }
}

type OrderItemType = {
  id: string; name: string; price: number; quantity: number
  size: string; color: string; image: string
}

// ═══════════════ HEADER ═══════════════
function Header() {
  const { cart, setView, currentView, isLoggedIn, userName, userRole, logout, locale, setLocale, darkMode, toggleDarkMode } = useStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white text-xs py-1.5 text-center font-medium">
        🎉 Free Shipping on Orders Over $100 | Use Code: <span className="font-bold">REHAB20</span> for 20% Off
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setView('home')} className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-md">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-fuchsia-600 bg-clip-text text-transparent leading-none">Rehab Shop</h1>
              <p className="text-[10px] text-gray-400 leading-none">Women&apos;s Fashion Store</p>
            </div>
          </button>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { view: 'home' as const, label: t(locale, 'shop'), icon: ShoppingBag },
              { view: 'wishlist' as const, label: t(locale, 'wishlist'), icon: Heart },
              { view: 'orders' as const, label: t(locale, 'orders'), icon: Package },
              { view: 'admin' as const, label: t(locale, 'admin'), icon: LayoutDashboard },
            ].map((item) => (
              <Button key={item.view} variant={currentView === item.view ? 'default' : 'ghost'} size="sm"
                onClick={() => setView(item.view)}
                className={currentView === item.view ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white shadow-sm' : ''}>
                <item.icon className="w-4 h-4 mr-1.5" />{item.label}
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="h-8 w-8 p-0">
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </TooltipTrigger><TooltipContent>Toggle Theme</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')} className="h-8 w-8 p-0">
                  <Globe className="w-4 h-4" />
                </Button>
              </TooltipTrigger><TooltipContent>{locale === 'en' ? 'العربية' : 'English'}</TooltipContent></Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="sm" onClick={() => setView('cart')} className="relative">
              <ShoppingCart className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t(locale, 'cart')}</span>
              {cartCount > 0 && <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white text-[10px] h-5 w-5 flex items-center justify-center p-0">{cartCount}</Badge>}
            </Button>
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-fuchsia-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-rose-600" />
                </div>
                <span className="font-medium text-gray-700 max-w-[80px] truncate">{userName}</span>
                {userRole === 'admin' && <Badge className="bg-rose-100 text-rose-700 text-[9px]">Admin</Badge>}
              </div>
            ) : (
              <Button variant="default" size="sm" className="bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white" onClick={() => setView('home')}>
                <LogIn className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{t(locale, 'signIn')}</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-3 space-y-1">
            {[
              { view: 'home' as const, label: t(locale, 'shop'), icon: ShoppingBag },
              { view: 'wishlist' as const, label: t(locale, 'wishlist'), icon: Heart },
              { view: 'orders' as const, label: t(locale, 'orders'), icon: Package },
              { view: 'admin' as const, label: t(locale, 'admin'), icon: LayoutDashboard },
            ].map((item) => (
              <Button key={item.view} variant="ghost" className="w-full justify-start" onClick={() => { setView(item.view); setMobileMenuOpen(false) }}>
                <item.icon className="w-4 h-4 mr-2" />{item.label}
              </Button>
            ))}
            {isLoggedIn && <Button variant="ghost" className="w-full justify-start text-red-500" onClick={() => { logout(); setMobileMenuOpen(false) }}><LogIn className="w-4 h-4 mr-2" />Sign Out</Button>}
          </div>
        )}
      </div>
    </header>
  )
}

// ═══════════════ HERO ═══════════════
function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-rose-200 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-200 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Badge className="bg-gradient-to-r from-rose-100 to-fuchsia-100 text-rose-700 border-rose-200 text-sm px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />New Collection 2025
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Discover Your <span className="bg-gradient-to-r from-rose-500 to-fuchsia-600 bg-clip-text text-transparent">Perfect</span> Style
            </h2>
            <p className="text-lg text-gray-600 max-w-md">Explore our curated collection of women&apos;s fashion. From elegant dresses to trendy activewear, find everything you love.</p>
            <div className="flex gap-3">
              <Button size="lg" className="bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white px-8 shadow-lg shadow-rose-200">
                Shop Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                <Gift className="w-4 h-4 mr-2" /> Special Offers
              </Button>
            </div>
            <div className="flex gap-8 pt-4">
              <div><p className="text-2xl font-bold text-gray-900">2K+</p><p className="text-sm text-gray-500">Products</p></div>
              <div><p className="text-2xl font-bold text-gray-900">15K+</p><p className="text-sm text-gray-500">Happy Customers</p></div>
              <div><p className="text-2xl font-bold text-gray-900">4.9</p><p className="text-sm text-gray-500">Rating</p></div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-rose-200 to-fuchsia-300 flex items-center justify-center overflow-hidden shadow-2xl">
              <div className="text-center p-8">
                <div className="text-8xl mb-4">👗</div>
                <h3 className="text-2xl font-bold text-rose-900">Spring Collection</h3>
                <p className="text-rose-700">Up to 40% Off</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Truck className="w-5 h-5 text-green-600" /></div>
              <div><p className="font-semibold text-sm">Free Shipping</p><p className="text-xs text-gray-500">On orders $100+</p></div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center"><Percent className="w-5 h-5 text-amber-600" /></div>
              <div><p className="font-semibold text-sm">REHAB20</p><p className="text-xs text-gray-500">20% Off Code</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesBar() {
  const features = [
    { icon: Truck, label: 'Free Shipping', desc: 'Orders $100+' },
    { icon: Shield, label: 'Secure Payment', desc: '100% Protected' },
    { icon: RotateCcw, label: 'Easy Returns', desc: '30-Day Policy' },
    { icon: HeartHandshake, label: '24/7 Support', desc: 'Always Here' },
  ]
  return (
    <div className="bg-white border-b"><div className="max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-50 to-fuchsia-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <f.icon className="w-5 h-5 text-rose-600" />
            </div>
            <div><p className="font-semibold text-sm text-gray-900">{f.label}</p><p className="text-xs text-gray-500">{f.desc}</p></div>
          </div>
        ))}
      </div>
    </div></div>
  )
}

function CategoryBar({ categories, selected, onSelect }: { categories: Category[]; selected: string; onSelect: (s: string) => void }) {
  return (
    <div className="bg-white border-b"><div className="max-w-7xl mx-auto px-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 py-3">
          <Button variant={selected === 'all' ? 'default' : 'outline'} size="sm" onClick={() => onSelect('all')}
            className={selected === 'all' ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white' : 'border-gray-200'}>✨ All</Button>
          {categories.map((cat) => (
            <Button key={cat.id} variant={selected === cat.slug ? 'default' : 'outline'} size="sm" onClick={() => onSelect(cat.slug)}
              className={selected === cat.slug ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white' : 'border-gray-200'}>
              {CATEGORY_ICONS[cat.slug] || '📦'} {cat.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div></div>
  )
}

// ═══════════════ PRODUCT CARD ═══════════════
function ProductCard({ product }: { product: Product }) {
  const { setView, setSelectedProduct, addToCart, addToWishlist, removeFromWishlist, isInWishlist, locale } = useStore()
  const [imgError, setImgError] = useState(false)
  const discount = calculateDiscount(product.price, product.comparePrice)
  const wishlisted = isInWishlist(product.id)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    const sizes = product.sizes.split(',')
    const colors = product.colors.split(',')
    addToCart({ productId: product.id, name: product.name, subtitle: product.subtitle, price: product.price, comparePrice: product.comparePrice || undefined, image: product.images, quantity: 1, size: sizes[0] || 'M', color: colors[0] || 'Default' })
    toast.success(`${product.name} added to cart!`)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (wishlisted) { removeFromWishlist(product.id); toast.info('Removed from wishlist') }
    else { addToWishlist({ productId: product.id, name: product.name, price: product.price, image: product.images }); toast.success('Added to wishlist!') }
  }

  return (
    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-gray-100 overflow-hidden" onClick={() => { setSelectedProduct(product.id); setView('product') }}>
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-fuchsia-100"><ImageIcon className="w-12 h-12 text-rose-300" /></div>
        ) : (
          <img src={product.images} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} loading="lazy" />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && <Badge className="bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white text-xs">-{discount}%</Badge>}
          {product.isNew && <Badge className="bg-emerald-500 text-white text-xs">New</Badge>}
          {product.featured && <Badge className="bg-amber-500 text-white text-xs">Featured</Badge>}
        </div>
        <Button size="sm" variant="ghost" className={`absolute top-2 right-2 h-8 w-8 p-0 rounded-full ${wishlisted ? 'bg-rose-50 text-rose-600' : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'} transition-all shadow-sm`}
          onClick={handleWishlist}>
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500' : ''}`} />
        </Button>
        <Button size="sm" className="absolute bottom-2 right-2 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg" onClick={handleQuickAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">{product.category}</p>
          {product.subtitle && <span className="text-[10px] text-gray-400">· {product.subtitle}</span>}
        </div>
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.description}</p>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
          {product.comparePrice && <span className="text-sm text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════ PRODUCT GRID ═══════════════
function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, sortBy, setSortBy } = useStore()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedCategory !== 'all') params.set('category', selectedCategory)
        if (searchQuery) params.set('search', searchQuery)
        const res = await fetch(`/api/products?${params}`)
        const data = await res.json()
        setProducts(data.products || [])
        if (data.categories) setCategories(data.categories)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    fetchData()
  }, [selectedCategory, searchQuery])

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return a.price - b.price
      case 'price_desc': return b.price - a.price
      case 'rating': return b.rating - a.rating
      default: return 0
    }
  })

  return (
    <div>
      <CategoryBar categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search for dresses, tops, shoes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11" />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-11"><Filter className="w-4 h-4 mr-2 text-gray-400" /><SelectValue /></SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${products.length} products found`}</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden"><div className="aspect-[3/4] bg-gray-100 animate-pulse" /><CardContent className="p-3 space-y-2"><div className="h-3 bg-gray-100 rounded animate-pulse" /><div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" /><div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" /></CardContent></Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20"><div className="text-6xl mb-4">🔍</div><h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3><p className="text-gray-500">Try adjusting your search or filter</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════ PRODUCT DETAIL ═══════════════
function ProductDetail() {
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
            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.comparePrice && <><span className="text-xl text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span><Badge className="bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white">{discount}% OFF</Badge></>}
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

// ═══════════════ CART VIEW ═══════════════
function CartView() {
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
            {savings > 0 && <p className="text-sm text-green-600 font-medium">💚 You save ${savings.toFixed(2)}!</p>}
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

// ═══════════════ CHECKOUT VIEW ═══════════════
function CheckoutView() {
  const { cart, clearCart, setView, userId, isLoggedIn, setUser, currencySymbol } = useStore()
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
        const res = await fetch(`/api/auth?email=${encodeURIComponent(loginForm.email)}&password=${encodeURIComponent(loginForm.password)}`)
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

// ═══════════════ ORDERS VIEW ═══════════════
function OrdersView() {
  const { userId, setView } = useStore()
  const [orders, setOrders] = useState<OrderType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try { const res = await fetch(`/api/orders?userId=${userId || 'guest'}`); const data = await res.json(); setOrders(Array.isArray(data) ? data : []) } catch (e) { console.error(e) }
      setLoading(false)
    }
    fetchOrders()
  }, [userId])

  const statusIcons: Record<string, any> = { pending: Clock, processing: Package, shipped: Truck, delivered: CheckCircle, cancelled: AlertCircle }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
      {loading ? <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-6"><div className="animate-pulse space-y-3"><div className="h-4 bg-gray-100 rounded w-1/3" /><div className="h-3 bg-gray-100 rounded w-2/3" /></div></CardContent></Card>)}</div>
      : orders.length === 0 ? <div className="text-center py-20"><div className="text-7xl mb-6">📦</div><h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3><p className="text-gray-500 mb-6">Start shopping to see your orders here</p><Button onClick={() => setView('home')} className="bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white"><ShoppingBag className="w-4 h-4 mr-2" /> Shop Now</Button></div>
      : <div className="space-y-4">{orders.map((order) => { const StatusIcon = statusIcons[order.status] || Clock; return (
        <Card key={order.id}><CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div><p className="font-bold text-lg">#{order.orderNumber}</p><p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p></div>
            <Badge className={getStatusColor(order.status)}><StatusIcon className="w-3 h-3 mr-1" />{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Badge>
          </div>
          <div className="space-y-2">{order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded overflow-hidden flex-shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</p></div>
              <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}</div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span>Payment: </span><span className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
              {order.whatsAppNotified && <span className="ml-3 text-green-600">📱 WhatsApp Sent</span>}
              {order.driveBackedUp && <span className="ml-3 text-blue-600">💾 Drive Backup</span>}
            </div>
            <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
          </div>
        </CardContent></Card>
      )})}</div>}
    </div>
  )
}

// ═══════════════ WISHLIST VIEW ═══════════════
function WishlistView() {
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

// ═══════════════ ADMIN DASHBOARD ═══════════════
function AdminDashboard() {
  const { setView } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<OrderType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('products')
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', comparePrice: '', material: '', images: '', category: 'dresses', sizes: 'XS,S,M,L,XL', colors: 'Black', inStock: true, featured: false, isNew: false, isSale: false, stockQuantity: '100', subtitle: '' })

  const fetchProducts = useCallback(async () => { try { const res = await fetch('/api/products'); const data = await res.json(); setProducts(data.products || []); setCategories(data.categories || []) } catch (e) { console.error(e) } }, [])
  const fetchOrders = useCallback(async () => { try { const res = await fetch('/api/orders?all=true'); const data = await res.json(); setOrders(Array.isArray(data) ? data : []) } catch (e) { console.error(e) } }, [])

  useEffect(() => { async function load() { await fetchProducts(); await fetchOrders(); setLoading(false) } load() }, [fetchProducts, fetchOrders])

  useEffect(() => { fetch('/api/settings').then((r) => r.json()).then((data) => { if (data.whatsapp_admin_phone) setWhatsappPhone(data.whatsapp_admin_phone) }).catch(console.error) }, [])

  const handleEditProduct = useCallback((id: string) => {
    const product = products.find((p) => p.id === id)
    if (product) {
      setForm({ name: product.name, slug: product.slug, description: product.description, price: product.price.toString(), comparePrice: product.comparePrice?.toString() || '', material: product.material || '', images: product.images, category: product.category, sizes: product.sizes, colors: product.colors, inStock: product.inStock, featured: product.featured, isNew: product.isNew, isSale: product.isSale, stockQuantity: product.stockQuantity.toString(), subtitle: product.subtitle || '' })
      setTab('add-product')
    }
  }, [products])

  const handleSaveProduct = async () => {
    if (!form.name || !form.slug || !form.price) { toast.error('Please fill in required fields'); return }
    try {
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: parseFloat(form.price), comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null, stockQuantity: parseInt(form.stockQuantity) || 100 }) })
      if (res.ok) { toast.success('Product saved!'); setForm({ name: '', slug: '', description: '', price: '', comparePrice: '', material: '', images: '', category: 'dresses', sizes: 'XS,S,M,L,XL', colors: 'Black', inStock: true, featured: false, isNew: false, isSale: false, stockQuantity: '100', subtitle: '' }); setTab('products'); fetchProducts() }
      else toast.error('Failed to save product')
    } catch { toast.error('Error saving product') }
  }

  const handleDeleteProduct = async (id: string) => { if (!confirm('Delete this product?')) return; try { await fetch(`/api/products/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchProducts() } catch { toast.error('Failed to delete') } }
  const handleUpdateOrderStatus = async (id: string, status: string) => { try { await fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); toast.success('Status updated'); fetchOrders() } catch { toast.error('Failed to update') } }
  const handleSaveWhatsapp = async () => { try { await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ whatsapp_admin_phone: whatsappPhone }) }); toast.success('WhatsApp number saved') } catch { toast.error('Failed to save') } }
  const handleBackup = async () => { try { const res = await fetch('/api/backup', { method: 'GET' }); const data = await res.json(); toast.success(`Backup complete! ${data.count} entries`) } catch { toast.error('Backup failed') } }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending').length

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={handleBackup} variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Drive Backup</Button>
          <Button onClick={async () => { try { const res = await fetch('/api/seed', { method: 'POST' }); const data = await res.json(); toast.success(`Seeded! ${data.productsCreated} products`); fetchProducts() } catch { toast.error('Failed') } }} variant="outline" size="sm"><PlusCircle className="w-4 h-4 mr-2" /> Seed Data</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: products.length, icon: Tag, gradient: 'from-rose-500 to-fuchsia-600' },
          { label: 'Total Orders', value: orders.length, icon: Package, gradient: 'from-blue-500 to-indigo-600' },
          { label: 'Pending Orders', value: pendingOrders, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
          { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, gradient: 'from-emerald-500 to-green-600' },
        ].map((stat) => (
          <Card key={stat.label} className="overflow-hidden"><CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0`}><stat.icon className="w-5 h-5 text-white" /></div>
              <div><p className="text-sm text-gray-500">{stat.label}</p><p className="text-xl font-bold">{stat.value}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="add-product">Add Product</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          {loading ? <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}</div> : (
            <Card><CardContent className="p-0"><Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>{products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-50 rounded overflow-hidden flex-shrink-0"><img src={product.images} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /></div><div><p className="font-medium text-sm">{product.name}</p><p className="text-xs text-gray-500">{product.subtitle || product.slug}</p></div></div></TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{product.category}</Badge></TableCell>
                  <TableCell className="font-medium">${product.price.toFixed(2)}</TableCell>
                  <TableCell><span className="text-sm">{product.stockQuantity}</span></TableCell>
                  <TableCell><div className="flex gap-1">{product.featured && <Badge className="bg-amber-100 text-amber-700 text-[10px]">Featured</Badge>}{product.isNew && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">New</Badge>}{product.isSale && <Badge className="bg-rose-100 text-rose-700 text-[10px]">Sale</Badge>}</div></TableCell>
                  <TableCell><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => handleEditProduct(product.id)}><Edit className="w-3 h-3" /></Button><Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteProduct(product.id)}><Trash className="w-3 h-3" /></Button></div></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table></CardContent></Card>
          )}
        </TabsContent>
        <TabsContent value="add-product">
          <Card><CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg">Add New Product</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Product Name *</Label><Input placeholder="Silk Evening Gown" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} /></div>
              <div><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              <div><Label>Subtitle</Label><Input placeholder="Red Carpet Ready" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
              <div><Label>Material</Label><Input placeholder="100% Silk" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} /></div>
              <div><Label>Price *</Label><Input type="number" placeholder="99.99" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Compare Price</Label><Input type="number" placeholder="149.99" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>Image URL</Label><Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />{form.images && <div className="mt-2 w-32 h-32 bg-gray-50 rounded overflow-hidden"><img src={form.images} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>}</div>
              <div><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((cat) => <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Stock Quantity</Label><Input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} /></div>
              <div><Label>Sizes</Label><Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} /></div>
              <div><Label>Colors</Label><Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} /></div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2"><Switch checked={form.inStock} onCheckedChange={(v) => setForm({ ...form, inStock: v })} /><Label>In Stock</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label>Featured</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.isNew} onCheckedChange={(v) => setForm({ ...form, isNew: v })} /><Label>New</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.isSale} onCheckedChange={(v) => setForm({ ...form, isSale: v })} /><Label>Sale</Label></div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setForm({ name: '', slug: '', description: '', price: '', comparePrice: '', material: '', images: '', category: 'dresses', sizes: 'XS,S,M,L,XL', colors: 'Black', inStock: true, featured: false, isNew: false, isSale: false, stockQuantity: '100', subtitle: '' }); setTab('products') }}>Cancel</Button>
              <Button className="bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white" onClick={handleSaveProduct}><PlusCircle className="w-4 h-4 mr-2" />Create Product</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="orders">
          {loading ? <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}</div>
          : orders.length === 0 ? <div className="text-center py-12 text-gray-500">No orders yet</div>
          : <Card><CardContent className="p-0"><Table>
            <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>WhatsApp</TableHead><TableHead>Drive</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell><p className="font-medium text-sm">#{order.orderNumber}</p><p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p></TableCell>
                <TableCell><p className="text-sm">{order.shippingName}</p><p className="text-xs text-gray-500">{order.shippingCity}</p></TableCell>
                <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                <TableCell><Select value={order.status} onValueChange={(v) => handleUpdateOrderStatus(order.id, v)}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></TableCell>
                <TableCell>{order.whatsAppNotified ? <Badge className="bg-green-100 text-green-700 text-xs"><MessageCircle className="w-3 h-3 mr-1" />Sent</Badge> : <Badge variant="outline" className="text-xs">Pending</Badge>}</TableCell>
                <TableCell>{order.driveBackedUp ? <Badge className="bg-blue-100 text-blue-700 text-xs">✓</Badge> : <Badge variant="outline" className="text-xs">—</Badge>}</TableCell>
                <TableCell><Button variant="ghost" size="sm" onClick={() => { window.open(getWhatsAppUrl(order.shippingPhone, `Order #${order.orderNumber} update: Status is now ${order.status}`), '_blank') }}><Phone className="w-3 h-3" /></Button></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></CardContent></Card>}
        </TabsContent>
        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card><CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-600" /> WhatsApp Notifications</h3>
              <p className="text-sm text-gray-500">Set the admin phone number to receive WhatsApp notifications when a customer places an order.</p>
              <div className="flex gap-3"><Input placeholder="+1234567890" value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} className="max-w-xs" /><Button onClick={handleSaveWhatsapp} className="bg-green-600 hover:bg-green-700 text-white">Save Number</Button></div>
            </CardContent></Card>
            <Card><CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><Download className="w-5 h-5 text-blue-600" /> Google Drive Backup</h3>
              <p className="text-sm text-gray-500">All orders are automatically backed up when placed. Click below to create a full backup.</p>
              <Button onClick={handleBackup} variant="outline"><Download className="w-4 h-4 mr-2" /> Backup All Orders</Button>
            </CardContent></Card>
            <Card><CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-purple-600" /> Regions & Currency</h3>
              <p className="text-sm text-gray-500">Supported regions: United States (USD), Europe (EUR), Middle East (SAR). Currency and tax rates are auto-applied based on customer location.</p>
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════ FOOTER ═══════════════
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-fuchsia-600 rounded-lg flex items-center justify-center"><Store className="w-4 h-4 text-white" /></div><span className="font-bold text-white">Rehab Shop</span></div>
            <p className="text-sm text-gray-400">Your destination for the latest women&apos;s fashion. Quality clothing, great prices, fast delivery.</p>
          </div>
          <div><h4 className="font-semibold text-white mb-3">Shop</h4><ul className="space-y-2 text-sm"><li>Dresses</li><li>Tops</li><li>Bottoms</li><li>Activewear</li></ul></div>
          <div><h4 className="font-semibold text-white mb-3">Support</h4><ul className="space-y-2 text-sm"><li>Contact Us</li><li>Shipping Info</li><li>Returns</li><li>FAQ</li></ul></div>
          <div><h4 className="font-semibold text-white mb-3">Contact</h4><ul className="space-y-2 text-sm"><li className="flex items-center gap-2"><Phone className="w-3 h-3" /> +1 (555) 123-4567</li><li className="flex items-center gap-2"><MessageCircle className="w-3 h-3" /> WhatsApp</li><li className="flex items-center gap-2"><MapPin className="w-3 h-3" /> New York, NY</li></ul></div>
        </div>
        <Separator className="my-6 bg-gray-700" />
        <p className="text-center text-sm text-gray-500">&copy; 2025 Rehab Shop. All rights reserved.</p>
      </div>
    </footer>
  )
}

// ═══════════════ MAIN APP ═══════════════
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
