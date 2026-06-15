import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const CATEGORIES = [
  { name: 'Dresses', slug: 'dresses', description: 'Elegant dresses for every occasion', icon: '👗' },
  { name: 'Tops', slug: 'tops', description: 'Stylish tops and blouses', icon: '👚' },
  { name: 'Bottoms', slug: 'bottoms', description: 'Pants, skirts, and shorts', icon: '👖' },
  { name: 'Activewear', slug: 'activewear', description: 'Workout and sportswear', icon: '🏃' },
  { name: 'Outerwear', slug: 'outerwear', description: 'Coats, jackets, and layers', icon: '🧥' },
  { name: 'Shoes', slug: 'shoes', description: 'Heels, sneakers, and boots', icon: '👠' },
  { name: 'Accessories', slug: 'accessories', description: 'Bags, jewelry, and more', icon: '👜' },
  { name: 'Lingerie', slug: 'lingerie', description: 'Intimates and sleepwear', icon: '🩱' },
]

const COLLECTIONS = [
  { title: 'Summer Essentials', slug: 'summer-essentials', description: 'Must-haves for the summer season', isActive: true },
  { title: 'Office Ready', slug: 'office-ready', description: 'Professional looks for the workplace', isActive: true },
  { title: 'Date Night', slug: 'date-night', description: 'Stunning outfits for special evenings', isActive: true },
]

