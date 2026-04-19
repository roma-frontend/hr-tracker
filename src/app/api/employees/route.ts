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
    const action = searchParams.get('action');

    if (action === 'get-employee-profile') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
      }

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', employeeId)
        .single();

      return NextResponse.json({
        data: {
          profile: user ? {
            id: user.id,
            userId: user.id,
            name: user.name,
            email: user.email,
            department: user.department,
            position: user.position,
            phone: user.phone,
            location: user.location,
            avatarUrl: user.avatar_url,
            presenceStatus: user.presence_status,
          } : null,
          documents: [],
        },
      });
    }

    if (action === 'get-ai-evaluation') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
      }

      const { data: evaluation } = await supabase
        .from('ai_evaluations')
        .select('*')
        .eq('userId', employeeId)
        .order('createdAt', { ascending: false })
        .limit(1)
        .single();

      if (!evaluation) {
        return NextResponse.json({ data: null });
      }

      return NextResponse.json({
        data: {
          id: evaluation.id,
          userId: evaluation.userId,
          overallScore: evaluation.overall_score,
          breakdown: evaluation.breakdown,
          createdAt: evaluation.createdAt,
        },
      });
    }

    if (action === 'get-latest-rating') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
      }

      const { data: rating } = await supabase
        .from('supervisor_ratings')
        .select('*, supervisor:users!supervisor_ratings_supervisorid_fkey(id, name, email, avatar_url)')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!rating) {
        return NextResponse.json({ data: null });
      }

      return NextResponse.json({
        data: {
          id: rating.id,
          employeeId: rating.employee_id,
          supervisorId: rating.supervisorid,
          supervisor: rating.supervisor ? {
            id: rating.supervisor.id,
            name: rating.supervisor.name,
            email: rating.supervisor.email,
            avatarUrl: rating.supervisor.avatar_url,
          } : null,
          overallRating: rating.overall_rating,
          qualityOfWork: rating.quality_of_work,
          efficiency: rating.efficiency,
          teamwork: rating.teamwork,
          initiative: rating.initiative,
          communication: rating.communication,
          reliability: rating.reliability,
          strengths: rating.strengths,
          areasForImprovement: rating.areas_for_improvement,
          generalComments: rating.general_comments,
          ratingPeriod: rating.rating_period,
          createdAt: rating.created_at,
        },
      });
    }

    if (action === 'get-employee-ratings') {
      const employeeId = searchParams.get('employeeId');
      const limit = parseInt(searchParams.get('limit') || '10');
      if (!employeeId) {
        return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
      }

      const { data: ratings } = await supabase
        .from('supervisor_ratings')
        .select('*, supervisor:users!supervisor_ratings_supervisorid_fkey(id, name, email, avatar_url)')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      const mapped = (ratings || []).map((r: any) => ({
        id: r.id,
        employeeId: r.employee_id,
        supervisorId: r.supervisorid,
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
    }

    if (action === 'get-monthly-stats') {
      const employeeId = searchParams.get('employeeId');
      const month = searchParams.get('month');
      if (!employeeId || !month) {
        return NextResponse.json({ error: 'employeeId and month are required' }, { status: 400 });
      }

      const monthStart = new Date(`${month}-01T00:00:00`).getTime();
      const monthEnd = new Date(
        new Date(monthStart).getFullYear(),
        new Date(monthStart).getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ).getTime();

      const { data: timeEntries } = await supabase
        .from('time_tracking')
        .select('*')
        .eq('userId', employeeId)
        .gte('check_in_time', monthStart)
        .lte('check_in_time', monthEnd);

      let totalDays = 0;
      let totalWorkedHours = 0;
      let lateDays = 0;
      let earlyLeaveDays = 0;

      if (timeEntries) {
        totalDays = timeEntries.filter((e: any) => e.checkin_time).length;
        totalWorkedHours = timeEntries.reduce(
          (sum: number, e: any) => sum + (e.total_worked_minutes || 0) / 60,
          0,
        );
        lateDays = timeEntries.filter((e: any) => e.is_late).length;
        earlyLeaveDays = timeEntries.filter((e: any) => e.early_leave).length;
      }

      const punctualityRate = totalDays > 0 ? Math.round(((totalDays - lateDays) / totalDays) * 100) : 100;

      return NextResponse.json({
        data: {
          totalDays,
          totalWorkedHours: Math.round(totalWorkedHours * 10) / 10,
          punctualityRate,
          lateDays,
          earlyLeaveDays,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Employees API Error]', error);
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
    const action = req.nextUrl.searchParams.get('action');

    if (action === 'submit-rating') {
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
          employee_id: employeeId,
          supervisorid: supervisorId,
          rated_by: supervisorId,
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
          rating_period: ratingPeriod || '',
          rating: overallRating,
          created_at: Date.now(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: rating });
    }

    if (action === 'submit-evaluation') {
      const { employeeId, overallScore, breakdown } = body;

      if (!employeeId || !overallScore) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const { data: evaluation, error } = await supabase
        .from('ai_evaluations')
        .insert({
          userId: employeeId,
          overall_score: overallScore,
          breakdown: breakdown || {},
          createdAt: Date.now(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: evaluation });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Employees API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
