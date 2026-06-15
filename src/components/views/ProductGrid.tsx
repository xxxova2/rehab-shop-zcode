'use client'

import { useStore } from '@/lib/store'
import { CATEGORY_ICONS, calculateDiscount } from '@/lib/medusa'
import { Product, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Heart, Star, Plus, Search, Filter, ImageIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { SORT_OPTIONS } from '@/lib/medusa'
import { toast } from 'sonner'

// Category Bar
export function CategoryBar({ categories, selected, onSelect }: { categories: Category[]; selected: string; onSelect: (s: string) => void }) {
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

// Product Card
export function ProductCard({ product }: { product: Product }) {
  const { setView, setSelectedProduct, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
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

// Product Grid
export function ProductGrid() {
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
