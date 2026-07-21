import { NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';
import { isAuthenticated } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { ContentKey } from '@/lib/types';

/**
 * Factory for the near-identical content GET/PUT routes.
 *
 * GET  → returns the stored content for `key`.
 * PUT  → (auth required) validates, persists, revalidates the home page, and
 *        surfaces the real error message if the write fails (e.g. storage not
 *        configured in production) so the admin UI can show why a save failed.
 */
export function createContentRoute(key: ContentKey) {
  async function GET() {
    try {
      return NextResponse.json(await readContent(key));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read content';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  async function PUT(request: Request) {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    try {
      await writeContent(key, body);
      revalidatePath('/');
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save content';
      console.error(`[content:${key}] save failed:`, message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return { GET, PUT };
}
