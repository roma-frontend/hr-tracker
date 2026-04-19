import { NextResponse } from 'next/server';
import { ensureSuperadminExists } from '@/actions/auth';

export async function GET() {
  // Only allow in development or when explicitly enabled
  const allowInit = process.env.ALLOW_SUPERADMIN_INIT === 'true' || process.env.NODE_ENV === 'development';
  
  if (!allowInit) {
    return NextResponse.json(
      { success: false, error: 'Superadmin initialization is disabled in production' },
      { status: 403 }
    );
  }

  try {
    const result = await ensureSuperadminExists();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[init-superadmin] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize superadmin' },
      { status: 500 }
    );
  }
}
