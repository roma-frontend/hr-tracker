import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    switch (action) {
      case 'update-localization': {
        const { language, timezone, dateFormat, timeFormat, firstDayOfWeek } = body;

        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { error } = await supabase
          .from('users')
          .update({
            language,
            timezone,
            date_format: dateFormat,
            time_format: timeFormat,
            first_day_of_week: firstDayOfWeek,
            updated_at: Date.now(),
          })
          .eq('id', userId);

        if (error) {
          throw error;
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
