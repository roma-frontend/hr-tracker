import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month';

    // Mock data - replace with real database queries
    const costData = {
      totalCost: period === 'year' ? 1254300 : period === 'quarter' ? 375000 : 125430,
      currentMonthCost: 42150,
      projectedCost: period === 'year' ? 1350000 : period === 'quarter' ? 395000 : 135000,
      trend: 7.6,
      costByDepartment: [
        { department: 'Engineering', cost: 48200, employees: 12 },
        { department: 'Sales', cost: 32100, employees: 8 },
        { department: 'Marketing', cost: 25800, employees: 6 },
        { department: 'HR', cost: 12500, employees: 3 },
        { department: 'Finance', cost: 6830, employees: 2 },
      ],
      costByType: [
        { type: 'Paid Leave', cost: 89200, count: 145 },
        { type: 'Sick Leave', cost: 21300, count: 48 },
        { type: 'Family Leave', cost: 14930, count: 12 },
      ],
    };

    return NextResponse.json(costData);
  } catch (error) {
    console.error('Cost analysis failed:', error);
    return NextResponse.json({ error: 'Failed to fetch cost data' }, { status: 500 });
  }
}
