import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    const { data: requests, error } = await supabase
      .from('organization_join_requests')
      .select('*')
      .eq('organizationId', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (requests || []).map((r: any) => ({
      id: r.id,
      organizationId: r.organizationId,
      requesterId: r.id,
      requesterName: r.requester_name,
      requesterEmail: r.requester_email,
      requesterAvatar: r.requester_avatar,
      status: r.status,
      requestedAt: r.created_at,
      reviewedAt: r.reviewed_at,
      reviewerId: r.reviewed_by,
      rejectionReason: r.review_notes,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Join requests API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'approve') {
      const { inviteId, reviewerId } = body;

      const { data: request, error } = await supabase
        .from('organization_join_requests')
        .update({
          status: 'approved',
          reviewed_by: reviewerId,
          reviewed_at: Date.now(),
        })
        .eq('id', inviteId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        id: request.id,
        organizationId: request.organizationId,
        requesterId: request.id,
        status: request.status,
      });
    }

    if (action === 'reject') {
      const { inviteId, reviewerId, reason } = body;

      const { data: request, error } = await supabase
        .from('organization_join_requests')
        .update({
          status: 'rejected',
          reviewed_by: reviewerId,
          reviewed_at: Date.now(),
          review_notes: reason,
        })
        .eq('id', inviteId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        id: request.id,
        organizationId: request.organizationId,
        requesterId: request.id,
        status: request.status,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Join requests API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
