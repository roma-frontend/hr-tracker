-- Get the auth user ID and org ID
DO $$
DECLARE
  auth_user_id uuid;
  org_id uuid;
BEGIN
  SELECT id INTO auth_user_id FROM auth.users WHERE email = 'admin@test.com';
  SELECT id INTO org_id FROM public.organizations WHERE slug = 'test-org';
  
  -- Create user record
  INSERT INTO public.users (
    id,
    organizationid,
    name,
    email,
    password_hash,
    role,
    is_active,
    is_approved,
    presence_status
  ) VALUES (
    COALESCE(auth_user_id, gen_random_uuid()),
    org_id,
    'Admin User',
    'admin@test.com',
    crypt('Admin123!', gen_salt('bf')),
    'admin',
    true,
    true,
    'available'
  );
END $$;
