import { NextResponse } from 'next/server';
import { createCsrfToken } from '@/lib/csrf';

export const runtime = 'nodejs';

export async function GET() {
  const { token, signature } = createCsrfToken();
  return NextResponse.json({ token, signature });
}
