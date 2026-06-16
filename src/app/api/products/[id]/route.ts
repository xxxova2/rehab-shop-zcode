import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = parseFloat(body.price)
    if (body.comparePrice !== undefined) updateData.comparePrice = body.comparePrice ? parseFloat(body.comparePrice) : null
    if (body.images !== undefined) updateData.images = body.images
    if (body.category !== undefined) updateData.category = body.category
    if (body.sizes !== undefined) updateData.sizes = body.sizes
    if (body.colors !== undefined) updateData.colors = body.colors
    if (body.inStock !== undefined) updateData.inStock = body.inStock
    if (body.featured !== undefined) updateData.featured = body.featured

    const product = await db.product.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
