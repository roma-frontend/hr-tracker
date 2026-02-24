import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data - replace with real conflict detection logic
    const conflicts = [
      {
        id: '1',
        type: 'critical',
        title: 'Multiple Team Leads Absent',
        description: '3 team leads from Engineering will be on leave simultaneously',
        affectedEmployees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        dateRange: { start: '2026-03-15', end: '2026-03-20' },
        department: 'Engineering',
        impactLevel: 9,
        suggestions: [
          'Request one team lead to reschedule',
          'Assign temporary backup leads',
          'Notify stakeholders about reduced capacity',
        ],
      },
      {
        id: '2',
        type: 'critical',
        title: 'Understaffed Department',
        description: '60% of Sales team will be absent on the same week',
        affectedEmployees: ['Alice Brown', 'Bob Wilson', 'Carol Davis', 'David Lee', 'Emma White'],
        dateRange: { start: '2026-04-01', end: '2026-04-05' },
        department: 'Sales',
        impactLevel: 8,
        suggestions: [
          'Stagger leave dates',
          'Hire temporary sales support',
          'Postpone non-critical sales activities',
        ],
      },
    ];

    return NextResponse.json(conflicts);
  } catch (error) {
    console.error('Conflict detection failed:', error);
    return NextResponse.json({ error: 'Failed to detect conflicts' }, { status: 500 });
  }
}
