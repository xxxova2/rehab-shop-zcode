import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const CATEGORIES = [
  { name: 'Dresses', slug: 'dresses', image: '👗' },
  { name: 'Tops', slug: 'tops', image: '👚' },
  { name: 'Bottoms', slug: 'bottoms', image: '👖' },
  { name: 'Activewear', slug: 'activewear', image: '🏃' },
  { name: 'Outerwear', slug: 'outerwear', image: '🧥' },
  { name: 'Shoes', slug: 'shoes', image: '👠' },
  { name: 'Accessories', slug: 'accessories', image: '👜' },
  { name: 'Lingerie', slug: 'lingerie', image: '🩱' },
]

const PRODUCTS = [
  {
    name: 'Silk Evening Gown',
    slug: 'silk-evening-gown',
    description: 'Elegant floor-length silk evening gown with a flattering A-line silhouette. Features delicate ruching at the waist and a subtle train. Perfect for formal events and galas. Made from 100% mulberry silk with a satin finish that catches the light beautifully.',
    price: 189.99,
    comparePrice: 249.99,
    images: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600',
    category: 'dresses',
    sizes: 'XS,S,M,L,XL',
    colors: 'Black,Navy,Burgundy',
    inStock: true,
    featured: true,
    rating: 4.8,
  },
  {
    name: 'Floral Midi Dress',
    slug: 'floral-midi-dress',
    description: 'Beautiful floral print midi dress with a wrap-around design. The lightweight chiffon fabric drapes elegantly and features a V-neckline with flutter sleeves. Ideal for spring and summer occasions.',
    price: 79.99,
    comparePrice: 99.99,
    images: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
    category: 'dresses',
    sizes: 'XS,S,M,L',
    colors: 'Blue Floral,Pink Floral',
    inStock: true,
    featured: true,
    rating: 4.6,
  },
  {
    name: 'Cashmere Wrap Blouse',
    slug: 'cashmere-wrap-blouse',
    description: 'Luxuriously soft cashmere wrap blouse with a flattering tie-front design. The lightweight knit provides warmth without bulk, making it perfect for layering or wearing alone on cool evenings.',
    price: 129.99,
    comparePrice: null,
    images: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600',
    category: 'tops',
    sizes: 'S,M,L,XL',
    colors: 'Cream,Rose,Sage',
    inStock: true,
    featured: true,
    rating: 4.7,
  },
  {
    name: 'Off-Shoulder Crop Top',
    slug: 'off-shoulder-crop-top',
    description: 'Trendy off-shoulder crop top with elastic neckline for comfort. Made from a breathable cotton blend with ribbed texture. Pairs perfectly with high-waisted bottoms for a chic casual look.',
    price: 34.99,
    comparePrice: 44.99,
    images: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600',
    category: 'tops',
    sizes: 'XS,S,M,L',
    colors: 'White,Black,Coral',
    inStock: true,
    featured: false,
    rating: 4.3,
  },
  {
    name: 'High-Waist Wide Leg Pants',
    slug: 'high-waist-wide-leg-pants',
    description: 'Sophisticated high-waist wide leg pants with a flowing silhouette. Crafted from premium crepe fabric with a subtle texture. Features side pockets and a concealed zipper for a sleek finish.',
    price: 89.99,
    comparePrice: 119.99,
    images: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
    category: 'bottoms',
    sizes: 'XS,S,M,L,XL',
    colors: 'Black,Beige,Olive',
    inStock: true,
    featured: true,
    rating: 4.5,
  },
  {
    name: 'Leather-Look Leggings',
    slug: 'leather-look-leggings',
    description: 'Sleek leather-look leggings with a comfortable stretch fit. The high-rise waistband provides support and a smooth silhouette. Versatile enough for day-to-night styling.',
    price: 64.99,
    comparePrice: null,
    images: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',
    category: 'bottoms',
    sizes: 'XS,S,M,L',
    colors: 'Black,Chocolate',
    inStock: true,
    featured: false,
    rating: 4.4,
  },
  {
    name: 'Performance Yoga Set',
    slug: 'performance-yoga-set',
    description: 'Complete yoga set including a supportive sports bra and matching high-waist leggings. Made from moisture-wicking, four-way stretch fabric with flatlock seams for comfort during intense workouts.',
    price: 74.99,
    comparePrice: 94.99,
    images: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
    category: 'activewear',
    sizes: 'XS,S,M,L,XL',
    colors: 'Black,Plum,Teal',
    inStock: true,
    featured: true,
    rating: 4.9,
  },
  {
    name: 'Running Tank & Shorts Combo',
    slug: 'running-tank-shorts-combo',
    description: 'Lightweight running tank top with built-in bra paired with breathable running shorts. Features reflective details for visibility and a secure zip pocket for essentials.',
    price: 54.99,
    comparePrice: null,
    images: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=600',
    category: 'activewear',
    sizes: 'S,M,L,XL',
    colors: 'Coral,Navy,Charcoal',
    inStock: true,
    featured: false,
    rating: 4.2,
  },
  {
    name: 'Wool Blend Trench Coat',
    slug: 'wool-blend-trench-coat',
    description: 'Classic wool blend trench coat with a modern oversized fit. Features double-breasted buttons, a belt tie, and deep side pockets. The water-resistant finish makes it ideal for transitional weather.',
    price: 199.99,
    comparePrice: 279.99,
    images: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600',
    category: 'outerwear',
    sizes: 'S,M,L,XL',
    colors: 'Camel,Black,Grey',
    inStock: true,
    featured: true,
    rating: 4.7,
  },
  {
    name: 'Puffer Jacket',
    slug: 'puffer-jacket',
    description: 'Warm and lightweight puffer jacket with a cropped silhouette. Features a high collar, zip-front closure, and elasticized cuffs. Filled with sustainable recycled down alternative insulation.',
    price: 149.99,
    comparePrice: null,
    images: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600',
    category: 'outerwear',
    sizes: 'XS,S,M,L',
    colors: 'White,Black,Sage',
    inStock: true,
    featured: false,
    rating: 4.5,
  },
  {
    name: 'Classic Stiletto Pumps',
    slug: 'classic-stiletto-pumps',
    description: 'Timeless stiletto pumps with a 3.5-inch heel and pointed toe. Crafted from genuine leather with a cushioned insole for all-day comfort. A wardrobe essential that elevates any outfit.',
    price: 109.99,
    comparePrice: 139.99,
    images: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600',
    category: 'shoes',
    sizes: '36,37,38,39,40,41',
    colors: 'Black,Nude,Red',
    inStock: true,
    featured: true,
    rating: 4.6,
  },
  {
    name: 'Platform Sneakers',
    slug: 'platform-sneakers',
    description: 'Chunky platform sneakers combining style and comfort. Features a padded collar, breathable mesh upper, and a lightweight EVA sole. Perfect for everyday wear with an elevated street-style look.',
    price: 79.99,
    comparePrice: null,
    images: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
    category: 'shoes',
    sizes: '36,37,38,39,40',
    colors: 'White,Pink,Black',
    inStock: true,
    featured: false,
    rating: 4.3,
  },
  {
    name: 'Leather Crossbody Bag',
    slug: 'leather-crossbody-bag',
    description: 'Elegant crossbody bag crafted from full-grain leather with gold-tone hardware. Features an adjustable strap, multiple compartments, and a secure magnetic closure. Compact yet spacious enough for daily essentials.',
    price: 159.99,
    comparePrice: 199.99,
    images: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    category: 'accessories',
    sizes: 'One Size',
    colors: 'Tan,Black,Burgundy',
    inStock: true,
    featured: true,
    rating: 4.8,
  },
  {
    name: 'Gold Layer Necklace Set',
    slug: 'gold-layer-necklace-set',
    description: 'Stunning set of three layered necklaces in 14k gold-plated stainless steel. Features delicate chains with varying pendant designs. Tarnish-resistant and hypoallergenic for sensitive skin.',
    price: 39.99,
    comparePrice: 54.99,
    images: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
    category: 'accessories',
    sizes: 'One Size',
    colors: 'Gold,Silver,Rose Gold',
    inStock: true,
    featured: false,
    rating: 4.4,
  },
  {
    name: 'Lace Bralette Set',
    slug: 'lace-bralette-set',
    description: 'Delicate lace bralette with matching bikini briefs. Features adjustable straps, a hook-and-eye back closure, and a beautiful floral lace pattern. Soft and comfortable for everyday wear.',
    price: 44.99,
    comparePrice: null,
    images: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=600',
    category: 'lingerie',
    sizes: 'XS,S,M,L',
    colors: 'Black,Blush,Ivory',
    inStock: true,
    featured: false,
    rating: 4.5,
  },
  {
    name: 'Silk Pajama Set',
    slug: 'silk-pajama-set',
    description: 'Luxurious silk pajama set with a relaxed fit button-front top and matching straight-leg pants. The temperature-regulating mulberry silk keeps you comfortable year-round. Makes a perfect gift.',
    price: 119.99,
    comparePrice: 159.99,
    images: 'https://images.unsplash.com/photo-1611937663641-5cef5189fc29?w=600',
    category: 'lingerie',
    sizes: 'S,M,L,XL',
    colors: 'Champagne,Dusty Rose,Black',
    inStock: true,
    featured: true,
    rating: 4.9,
  },
]

