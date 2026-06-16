import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }
    if (search) {
      where.name = { contains: search }
    }
    if (featured === 'true') {
      where.featured = true
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ products, categories })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, subtitle, description, material, price, comparePrice, images, category, sizes, colors, inStock, featured, isNew, isSale, stockQuantity, tags } = body

    const product = await db.product.create({
      data: {
        name,
        slug,
        subtitle: subtitle || null,
        description,
        material: material || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images,
        category,
        sizes,
        colors,
        inStock: inStock !== undefined ? inStock : true,
        featured: featured !== undefined ? featured : false,
        isNew: isNew !== undefined ? isNew : false,
        isSale: isSale !== undefined ? isSale : false,
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 100,
        tags: tags || null,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
