import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

function generateOrderNumber() {
  const prefix = 'RB'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const all = searchParams.get('all')

    if (all === 'true') {
      const orders = await db.order.findMany({
        include: { items: true, user: true },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(orders)
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const orders = await db.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      items,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      whatsappNumber,
    } = body

    const orderNumber = generateOrderNumber()

    const order = await db.order.create({
      data: {
        userId,
        orderNumber,
        status: 'pending',
        total,
        subtotal,
        shipping: shipping || 0,
        tax: tax || 0,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size || '',
            color: item.color || '',
            image: item.image,
          })),
        },
      },
      include: { items: true },
    })

    // Update product stock / review counts
    for (const item of items) {
      try {
        await db.product.update({
          where: { id: item.productId },
          data: { reviewCount: { increment: item.quantity } },
        })
      } catch (e) {
        console.error('Failed to update product:', e)
      }
    }

    // Clear user's cart
    try {
      await db.cartItem.deleteMany({ where: { userId } })
    } catch (e) {
      console.error('Failed to clear cart:', e)
    }

    // Send WhatsApp notification
    try {
      const adminPhone = whatsappNumber || process.env.WHATSAPP_ADMIN_PHONE || ''
      if (adminPhone) {
        const message = `🛒 *New Order - Rehab Shop*\n\nOrder: #${orderNumber}\nCustomer: ${shippingName}\nPhone: ${shippingPhone}\nCity: ${shippingCity}\n\nItems:\n${items.map((i: any) => `- ${i.name} x${i.quantity} (${i.size}, ${i.color}) - $${(i.price * i.quantity).toFixed(2)}`).join('\n')}\n\nTotal: $${total.toFixed(2)}\nPayment: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`
        
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodeURIComponent(message)}`
        
        // Try to send via WhatsApp API if configured
        const whatsappApiToken = process.env.WHATSAPP_API_TOKEN
        if (whatsappApiToken) {
          await fetch(`https://api.ultramsg.com/instance${process.env.WHATSAPP_INSTANCE_ID || ''}/messages/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: whatsappApiToken,
              to: adminPhone,
              body: message,
            }),
          })
        }

        await db.order.update({
          where: { id: order.id },
          data: { whatsAppNotified: true },
        })
      }
    } catch (e) {
      console.error('WhatsApp notification failed:', e)
    }

    // Google Drive backup
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
    } catch (e) {
      console.error('Google Drive backup failed:', e)
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status, paymentStatus } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    const order = await db.order.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
