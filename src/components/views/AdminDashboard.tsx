'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { Product, Category, OrderType } from '@/lib/types'
import { ORDER_STATUSES, getWhatsAppUrl } from '@/lib/medusa'
import { formatDate } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tag, Package, Clock, DollarSign, PlusCircle, Edit, Trash, Download, MessageCircle, Phone, Globe } from 'lucide-react'
import { toast } from 'sonner'

export function AdminDashboard() {
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
