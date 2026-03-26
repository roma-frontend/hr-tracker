import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Used for monitoring, load balancers, and uptime checks
 */
export async function GET() {
  const healthStatus = {
    status: 'ok',
    timestamp: Date.now(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime ? Math.round(process.uptime()) : 0,
  };

  return NextResponse.json(healthStatus, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
