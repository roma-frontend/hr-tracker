import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface TicketWithRelations {
  id: string;
  ticket_number: string;
  title: string;
  status: string;
  created_by: string;
  organization_id: string;
  created_at: number;
  users?: { name: string } | { name: string }[] | null;
  organizations?: { name: string } | null;
}

interface IncidentWithRelations {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  affected_users: number;
  affected_orgs: number;
  root_cause: string | null;
  resolution: string | null;
  started_at: number;
  resolved_at: number | null;
  created_by: string;
  created_at: number;
  updated_at: number;
  users?: { name: string } | { name: string }[] | null;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Critical tickets
    const { data: criticalTicketsData } = await (supabase as any)
      .from('support_tickets')
      .select(
        `
        id,
        ticket_number,
        title,
        status,
        created_by,
        organization_id,
        created_at,
        users!support_tickets_created_by_fkey (name),
        organizations!support_tickets_organization_id_fkey (name)
      `,
      )
      .eq('priority', 'critical')
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(10);

    // Active incidents
    const { data: activeIncidentsData } = await (supabase as any)
      .from('emergency_incidents')
      .select(
        `
        id,
        organization_id,
        title,
        description,
        severity,
        status,
        affected_users,
        affected_orgs,
        root_cause,
        resolution,
        started_at,
        resolved_at,
        created_by,
        created_at,
        updated_at,
        users!emergency_incidents_created_by_fkey (name)
      `,
      )
      .neq('status', 'resolved')
      .order('created_at', { ascending: false });

    // SLA breaches (tickets older than 24h still open)
    const { count: slaBreaches } = await (supabase as any)
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress'])
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Suspicious IPs
    const { data: suspiciousIPsData } = await (supabase as any)
      .from('login_attempts')
      .select('ip, userid')
      .eq('success', false)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Maintenance mode orgs
    const { count: maintenanceModeOrgs } = await (supabase as any)
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false);

    // Pending org requests
    const { count: pendingOrgRequests } = await (supabase as any)
      .from('organization_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Format critical tickets
    const criticalTickets = ((criticalTicketsData as any) || []).map((t: TicketWithRelations) => {
      const creator = Array.isArray(t.users) ? t.users[0] : t.users;
      const org = t.organizations;
      return {
        id: t.id,
        ticketNumber: t.ticket_number,
        title: t.title,
        status: t.status,
        creatorName: creator?.name || 'Unknown',
        organizationName: org?.name || null,
        minutesOpen: Math.round((Date.now() - t.created_at) / 60000),
      };
    });

    // Format active incidents
    const activeIncidents = ((activeIncidentsData as any) || []).map((i: IncidentWithRelations) => {
      const creator = Array.isArray(i.users) ? i.users[0] : i.users;
      return {
        id: i.id,
        organizationId: i.organization_id,
        title: i.title,
        description: i.description,
        severity: i.severity,
        status: i.status,
        affectedUsers: i.affected_users,
        affectedOrgs: i.affected_orgs,
        rootCause: i.root_cause,
        resolution: i.resolution,
        startedAt: i.started_at,
        resolvedAt: i.resolved_at,
        createdBy: i.created_by,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
        creatorName: creator?.name || 'Unknown',
        minutesActive: Math.round((Date.now() - i.started_at) / 60000),
      };
    });

    // Format suspicious IPs
    const ipMap = new Map<string, { attempts: number; userIds: Set<string> }>();
    for (const attempt of suspiciousIPsData || []) {
      const ip = attempt.ip || 'unknown';
      if (!ipMap.has(ip)) {
        ipMap.set(ip, { attempts: 0, userIds: new Set() });
      }
      const entry = ipMap.get(ip)!;
      entry.attempts++;
      if (attempt.userid) {
        entry.userIds.add(attempt.userid);
      }
    }
    const suspiciousIPs = Array.from(ipMap.entries()).map(([ip, data]) => ({
      ip,
      attempts: data.attempts,
      userIds: Array.from(data.userIds),
    }));

    // Calculate priority score
    const priorityScore =
      criticalTickets.length * 10 +
      activeIncidents.length * 5 +
      (slaBreaches || 0) * 3 +
      suspiciousIPs.length * 8;

    const priorityLevel =
      priorityScore >= 50
        ? 'critical'
        : priorityScore >= 30
          ? 'high'
          : priorityScore >= 10
            ? 'medium'
            : 'low';

    const issues: string[] = [];
    if (criticalTickets.length > 0) issues.push('critical-tickets');
    if (activeIncidents.length > 0) issues.push('active-incidents');
    if ((slaBreaches || 0) > 0) issues.push('sla-breaches');
    if (suspiciousIPs.length > 0) issues.push('suspicious-ips');

    return NextResponse.json({
      criticalTickets,
      activeIncidents,
      slaBreaches: slaBreaches || 0,
      suspiciousIPs,
      maintenanceModeOrgs: maintenanceModeOrgs || 0,
      pendingOrgRequests: pendingOrgRequests || 0,
      priorityLevel,
      priorityScore,
      issues,
      requiresAttention: priorityScore >= 10,
    });
  } catch (error) {
    console.error('[Emergency Dashboard API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      action,
      createdBy,
      title,
      description,
      severity,
      affectedUsers,
      affectedOrgs,
    } = await request.json();

    if (action !== 'createIncident') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!createdBy || !title || !description || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const { data: incident, error } = await (supabase as any)
      .from('emergency_incidents')
      .insert({
        created_by: createdBy,
        title,
        description,
        severity,
        affected_users: affectedUsers || 0,
        affected_orgs: affectedOrgs || 0,
        status: 'investigating',
        started_at: Date.now(),
        created_at: Date.now(),
        updated_at: Date.now(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, incident });
  } catch (error) {
    console.error('[Create Incident API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      action,
      incidentId,
      status,
      userId,
      rootCause,
      resolution,
    } = await request.json();

    if (action !== 'updateIncidentStatus') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!incidentId || !status || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: Date.now(),
    };

    if (rootCause) {
      updateData.root_cause = rootCause;
    }

    if (resolution) {
      updateData.resolution = resolution;
    }

    if (status === 'resolved') {
      updateData.resolved_at = Date.now();
    }

    const { error } = await (supabase as any)
      .from('emergency_incidents')
      .update(updateData)
      .eq('id', incidentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Update Incident API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
