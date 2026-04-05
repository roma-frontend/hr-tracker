import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const execAsync = promisify(exec);

const ALLOWED_SCRIPTS = [
  'stripe:view',
  'stripe:add-test-data',
  'stripe:export',
  'stripe:export-pdf',
  'stripe:growth-chart',
  'stripe:sync',
  'stripe:check-trials',
];

/**
 * Verify the user is a superadmin by checking the JWT session cookie.
 */
async function verifySuperadmin(
  req: NextRequest,
): Promise<{ userId: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('oauth-session');
    if (!sessionCookie) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-fallback-secret');
    const { payload } = await jwtVerify(sessionCookie.value, secret);

    if (payload.role !== 'superadmin') {
      console.warn('[Stripe Run-Script] Non-superadmin access attempt:', payload.role);
      return null;
    }

    return { userId: payload.sub as string, role: payload.role as string };
  } catch (err) {
    console.error('[Stripe Run-Script] Auth verification failed:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  // Require superadmin authentication
  const user = await verifySuperadmin(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized. Superadmin access required.' },
      { status: 401 },
    );
  }

  try {
    const { script } = await req.json();

    if (!script || !ALLOWED_SCRIPTS.includes(script)) {
      return NextResponse.json({ error: 'Invalid or disallowed script name' }, { status: 400 });
    }

    const cwd = path.resolve(process.cwd());

    const { stdout, stderr } = await execAsync(`npm run ${script}`, {
      cwd,
      timeout: 60000,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });

    const raw = (stdout || '') + (stderr || '');
    const output = stripAnsi(raw);

    console.log(`[Stripe Run-Script] ${script} executed by superadmin ${user.userId}`);

    return NextResponse.json({
      success: true,
      output: output.trim() || '✅ Script completed with no output.',
    });
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    const raw = ((err.stdout || '') + (err.stderr || '')).trim();
    const output = stripAnsi(raw);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Unknown error',
        output: output || err.message || 'Script failed.',
      },
      { status: 500 },
    );
  }
}

// Strip ANSI escape codes from terminal output
function stripAnsi(str: string): string {
  return str
    .replace(/\x1B\[[0-9;]*[mGKHF]/g, '')
    .replace(/\x1B\[[0-9;]*m/g, '')
    .replace(/\x1B\[[\d;]*[A-Za-z]/g, '')
    .replace(/\x1b\[[0-9;]*m/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}
