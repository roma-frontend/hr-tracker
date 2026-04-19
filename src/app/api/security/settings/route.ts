import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from('security_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      settings: (settings || []).map((s) => ({
        id: s.id,
        key: s.key,
        enabled: s.enabled,
        updatedAt: s.updated_at,
        description: s.description,
      })),
    });
  } catch (error) {
    console.error('[Security Settings API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { key, enabled, updatedBy } = await request.json();

    if (!key || typeof enabled !== 'boolean' || !updatedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const { data: setting, error } = await supabase
      .from('security_settings')
      .update({ enabled, updated_by: updatedBy, updated_at: Date.now() })
      .eq('key', key)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      setting: {
        id: setting.id,
        key: setting.key,
        enabled: setting.enabled,
        updatedAt: setting.updated_at,
      },
    });
  } catch (error) {
    console.error('[Security Settings PATCH API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
