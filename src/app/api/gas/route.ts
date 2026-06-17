import { NextRequest, NextResponse } from 'next/server';
import { gasFetch } from '@/lib/gas';

export const dynamic = 'force-dynamic';

// Browser-facing proxy. The client posts { action, ... } and we forward
// to GAS_URL, injecting ADMIN_KEY for admin actions.
export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }
  const result = await gasFetch(body);
  return NextResponse.json(result, { status: result.ok ? 200 : (result.status || 500) });
}
