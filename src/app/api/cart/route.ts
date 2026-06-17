import { NextRequest, NextResponse } from 'next/server';
import { gasFetch } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  const result = await gasFetch<{ items: any[] }>({ action: 'listCartItems', userId });
  if (!result.ok) return NextResponse.json([]);
  return NextResponse.json(result.items || []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await gasFetch({ action: 'upsertCartItem', ...body });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');
  const result = await gasFetch({ action: 'deleteCartItem', id, userId });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ success: true });
}
