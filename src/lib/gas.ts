// Server-side Google Apps Script proxy client for the Rehab Shop backend.
//
// The Next.js API routes are the public surface; they call `gasFetch()` here,
// which forwards JSON to GAS_URL and parses the response. We never expose
// GAS_URL or ADMIN_KEY to the browser.

export type GasOk<T> = { ok: true } & T;
export type GasErr = { ok: false; error: string; status?: number };
export type GasResponse<T = unknown> = GasOk<T> | GasErr;

const GAS_URL = process.env.GAS_URL || process.env.NEXT_PUBLIC_GAS_URL || '';
const ADMIN_KEY = process.env.ADMIN_KEY || '';

function ensureConfig() {
  if (!GAS_URL) {
    const e = new Error('GAS_URL not configured');
    (e as any).code = 'NO_GAS_URL';
    throw e;
  }
}

/** Add the server-side ADMIN_KEY to the body if the action is admin-only. */
function maybeInjectAdminKey(body: Record<string, unknown>): Record<string, unknown> {
  const action = String(body.action || '');
  const isAdmin = action.startsWith('admin') || action === 'uploadProductImage' || action === 'seedSampleData';
  if (isAdmin && !body.admin_key) {
    return { ...body, admin_key: ADMIN_KEY };
  }
  return body;
}

export async function gasFetch<T = unknown>(body: Record<string, unknown>): Promise<GasResponse<T>> {
  ensureConfig();
  const payload = maybeInjectAdminKey(body);
  let upstream: Response;
  try {
    upstream = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      redirect: 'follow',
    });
  } catch (err: any) {
    return { ok: false, error: 'Upstream fetch failed: ' + (err?.message || 'unknown') };
  }
  const text = await upstream.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Bad upstream response', status: upstream.status };
  }
  return json as GasResponse<T>;
}

/** Convenience for the client (browser) to call our own /api/gas proxy. */
export async function clientGasFetch<T = unknown>(body: Record<string, unknown>): Promise<GasResponse<T>> {
  const r = await fetch('/api/gas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

/**
 * Upload an image file to Google Drive via GAS and return the public URL.
 * Used by the admin product form to attach a picture without manually pasting a URL.
 */
export async function uploadProductImage(file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const result = await gasFetch<{ url: string; file_id: string }>({
    action: 'uploadProductImage',
    image_base64: base64,
    mime_type: file.type || 'image/jpeg',
    filename: file.name || 'product.jpg',
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, url: (result as any).url };
}
