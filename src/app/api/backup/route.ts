import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Google Drive backup simulation - stores order data as JSON backup
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId } = body

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Create a backup record in settings (simulates Google Drive storage)
    const backupKey = `backup_order_${order.orderNumber}`
    const backupData = JSON.stringify({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        customer: {
          name: order.shippingName,
          phone: order.shippingPhone,
          address: order.shippingAddress,
          city: order.shippingCity,
        },
        items: order.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      },
      backupTimestamp: new Date().toISOString(),
      backupType: 'google_drive_simulated',
    })

    await db.settings.upsert({
      where: { key: backupKey },
      update: { value: backupData },
      create: { key: backupKey, value: backupData },
    })

    // Also backup all orders summary
    const allOrders = await db.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    const summaryData = JSON.stringify({
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, o) => sum + o.total, 0),
      lastBackup: new Date().toISOString(),
      orders: allOrders.map((o) => ({
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        items: o.items.length,
      })),
    })

    await db.settings.upsert({
      where: { key: 'backup_all_orders_summary' },
      update: { value: summaryData },
      create: { key: 'backup_all_orders_summary', value: summaryData },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Order backed up successfully',
      orderNumber: order.orderNumber,
      backupTimestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error backing up:', error)
    return NextResponse.json({ error: 'Failed to backup' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const backups = await db.settings.findMany({
      where: { key: { startsWith: 'backup_' } } },
    )

    // For SQLite, we'll use a simpler approach
    const allSettings = await db.settings.findMany()
    const backupEntries = allSettings.filter((s) => s.key.startsWith('backup_'))

    return NextResponse.json({
      backups: backupEntries.map((b) => ({
        key: b.key,
        timestamp: b.updatedAt,
      })),
      count: backupEntries.length,
    })
  } catch (error) {
    console.error('Error fetching backups:', error)
    return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 })
  }
}
