# Superadmin Account Initialization

## Overview
The superadmin account (`romangulanyan@gmail.com`) is guaranteed to always exist in the database for development and testing purposes.

## How It Works

### 1. Database Migration
Run the migration to ensure the superadmin exists at the database level:
```bash
supabase db reset  # For local development
# OR
supabase db push   # For production
```

The migration file `supabase/migrations/004_init_superadmin.sql` creates:
- Superadmin organization (`HR Platform`)
- Superadmin user account with email `romangulanyan@gmail.com`

### 2. Runtime Initialization (Development Only)
An API endpoint is available to ensure the superadmin exists at runtime:

```bash
curl http://localhost:3000/api/init-superadmin
```

This will:
- Check if the superadmin organization exists (create if missing)
- Check if the superadmin user exists (create if missing)
- Ensure the superadmin has correct permissions

**Security**: This endpoint is only accessible in development mode or when `ALLOW_SUPERADMIN_INIT=true` is set.

### 3. Seed Data
The seed file `supabase/seed.sql` includes the superadmin account for fresh database setups.

## Default Credentials
- **Email**: `romangulanyan@gmail.com`
- **Password**: Set during first-time setup or use the password from your seed data
- **Role**: `superadmin`
- **Organization**: `HR Platform` (ID: `00000000-0000-0000-0000-000000000001`)

## Superadmin Capabilities
The superadmin role has special privileges:
- Can access all organizations
- Can manage all users
- Can access superadmin dashboard (`/superadmin/*`)
- Bypasses most authorization checks
- Cannot be locked out by maintenance mode

## Files Modified/Created
1. `supabase/seed.sql` - Updated with superadmin seed data
2. `supabase/migrations/004_init_superadmin.sql` - New migration for superadmin initialization
3. `src/actions/auth.ts` - Added `ensureSuperadminExists()` function
4. `src/app/api/init-superadmin/route.ts` - New API endpoint for runtime initialization

## Production Deployment
In production:
1. The migration will run automatically during deployment
2. The API endpoint is disabled by default (set `ALLOW_SUPERADMIN_INIT=true` to enable)
3. Consider changing the default password after first login

## Troubleshooting
If the superadmin cannot log in:
1. Check the database: `SELECT * FROM users WHERE email = 'romangulanyan@gmail.com';`
2. Run the initialization: `curl http://localhost:3000/api/init-superadmin`
3. Check the console logs for any errors
