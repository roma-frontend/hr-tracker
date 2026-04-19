import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('org');

    if (!orgId) {
      return NextResponse.json({ isActive: false });
    }

    const supabase = await createClient();
    const { data: maintenanceData } = await supabase
      .from('maintenance_modes')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const isActive = maintenanceData?.is_active === true && 
      maintenanceData.start_time <= Date.now();

    return NextResponse.json({ isActive });
  } catch (error) {
    console.error('Maintenance check error:', error);
    return NextResponse.json({ isActive: false });
  }
}
