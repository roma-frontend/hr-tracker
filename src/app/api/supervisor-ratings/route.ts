import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
    }

    const { data: ratings } = await supabase
      .from('supervisor_ratings')
      .select('*, supervisor:supervisor_id(id, name, email, avatar_url)')
      .eq('user.id', employeeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    const mapped = (ratings || []).map((r: any) => ({
      id: r.id,
      employeeId: r.user_id,
      supervisorId: r.supervisor_id,
      supervisor: r.supervisor ? {
        id: r.supervisor.id,
        name: r.supervisor.name,
        email: r.supervisor.email,
        avatarUrl: r.supervisor.avatar_url,
      } : null,
      overallRating: r.overall_rating,
      qualityOfWork: r.quality_of_work,
      efficiency: r.efficiency,
      teamwork: r.teamwork,
      initiative: r.initiative,
      communication: r.communication,
      reliability: r.reliability,
      strengths: r.strengths,
      areasForImprovement: r.areas_for_improvement,
      generalComments: r.general_comments,
      ratingPeriod: r.rating_period,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error('[Supervisor Ratings API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      employeeId,
      supervisorId,
      overallRating,
      qualityOfWork,
      efficiency,
      teamwork,
      initiative,
      communication,
      reliability,
      strengths,
      areasForImprovement,
      generalComments,
      ratingPeriod,
    } = body;

    if (!employeeId || !supervisorId || !overallRating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: rating, error } = await supabase
      .from('supervisor_ratings')
      .insert({
        user_id: employeeId,
        supervisor_id: supervisorId,
        overall_rating: overallRating,
        quality_of_work: qualityOfWork || 0,
        efficiency: efficiency || 0,
        teamwork: teamwork || 0,
        initiative: initiative || 0,
        communication: communication || 0,
        reliability: reliability || 0,
        strengths: strengths || null,
        areas_for_improvement: areasForImprovement || null,
        general_comments: generalComments || null,
        rating_period: ratingPeriod || null,
        created_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: rating });
  } catch (error) {
    console.error('[Supervisor Ratings API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
