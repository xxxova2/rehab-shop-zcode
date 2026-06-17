import { NextRequest, NextResponse } from 'next/server';
import { gasFetch } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await gasFetch({ action: 'adminBackupOrder', ...body });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ success: true, ...(typeof result === 'object' ? result : {}) });
}

export async function GET() {
  const result = await gasFetch<{ backups: any[] }>({ action: 'adminListBackups' });
  if (!result.ok) return NextResponse.json({ backups: [], count: 0 });
  return NextResponse.json({ backups: result.backups || [], count: (result.backups || []).length });
}