export async function POST(request: Request) {
  try {
    // Seed categories
    for (const cat of CATEGORIES) {
      await db.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, image: cat.image },
        create: { name: cat.name, slug: cat.slug, image: cat.image },
      })
    }

    // Seed products
    let created = 0
    for (const prod of PRODUCTS) {
      const existing = await db.product.findUnique({ where: { slug: prod.slug } })
      if (!existing) {
        await db.product.create({ data: prod })
        created++
      }
    }

    // Seed admin user
    const adminExists = await db.user.findUnique({ where: { email: 'admin@rehabshop.com' } })
    if (!adminExists) {
      await db.user.create({
        data: {
          email: 'admin@rehabshop.com',
          name: 'Admin',
          password: 'admin123',
          role: 'admin',
        },
      })
    }

    // Seed demo customer
    const customerExists = await db.user.findUnique({ where: { email: 'demo@rehabshop.com' } })
    if (!customerExists) {
      await db.user.create({
        data: {
          email: 'demo@rehabshop.com',
          name: 'Demo User',
          password: 'demo123',
          phone: '+1234567890',
          role: 'customer',
        },
      })
    }

    // Seed WhatsApp settings
    const whatsappSetting = await db.settings.findUnique({ where: { key: 'whatsapp_admin_phone' } })
    if (!whatsappSetting) {
      await db.settings.create({
        data: { key: 'whatsapp_admin_phone', value: '' },
      })
    }

    return NextResponse.json({ 
      success: true, 
      categories: CATEGORIES.length, 
      productsCreated: created,
      admin: 'admin@rehabshop.com / admin123',
      demo: 'demo@rehabshop.com / demo123',
    })
  } catch (error) {
    console.error('Error seeding:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
