import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'has-seen-tour': {
        const tourId = searchParams.get('tourId');
        const sessionToken = searchParams.get('sessionToken');

        if (!sessionToken || !tourId) {
          return NextResponse.json({ data: { hasSeenTour: false } });
        }

        // Get user from session token
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .or(`sessionToken.eq.${sessionToken},clerkid.eq.${sessionToken}`)
          .single();

        if (!user) {
          return NextResponse.json({ data: { hasSeenTour: false } });
        }

        // Check if tour has been seen
        const { data: preference } = await supabase
          .from('userPreferences')
          .select('value')
          .eq('userId', user.id)
          .eq('key', `tour_seen_${tourId}`)
          .single();

        return NextResponse.json({
          data: { hasSeenTour: preference?.value === true },
        });
      }

      default:
        return NextResponse.json({ data: null });
    }
  } catch (error) {
    console.error('User preferences API error:', error);
    return NextResponse.json({ data: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tourId, sessionToken } = body;

    switch (action) {
      case 'mark-tour-as-seen': {
        if (!sessionToken || !tourId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get user from session token
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .or(`sessionToken.eq.${sessionToken},clerkid.eq.${sessionToken}`)
          .single();

        if (!user) {
          return NextResponse.json({ success: true, storage: 'localStorage' });
        }

        // Check if preference already exists
        const { data: existing } = await supabase
          .from('userPreferences')
          .select('id')
          .eq('userId', user.id)
          .eq('key', `tour_seen_${tourId}`)
          .single();

        if (existing) {
          await supabase
            .from('userPreferences')
            .update({ value: true, updatedAt: Date.now() })
            .eq('id', existing.id);
        } else {
          await supabase.from('userPreferences').insert({
            userId: user.id,
            key: `tour_seen_${tourId}`,
            value: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }

        return NextResponse.json({ success: true, storage: 'database' });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('User preferences POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
