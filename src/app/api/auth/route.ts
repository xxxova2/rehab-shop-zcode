import { NextRequest, NextResponse } from 'next/server';
import { gasFetch } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;
  const gasAction = action === 'login' ? 'adminLogin' : 'adminRegister';
  const result = await gasFetch(body.action === 'login'
    ? { action: 'adminLogin', email: body.email, password: body.password }
    : { action: 'adminRegister', email: body.email, name: body.name, password: body.password, phone: body.phone, role: body.role || 'customer' }
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}
