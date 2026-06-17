import { NextRequest, NextResponse } from 'next/server';
import { gasFetch } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[upload-image] A: started');
  try {
    console.log('[upload-image] B: reading formData');
    const form = await req.formData();
    console.log('[upload-image] C: formData ok');
    const file = form.get('file');
    console.log('[upload-image] D: file is', file instanceof File ? `File ${file.name} ${file.size}b` : typeof file);
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: 'File too large (max 8MB)' }, { status: 400 });
    }
    console.log('[upload-image] E: reading arrayBuffer');
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    console.log('[upload-image] F: base64 length', base64.length);
    console.log('[upload-image] G: GAS_URL exists?', !!process.env.GAS_URL, 'ADMIN_KEY exists?', !!process.env.ADMIN_KEY, 'NEXT_PUBLIC_GAS_URL exists?', !!process.env.NEXT_PUBLIC_GAS_URL);
    console.log('[upload-image] H: calling gasFetch');
    const result = await gasFetch<{ url: string; file_id: string }>({
      action: 'uploadProductImage',
      image_base64: base64,
      mime_type: file.type || 'image/jpeg',
      filename: file.name || ('product-' + Date.now() + '.jpg'),
    });
    console.log('[upload-image] I: result', JSON.stringify(result));
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, url: (result as any).url, file_id: (result as any).file_id });
  } catch (e: any) {
    console.log('[upload-image] ERROR:', e?.message, e?.stack);
    return NextResponse.json({ ok: false, error: 'Upload failed: ' + (e?.message || 'unknown') }, { status: 500 });
  }
}
