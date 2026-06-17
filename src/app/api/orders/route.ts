import { NextRequest, NextResponse } from 'next/server';
import { gasFetch } from '@/lib/gas';

export const dynamic = 'force-dynamic';

function generateOrderNumber() {
  const prefix = 'RB';
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const all = searchParams.get('all');
  const action = all === 'true' ? 'adminListOrders' : 'listOrdersForUser';
  const result = await gasFetch<{ orders: any[] }>({ action, ...(userId ? { userId } : {}) });
  if (!result.ok) return NextResponse.json([], { status: 200 });
  return NextResponse.json(result.orders || []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const orderNumber = generateOrderNumber();
  const result = await gasFetch<{ order: any }>({
    action: 'createOrder',
    orderNumber,
    ...body,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.order || result);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, status, paymentStatus } = body;
  const result = await gasFetch({ action: 'adminUpdateOrder', id, status, paymentStatus });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result);
}
