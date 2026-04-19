import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    console.log('[auth/login] Login attempt started');
    const body = await request.json();
    const { email, password } = body;

    const normalizedEmail = email.toLowerCase().trim();

    console.log('[auth/login] Email (normalized):', normalizedEmail);

    if (!normalizedEmail || !password) {
      console.error('[auth/login] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('[auth/login] Calling Supabase signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    console.log('[auth/login] Supabase response:', { hasSession: !!data.session, hasError: !!error, error: error?.message });

    if (error) {
      console.error('[auth/login] Supabase auth error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Use service role to bypass RLS for profile lookup after successful auth
    const supabaseService = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('[auth/login] Querying user profile for email:', normalizedEmail);
    const { data: userProfiles, error: profileError } = await supabaseService
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
        "organizationId",
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('[auth/login] Profile query result:', { 
      count: userProfiles?.length ?? 0, 
      profileError,
      firstProfile: userProfiles?.[0]
    });

    let userProfile = userProfiles?.[0];

    // If no profile exists, create one from Supabase Auth user
    if (!userProfile && data.session?.user) {
      console.log('[auth/login] No profile found, creating one for auth user:', data.session.user.id);
      
      const authUser = data.session.user;
      const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
      
      const { data: newProfile, error: insertError } = await supabaseService
        .from('users')
        .insert({
          id: authUser.id,
          "organizationId": authUser.user_metadata?.organization_id || null,
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
          created_at: Math.floor(Date.now() / 1000),
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
          "organizationId",
          organizations (
            id,
            name,
            slug
          )
        `)
        .single();

      if (insertError) {
        console.error('[auth/login] Failed to create user profile:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user profile. Please contact support.' },
          { status: 500 }
        );
      }

      console.log('[auth/login] Profile created successfully:', newProfile);
      userProfile = newProfile;
    }

    if (!userProfile) {
      console.error('[auth/login] No user profile found for email:', normalizedEmail);
      return NextResponse.json(
        { error: 'User profile not found. Please contact support.', details: profileError?.message },
        { status: 404 }
      );
    }

    console.log('[auth/login] User profile found:', { 
      id: userProfile.id, 
      name: userProfile.name, 
      role: userProfile.role,
      organizationId: userProfile.organizationId 
    });

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
        organizationId: userProfile.organizationId,
        organizationSlug: userProfile.organizations?.slug,
        organizationName: userProfile.organizations?.name,
        isApproved: userProfile.is_approved,
        phone: userProfile.phone,
        presenceStatus: userProfile.presence_status,
      },
      session: data.session,
    });

    // Set Supabase auth cookies with correct names
    if (data.session) {
      const projectRef = 'fprtklhpngvtpuozypdj';
      const expiresAt = new Date(data.session.expires_at! * 1000);
      
      response.cookies.set({
        name: `sb-${projectRef}-access-token`,
        value: data.session.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
      });
      
      response.cookies.set({
        name: `sb-${projectRef}-refresh-token`,
        value: data.session.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error('[auth/login] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
