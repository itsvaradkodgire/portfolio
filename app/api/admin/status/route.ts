import { NextResponse } from 'next/server';

// Lightweight runtime diagnostics. Returns ONLY booleans / non-secret info so
// it's safe to hit while debugging a deployment. With ?selftest=1 it performs a
// real Vercel Blob write + read-back and reports the exact error if it fails,
// which is how we diagnose "saves don't persist".
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const runSelfTest = url.searchParams.get('selftest') === '1';

  const base = {
    nodeEnv: process.env.NODE_ENV ?? null,
    env: {
      ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
      JWT_SECRET: Boolean(process.env.JWT_SECRET),
      GOOGLE_AI_KEY: Boolean(process.env.GOOGLE_AI_KEY),
      BLOB_READ_WRITE_TOKEN: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      KV_REST_API_URL: Boolean(process.env.KV_REST_API_URL),
    },
    contentStore:
      process.env.NODE_ENV === 'production' && process.env.BLOB_READ_WRITE_TOKEN
        ? 'vercel-blob'
        : 'local-filesystem (edits will NOT persist on Vercel)',
    timestamp: new Date().toISOString(),
  };

  if (!runSelfTest) {
    return NextResponse.json(base);
  }

  // ── Blob write/read self-test ──────────────────────────────────────────────
  const selfTest: Record<string, unknown> = {};
  try {
    const { put, get } = await import('@vercel/blob');
    const key = 'content/_selftest.json';
    const payload = JSON.stringify({ ok: true, at: new Date().toISOString() });

    const putResult = await put(key, payload, {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
    selfTest.put = 'ok';
    selfTest.url = putResult.url;

    const readBack = await get(key, { access: 'private', useCache: false });
    if (readBack?.stream) {
      selfTest.readBack = JSON.parse(await new Response(readBack.stream as ReadableStream).text());
    } else {
      selfTest.readBack = 'no stream returned';
    }
    selfTest.result = 'WRITE OK';
  } catch (err) {
    selfTest.result = 'WRITE FAILED';
    selfTest.error = err instanceof Error ? err.message : String(err);
    selfTest.errorName = err instanceof Error ? err.name : undefined;
  }

  return NextResponse.json({ ...base, selfTest });
}
