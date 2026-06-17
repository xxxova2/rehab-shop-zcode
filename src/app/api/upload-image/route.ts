import { NextRequest, NextResponse } from 'next/server';
import { gasFetch } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: 'File too large (max 8MB)' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const result = await gasFetch<{ url: string; file_id: string }>({
      action: 'uploadProductImage',
      image_base64: base64,
      mime_type: file.type || 'image/jpeg',
      filename: file.name || ('product-' + Date.now() + '.jpg'),
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, url: (result as any).url, file_id: (result as any).file_id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Upload failed: ' + (e?.message || 'unknown') }, { status: 500 });
  }
}
