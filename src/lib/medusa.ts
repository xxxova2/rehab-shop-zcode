// Medusa-style utility functions

export function generateOrderNumber(): string {
  const prefix = 'RB'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calculateDiscount(price: number, comparePrice: number | null): number {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

export function buildOrderWhatsAppMessage(order: {
  orderNumber: string
  shippingName: string
  shippingPhone: string
  shippingCity: string
  items: Array<{ name: string; quantity: number; size: string; color: string; price: number }>
  total: number
  paymentMethod: string
}): string {
  const itemsList = order.items
    .map((i) => `- ${i.name} x${i.quantity} (${i.size}, ${i.color}) - $${(i.price * i.quantity).toFixed(2)}`)
    .join('\n')
  
  return `🛒 *New Order - Rehab Shop*\n\nOrder: #${order.orderNumber}\nCustomer: ${order.shippingName}\nPhone: ${order.shippingPhone}\nCity: ${order.shippingCity}\n\nItems:\n${itemsList}\n\nTotal: $${order.total.toFixed(2)}\nPayment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    unfulfilled: 'bg-gray-100 text-gray-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getPaymentStatusColor(status: string): string {
  return status === 'paid' ? 'text-green-600 font-medium' : 'text-amber-600'
}

export const CATEGORY_ICONS: Record<string, string> = {
  dresses: '👗',
  tops: '👚',
  bottoms: '👖',
  activewear: '🏃',
  outerwear: '🧥',
  shoes: '👠',
  accessories: '👜',
  lingerie: '🩱',
}

export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: 'package' },
  { value: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex', icon: 'card' },
  { value: 'bank', label: 'Bank Transfer', desc: 'Direct bank transfer', icon: 'shield' },
]

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]
