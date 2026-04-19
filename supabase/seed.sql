-- =====================================================
-- HR Platform - Seed Data
-- Development/Testing only
-- =====================================================

-- Create default superadmin organization
INSERT INTO organizations (id, name, slug, plan, is_active, created_by_superadmin, employee_limit, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'HR Platform Demo',
  'hr-demo',
  'enterprise',
  true,
  true,
  1000,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create superadmin user (romangulanyan@gmail.com)
-- This ensures the superadmin account always exists for development/testing
INSERT INTO users (id, organizationId, name, email, password_hash, role, employee_type, is_active, is_approved, travel_allowance, paid_leave_balance, sick_leave_balance, family_leave_balance, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Roman Gulanyan',
  'romangulanyan@gmail.com',
  '$2b$10$placeholder-hash-for-superadmin123',
  'superadmin',
  'staff',
  true,
  true,
  0,
  20,
  10,
  5,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create additional superadmin for testing (admin@hrplatform.com)
INSERT INTO users (id, organizationId, name, email, password_hash, role, employee_type, is_active, is_approved, travel_allowance, paid_leave_balance, sick_leave_balance, family_leave_balance, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'Super Admin',
  'admin@hrplatform.com',
  '$2b$10$placeholder-hash-for-admin123',
  'superadmin',
  'staff',
  true,
  true,
  0,
  20,
  10,
  5,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create test organization
INSERT INTO organizations (id, name, slug, plan, is_active, created_by_superadmin, employee_limit, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Test Company Inc',
  'test-company',
  'professional',
  true,
  false,
  100,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create test admin user
INSERT INTO users (id, organizationId, name, email, password_hash, role, employee_type, is_active, is_approved, travel_allowance, paid_leave_balance, sick_leave_balance, family_leave_balance, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'Test Admin',
  'admin@testcompany.com',
  '$2b$10$placeholder-hash-for-admin123',
  'admin',
  'staff',
  true,
  true,
  500,
  15,
  10,
  5,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create test employee user
INSERT INTO users (id, organizationId, name, email, password_hash, role, employee_type, is_active, is_approved, travel_allowance, paid_leave_balance, sick_leave_balance, family_leave_balance, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'Test Employee',
  'employee@testcompany.com',
  '$2b$10$placeholder-hash-for-employee123',
  'employee',
  'staff',
  true,
  true,
  200,
  10,
  5,
  3,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create test driver user
INSERT INTO users (id, organizationId, name, email, password_hash, role, employee_type, is_active, is_approved, travel_allowance, paid_leave_balance, sick_leave_balance, family_leave_balance, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000002',
  'Test Driver',
  'driver@testcompany.com',
  '$2b$10$placeholder-hash-for-driver123',
  'driver',
  'staff',
  true,
  true,
  300,
  12,
  8,
  4,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create test driver record
INSERT INTO drivers (id, organizationId, userid, vehicle_model, vehicle_plate_number, vehicle_capacity, is_available, working_hours_start, working_hours_end, working_days, max_trips_per_day, current_trips_today, rating, total_trips, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000004',
  'Toyota Camry',
  'ABC-1234',
  4,
  true,
  '08:00:00',
  '18:00:00',
  '{1,2,3,4,5}',
  10,
  0,
  4.5,
  150,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create test task
INSERT INTO tasks (id, organizationId, title, description, assigned_to, assigned_by, status, priority, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'Complete onboarding documentation',
  'Please review and complete all onboarding documents',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'pending',
  'medium',
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create test leave request
INSERT INTO leave_requests (id, organizationId, userid, type, start_date, end_date, days, reason, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  'paid',
  '2026-04-20',
  '2026-04-22',
  3,
  'Family vacation',
  'pending',
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create test notification
INSERT INTO notifications (id, organizationId, userid, type, title, message, is_read, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'leave_request',
  'New Leave Request',
  'Test Employee has submitted a leave request for 3 days',
  false,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create test chat conversation
INSERT INTO chat_conversations (id, organizationId, type, name, created_by, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'group',
  'General',
  '00000000-0000-0000-0000-000000000002',
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Add members to chat conversation
INSERT INTO chat_members (id, conversationid, userid, organizationId, role, unread_count, is_muted, joined_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'owner', 0, false, EXTRACT(EPOCH FROM NOW())::BIGINT),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'member', 0, false, EXTRACT(EPOCH FROM NOW())::BIGINT),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'member', 0, false, EXTRACT(EPOCH FROM NOW())::BIGINT)
ON CONFLICT (id) DO NOTHING;

-- Create test chat message
INSERT INTO chat_messages (id, conversationid, organizationId, senderid, type, content, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'text',
  'Welcome to the HR Platform! This is a test message.',
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create SLA config for test org
INSERT INTO sla_config (id, organizationId, target_response_time, warning_threshold, critical_threshold, business_hours_only, business_start_hour, business_end_hour, exclude_weekends, notify_on_warning, notify_on_critical, notify_on_breach, updated_by, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  4,
  2,
  1,
  true,
  9,
  18,
  true,
  true,
  true,
  true,
  '00000000-0000-0000-0000-000000000002',
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create work schedule for test employee
INSERT INTO work_schedules (id, organizationId, userid, start_time, end_time, working_days, timezone, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '09:00:00',
  '17:00:00',
  '{1,2,3,4,5}',
  'UTC',
  true,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;

-- Create subscription for test org
INSERT INTO subscriptions (id, organizationId, stripe_customerid, stripe_subscriptionid, plan, status, cancel_at_period_end, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'cus_test123',
  'sub_test123',
  'professional',
  'active',
  false,
  EXTRACT(EPOCH FROM NOW())::BIGINT,
  EXTRACT(EPOCH FROM NOW())::BIGINT
) ON CONFLICT (id) DO NOTHING;
