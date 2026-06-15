import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: { product: true },
    })

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, productId, quantity, size, color } = body

    const existing = await db.cartItem.findFirst({
      where: { userId, productId, size: size || '', color: color || '' },
    })

    if (existing) {
      const updated = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (quantity || 1) },
      })
      return NextResponse.json(updated)
    }

    const cartItem = await db.cartItem.create({
      data: {
        userId,
        productId,
        quantity: quantity || 1,
        size: size || '',
        color: color || '',
      },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (id) {
      await db.cartItem.delete({ where: { id } })
    } else if (userId) {
      await db.cartItem.deleteMany({ where: { userId } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}
