import { NextRequest, NextResponse } from 'next/server';
import { gasFetch } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');

  const [products, categories] = await Promise.all([
    gasFetch<{ products: any[] }>({
      action: 'getPublicProducts',
      lang: 'en',
      ...(category && category !== 'all' ? { category } : {}),
      ...(search ? { search } : {}),
      ...(featured === 'true' ? { featured: true } : {}),
    }),
    gasFetch<{ categories: any[] }>({ action: 'getPublicCategories', lang: 'en' }),
  ]);

  if (!products.ok) return NextResponse.json({ error: products.error }, { status: 500 });
  if (!categories.ok) return NextResponse.json({ error: categories.error }, { status: 500 });

  return NextResponse.json({ products: products.products || [], categories: categories.categories || [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await gasFetch<{ product: any }>({ action: 'adminUpsertProduct', ...body });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.product || result);
}
