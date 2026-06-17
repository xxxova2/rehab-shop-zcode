import { NextRequest, NextResponse } from 'next/server';
import { gasFetch } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await gasFetch<{ settings: Record<string, string> }>({ action: 'getPublicSettings' });
  if (!result.ok) return NextResponse.json({});
  return NextResponse.json(result.settings || {});
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await gasFetch({ action: 'adminSetSettings', settings: body });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ success: true });
}
