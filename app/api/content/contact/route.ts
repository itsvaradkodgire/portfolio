import { NextResponse } from 'next/server';
import { readContent, writeContent } from '@/lib/content';
import { isAuthenticated } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
  return NextResponse.json(await readContent('contact'));
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await writeContent('contact', await request.json());
  revalidatePath('/');
  return NextResponse.json({ success: true });
}
