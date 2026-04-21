import { NextResponse } from 'next/server';
import { readContent } from '@/lib/content';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await readContent('analytics'));
}
