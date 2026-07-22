import { NextResponse } from 'next/server';

// Lightweight runtime diagnostics. Returns ONLY booleans (never secret values)
// so it's safe to hit publicly while debugging a deployment. Confirms whether
// the required environment variables actually reached the running deployment.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV ?? null,
    env: {
      ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
      JWT_SECRET: Boolean(process.env.JWT_SECRET),
      GOOGLE_AI_KEY: Boolean(process.env.GOOGLE_AI_KEY),
      BLOB_READ_WRITE_TOKEN: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      KV_REST_API_URL: Boolean(process.env.KV_REST_API_URL),
    },
    // What content storage the running code will actually use for writes.
    contentStore:
      process.env.NODE_ENV === 'production' && process.env.BLOB_READ_WRITE_TOKEN
        ? 'vercel-blob'
        : 'local-filesystem (edits will NOT persist on Vercel)',
    timestamp: new Date().toISOString(),
  });
}
