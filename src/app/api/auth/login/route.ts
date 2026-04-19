import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Use service role to bypass RLS for profile lookup
    const supabaseService = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Query user profile by auth user ID (most reliable)
    const { data: userProfiles } = await supabaseService
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        employee_type,
        department,
        position,
        phone,
        avatar_url,
        presence_status,
        is_active,
        is_approved,
        organizationid,
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('id', data.session.user.id)
      .limit(1);

    let userProfile = userProfiles?.[0];

    // If no profile found by ID, try by email as fallback
    if (!userProfile) {
      const { data: emailProfiles } = await supabaseService
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          employee_type,
          department,
          position,
          phone,
          avatar_url,
          presence_status,
          is_active,
          is_approved,
          organizationid,
          organizations (
            id,
            name,
            slug
          )
        `)
        .eq('email', normalizedEmail)
        .order('created_at', { ascending: false })
        .limit(1);

      userProfile = emailProfiles?.[0];
    }

    // If still no profile, create one from Supabase Auth user
    if (!userProfile && data.session?.user) {
      const authUser = data.session.user;
      const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
      
      const { data: newProfile, error: insertError } = await supabaseService
        .from('users')
        .insert({
          id: authUser.id,
          organizationid: authUser.user_metadata?.organization_id || null,
          name: userName,
          email: normalizedEmail,
          password_hash: 'auth_managed',
          role: authUser.user_metadata?.role || 'employee',
          employee_type: 'staff',
          department: authUser.user_metadata?.department || null,
          position: authUser.user_metadata?.position || null,
          phone: authUser.user_metadata?.phone || null,
          is_active: true,
          is_approved: true,
          travel_allowance: 0,
          paid_leave_balance: 0,
          sick_leave_balance: 0,
          family_leave_balance: 0,
          created_at: Date.now(),
        })
        .select(`
          id,
          name,
          email,
          role,
          employee_type,
          department,
          position,
          phone,
          avatar_url,
          presence_status,
          is_active,
          is_approved,
          organizationid,
          organizations (
            id,
            name,
            slug
          )
        `)
        .single();

      if (insertError) {
        console.error('[auth/login] Insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user profile: ' + insertError.message },
          { status: 500 }
        );
      }

      userProfile = newProfile;
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found. Please contact support.' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        avatar: userProfile.avatar_url,
        department: userProfile.department,
        position: userProfile.position,
        employeeType: userProfile.employee_type,
        organizationId: userProfile.organizationid,
        organizationSlug: userProfile.organizations?.slug,
        organizationName: userProfile.organizations?.name,
        isApproved: userProfile.is_approved,
        phone: userProfile.phone,
        presenceStatus: userProfile.presence_status,
      },
      session: data.session,
    });

    // Set Supabase SSR cookies so server-side routes can access the session
    const projectRef = 'fprtklhpngvtpuozypdj';
    
    // @supabase/ssr expects the raw access token as the cookie value, not JSON
    response.cookies.set(`sb-${projectRef}-access-token`, data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.session.expires_in,
      path: '/',
    });
    
    response.cookies.set(`sb-${projectRef}-refresh-token`, data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 31536000,
      path: '/',
    });

    console.log('[auth/login] Cookies set:', {
      accessCookie: `sb-${projectRef}-access-token`,
      refreshCookie: `sb-${projectRef}-refresh-token`,
      userId: data.session.user.id,
    });

    return response;
  } catch (error) {
    console.error('[auth/login] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
