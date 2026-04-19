import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');

    const now = Date.now();
    const since = now - hours * 60 * 60 * 1000;

    // Get total logins
    const { count: total } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since);

    // Get failed logins
    const { count: failed } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('success', false)
      .gte('created_at', since);

    // Get high risk logins
    const { data: highRiskData } = await supabase
      .from('login_attempts')
      .select('risk_score')
      .gte('created_at', since)
      .gte('risk_score', 60);

    // Get suspicious logins
    const { data: suspicious } = await supabase
      .from('login_attempts')
      .select('email, success, method, ip, risk_score, risk_factors, blocked_reason, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      stats: {
        total: total || 0,
        failed: failed || 0,
        highRisk: highRiskData?.length || 0,
        suspicious: (suspicious || []).map((s) => ({
          email: s.email,
          success: s.success,
          method: s.method,
          ip: s.ip,
          riskScore: s.risk_score ? Number(s.risk_score) : undefined,
          riskFactors: s.risk_factors as string[],
          blockedReason: s.blocked_reason,
          createdAt: s.created_at,
        })),
      },
    });
  } catch (error) {
    console.error('[Login Stats API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
