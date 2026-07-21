import { createContentRoute } from '@/lib/content-route';

// Always read/write live storage (Vercel Blob in prod); never statically cache.
export const dynamic = 'force-dynamic';

export const { GET, PUT } = createContentRoute('profile');