const PRODUCTS = [
  {
    name: 'Silk Evening Gown', slug: 'silk-evening-gown', subtitle: 'Red Carpet Ready',
    description: 'Elegant floor-length silk evening gown with a flattering A-line silhouette. Features delicate ruching at the waist and a subtle train. Perfect for formal events and galas. Made from 100% mulberry silk with a satin finish that catches the light beautifully.',
    material: '100% Mulberry Silk', price: 189.99, comparePrice: 249.99, costPrice: 75,
    images: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600',
    category: 'dresses', sizes: 'XS,S,M,L,XL', colors: 'Black,Navy,Burgundy',
    inStock: true, stockQuantity: 45, featured: true, isNew: true, isSale: true, rating: 4.8, reviewCount: 124,
    tags: '["formal","silk","evening","gown"]',
  },
  {
    name: 'Floral Midi Dress', slug: 'floral-midi-dress', subtitle: 'Spring Romance',
    description: 'Beautiful floral print midi dress with a wrap-around design. The lightweight chiffon fabric drapes elegantly and features a V-neckline with flutter sleeves. Ideal for spring and summer occasions.',
    material: 'Chiffon Blend', price: 79.99, comparePrice: 99.99, costPrice: 28,
    images: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
    category: 'dresses', sizes: 'XS,S,M,L', colors: 'Blue Floral,Pink Floral',
    inStock: true, stockQuantity: 80, featured: true, isNew: false, isSale: true, rating: 4.6, reviewCount: 89,
    tags: '["casual","floral","midi","spring"]',
  },
  {
    name: 'Cashmere Wrap Blouse', slug: 'cashmere-wrap-blouse', subtitle: 'Luxury Knit',
    description: 'Luxuriously soft cashmere wrap blouse with a flattering tie-front design. The lightweight knit provides warmth without bulk, making it perfect for layering or wearing alone on cool evenings.',
    material: '100% Cashmere', price: 129.99, comparePrice: null, costPrice: 55,
    images: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600',
    category: 'tops', sizes: 'S,M,L,XL', colors: 'Cream,Rose,Sage',
    inStock: true, stockQuantity: 35, featured: true, isNew: true, isSale: false, rating: 4.7, reviewCount: 67,
    tags: '["cashmere","luxury","wrap","blouse"]',
  },
  {
    name: 'Off-Shoulder Crop Top', slug: 'off-shoulder-crop-top', subtitle: 'Summer Vibes',
    description: 'Trendy off-shoulder crop top with elastic neckline for comfort. Made from a breathable cotton blend with ribbed texture. Pairs perfectly with high-waisted bottoms for a chic casual look.',
    material: 'Cotton Blend', price: 34.99, comparePrice: 44.99, costPrice: 12,
    images: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600',
    category: 'tops', sizes: 'XS,S,M,L', colors: 'White,Black,Coral',
    inStock: true, stockQuantity: 120, featured: false, isNew: false, isSale: true, rating: 4.3, reviewCount: 203,
    tags: '["casual","crop","summer","cotton"]',
  },
  {
    name: 'High-Waist Wide Leg Pants', slug: 'high-waist-wide-leg-pants', subtitle: 'Sophisticated Silhouette',
    description: 'Sophisticated high-waist wide leg pants with a flowing silhouette. Crafted from premium crepe fabric with a subtle texture. Features side pockets and a concealed zipper for a sleek finish.',
    material: 'Premium Crepe', price: 89.99, comparePrice: 119.99, costPrice: 32,
    images: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
    category: 'bottoms', sizes: 'XS,S,M,L,XL', colors: 'Black,Beige,Olive',
    inStock: true, stockQuantity: 60, featured: true, isNew: false, isSale: true, rating: 4.5, reviewCount: 156,
    tags: '["wide-leg","high-waist","formal","crepe"]',
  },
  {
    name: 'Leather-Look Leggings', slug: 'leather-look-leggings', subtitle: 'Edgy Elegance',
    description: 'Sleek leather-look leggings with a comfortable stretch fit. The high-rise waistband provides support and a smooth silhouette. Versatile enough for day-to-night styling.',
    material: 'Vegan Leather / Spandex', price: 64.99, comparePrice: null, costPrice: 22,
    images: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',
    category: 'bottoms', sizes: 'XS,S,M,L', colors: 'Black,Chocolate',
    inStock: true, stockQuantity: 90, featured: false, isNew: false, isSale: false, rating: 4.4, reviewCount: 178,
    tags: '["leggings","leather","edgy","stretch"]',
  },
  {
    name: 'Performance Yoga Set', slug: 'performance-yoga-set', subtitle: 'Workout Essential',
    description: 'Complete yoga set including a supportive sports bra and matching high-waist leggings. Made from moisture-wicking, four-way stretch fabric with flatlock seams for comfort during intense workouts.',
    material: 'Nylon / Spandex Moisture-Wicking', price: 74.99, comparePrice: 94.99, costPrice: 28,
    images: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
    category: 'activewear', sizes: 'XS,S,M,L,XL', colors: 'Black,Plum,Teal',
    inStock: true, stockQuantity: 70, featured: true, isNew: true, isSale: true, rating: 4.9, reviewCount: 312,
    tags: '["yoga","activewear","set","moisture-wicking"]',
  },
  {
    name: 'Running Tank & Shorts Combo', slug: 'running-tank-shorts-combo', subtitle: 'Hit the Track',
    description: 'Lightweight running tank top with built-in bra paired with breathable running shorts. Features reflective details for visibility and a secure zip pocket for essentials.',
    material: 'Performance Polyester', price: 54.99, comparePrice: null, costPrice: 20,
    images: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=600',
    category: 'activewear', sizes: 'S,M,L,XL', colors: 'Coral,Navy,Charcoal',
    inStock: true, stockQuantity: 55, featured: false, isNew: false, isSale: false, rating: 4.2, reviewCount: 87,
    tags: '["running","tank","shorts","reflective"]',
  },
  {
    name: 'Wool Blend Trench Coat', slug: 'wool-blend-trench-coat', subtitle: 'Timeless Classic',
    description: 'Classic wool blend trench coat with a modern oversized fit. Features double-breasted buttons, a belt tie, and deep side pockets. The water-resistant finish makes it ideal for transitional weather.',
    material: 'Wool Blend / Water-Resistant', price: 199.99, comparePrice: 279.99, costPrice: 85,
    images: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600',
    category: 'outerwear', sizes: 'S,M,L,XL', colors: 'Camel,Black,Grey',
    inStock: true, stockQuantity: 25, featured: true, isNew: false, isSale: true, rating: 4.7, reviewCount: 94,
    tags: '["trench","wool","coat","water-resistant"]',
  },
  {
    name: 'Puffer Jacket', slug: 'puffer-jacket', subtitle: 'Cozy & Warm',
    description: 'Warm and lightweight puffer jacket with a cropped silhouette. Features a high collar, zip-front closure, and elasticized cuffs. Filled with sustainable recycled down alternative insulation.',
    material: 'Recycled Down Alternative', price: 149.99, comparePrice: null, costPrice: 58,
    images: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600',
    category: 'outerwear', sizes: 'XS,S,M,L', colors: 'White,Black,Sage',
    inStock: true, stockQuantity: 40, featured: false, isNew: true, isSale: false, rating: 4.5, reviewCount: 62,
    tags: '["puffer","jacket","sustainable","cropped"]',
  },
  {
    name: 'Classic Stiletto Pumps', slug: 'classic-stiletto-pumps', subtitle: 'Wardrobe Essential',
    description: 'Timeless stiletto pumps with a 3.5-inch heel and pointed toe. Crafted from genuine leather with a cushioned insole for all-day comfort. A wardrobe essential that elevates any outfit.',
    material: 'Genuine Leather', price: 109.99, comparePrice: 139.99, costPrice: 42,
    images: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600',
    category: 'shoes', sizes: '36,37,38,39,40,41', colors: 'Black,Nude,Red',
    inStock: true, stockQuantity: 50, featured: true, isNew: false, isSale: true, rating: 4.6, reviewCount: 201,
    tags: '["stiletto","pumps","leather","classic"]',
  },
  {
    name: 'Platform Sneakers', slug: 'platform-sneakers', subtitle: 'Street Style',
    description: 'Chunky platform sneakers combining style and comfort. Features a padded collar, breathable mesh upper, and a lightweight EVA sole. Perfect for everyday wear with an elevated street-style look.',
    material: 'Mesh / EVA Sole', price: 79.99, comparePrice: null, costPrice: 30,
    images: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
    category: 'shoes', sizes: '36,37,38,39,40', colors: 'White,Pink,Black',
    inStock: true, stockQuantity: 65, featured: false, isNew: true, isSale: false, rating: 4.3, reviewCount: 143,
    tags: '["sneakers","platform","street","casual"]',
  },
  {
    name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag', subtitle: 'Everyday Luxury',
    description: 'Elegant crossbody bag crafted from full-grain leather with gold-tone hardware. Features an adjustable strap, multiple compartments, and a secure magnetic closure. Compact yet spacious enough for daily essentials.',
    material: 'Full-Grain Leather / Gold Hardware', price: 159.99, comparePrice: 199.99, costPrice: 60,
    images: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    category: 'accessories', sizes: 'One Size', colors: 'Tan,Black,Burgundy',
    inStock: true, stockQuantity: 30, featured: true, isNew: false, isSale: true, rating: 4.8, reviewCount: 178,
    tags: '["crossbody","leather","bag","gold"]',
  },
  {
    name: 'Gold Layer Necklace Set', slug: 'gold-layer-necklace-set', subtitle: 'Stacked Elegance',
    description: 'Stunning set of three layered necklaces in 14k gold-plated stainless steel. Features delicate chains with varying pendant designs. Tarnish-resistant and hypoallergenic for sensitive skin.',
    material: '14K Gold-Plated Stainless Steel', price: 39.99, comparePrice: 54.99, costPrice: 10,
    images: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
    category: 'accessories', sizes: 'One Size', colors: 'Gold,Silver,Rose Gold',
    inStock: true, stockQuantity: 150, featured: false, isNew: false, isSale: true, rating: 4.4, reviewCount: 256,
    tags: '["necklace","gold","layered","hypoallergenic"]',
  },
  {
    name: 'Lace Bralette Set', slug: 'lace-bralette-set', subtitle: 'Delicate Comfort',
    description: 'Delicate lace bralette with matching bikini briefs. Features adjustable straps, a hook-and-eye back closure, and a beautiful floral lace pattern. Soft and comfortable for everyday wear.',
    material: 'Floral Lace / Cotton Lining', price: 44.99, comparePrice: null, costPrice: 15,
    images: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=600',
    category: 'lingerie', sizes: 'XS,S,M,L', colors: 'Black,Blush,Ivory',
    inStock: true, stockQuantity: 85, featured: false, isNew: false, isSale: false, rating: 4.5, reviewCount: 134,
    tags: '["bralette","lace","set","comfortable"]',
  },
  {
    name: 'Silk Pajama Set', slug: 'silk-pajama-set', subtitle: 'Bedtime Luxury',
    description: 'Luxurious silk pajama set with a relaxed fit button-front top and matching straight-leg pants. The temperature-regulating mulberry silk keeps you comfortable year-round. Makes a perfect gift.',
    material: '100% Mulberry Silk', price: 119.99, comparePrice: 159.99, costPrice: 45,
    images: 'https://images.unsplash.com/photo-1611937663641-5cef5189fc29?w=600',
    category: 'lingerie', sizes: 'S,M,L,XL', colors: 'Champagne,Dusty Rose,Black',
    inStock: true, stockQuantity: 40, featured: true, isNew: true, isSale: true, rating: 4.9, reviewCount: 267,
    tags: '["pajama","silk","sleepwear","gift"]',
  },
]

