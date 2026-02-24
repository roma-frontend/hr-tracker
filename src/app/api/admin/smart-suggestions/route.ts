import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock AI suggestions - replace with real ML model
    const suggestions = [
      {
        id: '1',
        type: 'optimization',
        priority: 'high',
        title: 'Optimize Q2 Leave Distribution',
        description: 'AI detected uneven leave distribution in Q2. Redistributing can improve team availability by 23%.',
        impact: {
          metric: 'Team Availability',
          value: '+23%',
          change: 23,
        },
        action: 'Suggest alternative dates to 8 employees',
        reasoning: [
          'April has 45% more leave requests than May',
          'Engineering team will be understaffed in April',
          'Moving 8 requests to May creates better balance',
          'No project deadlines affected by the change',
        ],
        affectedEmployees: 8,
      },
      {
        id: '2',
        type: 'cost-saving',
        priority: 'high',
        title: 'Reduce Overtime Costs',
        description: 'Staggering sales team leaves can reduce overtime costs by $12,400 this quarter.',
        impact: {
          metric: 'Overtime Costs',
          value: '-$12.4K',
          change: -18,
        },
        action: 'Implement staggered leave policy for Sales',
        reasoning: [
          'Current leave pattern creates coverage gaps',
          'Gaps require 3x overtime to maintain service levels',
          'Staggering leaves reduces overtime by 67%',
          'Employee satisfaction remains high with flexibility',
        ],
        affectedEmployees: 12,
      },
    ];

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Smart suggestions failed:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
