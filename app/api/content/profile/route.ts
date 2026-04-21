import { NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';
import { isAuthenticated } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const data = await readContent('profile');
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  await writeContent('profile', body);
  revalidatePath('/');
  return NextResponse.json({ success: true });
}