const REGIONS = [
  { name: 'United States', currency: 'USD', taxRate: 0.08, countries: '["US"]', isActive: true },
  { name: 'Europe', currency: 'EUR', taxRate: 0.20, countries: '["GB","FR","DE","IT","ES"]', isActive: true },
  { name: 'Middle East', currency: 'SAR', taxRate: 0.15, countries: '["SA","AE","KW","QA","BH","OM"]', isActive: true },
]

export async function POST(request: Request) {
  try {
    // Seed categories
    for (const cat of CATEGORIES) {
      await db.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description, icon: cat.icon, updatedAt: new Date() },
        create: cat,
      })
    }

    // Seed collections
    for (const col of COLLECTIONS) {
      await db.collection.upsert({
        where: { slug: col.slug },
        update: { title: col.title, description: col.description, isActive: col.isActive },
        create: col,
      })
    }

    // Seed regions
    for (const reg of REGIONS) {
      await db.region.upsert({
        where: { name: reg.name },
        update: { currency: reg.currency, taxRate: reg.taxRate, countries: reg.countries },
        create: reg,
      })
    }

    // Seed products
    let created = 0
    for (const prod of PRODUCTS) {
      const existing = await db.product.findUnique({ where: { slug: prod.slug } })
      if (!existing) {
        await db.product.create({ data: prod as any })
        created++
      }
    }

    // Seed admin user
    const adminExists = await db.user.findUnique({ where: { email: 'admin@rehabshop.com' } })
    if (!adminExists) {
      await db.user.create({
        data: { email: 'admin@rehabshop.com', name: 'Admin', password: 'admin123', role: 'admin', phone: '+15551234567' },
      })
    }

    // Seed demo customer
    const customerExists = await db.user.findUnique({ where: { email: 'demo@rehabshop.com' } })
    if (!customerExists) {
      await db.user.create({
        data: { email: 'demo@rehabshop.com', name: 'Demo User', password: 'demo123', phone: '+1234567890', role: 'customer' },
      })
    }

    // Seed settings
    const defaultSettings = [
      { key: 'whatsapp_admin_phone', value: '' },
      { key: 'whatsapp_api_token', value: '' },
      { key: 'whatsapp_instance_id', value: '' },
      { key: 'google_drive_credentials', value: '{}' },
      { key: 'store_name', value: 'Rehab Shop' },
      { key: 'store_currency', value: 'USD' },
      { key: 'store_locale', value: 'en' },
      { key: 'shipping_free_threshold', value: '100' },
      { key: 'shipping_flat_rate', value: '9.99' },
      { key: 'tax_rate', value: '0.08' },
    ]
    for (const setting of defaultSettings) {
      await db.settings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      })
    }

    return NextResponse.json({
      success: true,
      categories: CATEGORIES.length,
      collections: COLLECTIONS.length,
      regions: REGIONS.length,
      productsCreated: created,
      admin: 'admin@rehabshop.com / admin123',
      demo: 'demo@rehabshop.com / demo123',
    })
  } catch (error) {
    console.error('Error seeding:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
