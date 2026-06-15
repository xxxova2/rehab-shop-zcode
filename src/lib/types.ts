// Shared types for Rehab Shop

export type Product = {
  id: string
  name: string
  slug: string
  subtitle?: string
  description: string
  material?: string
  price: number
  comparePrice: number | null
  images: string
  category: string
  sizes: string
  colors: string
  inStock: boolean
  stockQuantity: number
  featured: boolean
  isNew: boolean
  isSale: boolean
  rating: number
  reviewCount: number
  tags?: string
}

export type Category = {
  id: string
  name: string
  slug: string
  icon?: string | null
}

export type Collection = {
  id: string
  title: string
  slug: string
  description?: string | null
  isActive: boolean
}

export type OrderItemType = {
  id: string
  name: string
  price: number
  quantity: number
  size: string
  color: string
  image: string
}

export type OrderType = {
  id: string
  orderNumber: string
  status: string
  fulfillmentStatus: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  discount: number
  couponCode?: string | null
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  paymentMethod: string
  paymentStatus: string
  whatsAppNotified: boolean
  driveBackedUp: boolean
  createdAt: string
  items: OrderItemType[]
  user?: { name: string; email: string }
}
