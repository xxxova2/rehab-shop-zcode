import { NextRequest, NextResponse } from 'next/server';
import { gasFetch } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[upload-image] Request received');
  try {
    const form = await req.formData();
    const file = form.get('file');
    console.log('[upload-image] File:', file instanceof File ? `${file.name} (${file.size} bytes, ${file.type})` : 'none');
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: 'File too large (max 8MB)' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    console.log('[upload-image] Base64 length:', base64.length, 'MIME:', file.type);
    console.log('[upload-image] GAS_URL set:', !!process.env.GAS_URL, 'ADMIN_KEY set:', !!process.env.ADMIN_KEY);
    const result = await gasFetch<{ url: string; file_id: string }>({
      action: 'uploadProductImage',
      image_base64: base64,
      mime_type: file.type || 'image/jpeg',
      filename: file.name || ('product-' + Date.now() + '.jpg'),
    });
    console.log('[upload-image] GAS result:', JSON.stringify(result));
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, url: (result as any).url, file_id: (result as any).file_id });
  } catch (e: any) {
    console.log('[upload-image] Error:', e?.message);
    return NextResponse.json({ ok: false, error: 'Upload failed: ' + (e?.message || 'unknown') }, { status: 500 });
  }
}
