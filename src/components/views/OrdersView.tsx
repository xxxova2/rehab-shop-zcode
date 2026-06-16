'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { OrderType } from '@/lib/types'
import { formatDate } from '@/lib/i18n'
import { getStatusColor, getPaymentStatusColor } from '@/lib/medusa'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, Package, Truck, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react'

export function OrdersView() {
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
