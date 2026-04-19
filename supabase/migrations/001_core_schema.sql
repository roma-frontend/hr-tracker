-- =====================================================
-- HR Platform - Core Schema Migration
-- Day 1: Organizations, Users, Auth, RLS Policies
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE org_plan AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'supervisor', 'employee', 'driver');
CREATE TYPE employee_type AS ENUM ('staff', 'contractor');
CREATE TYPE presence_status AS ENUM ('available', 'in_meeting', 'in_call', 'out_of_office', 'busy');
CREATE TYPE leave_type AS ENUM ('paid', 'unpaid', 'sick', 'family', 'doctor');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
CREATE TYPE ticket_category AS ENUM ('technical', 'billing', 'access', 'feature_request', 'bug', 'other');
CREATE TYPE automation_trigger AS ENUM ('leave_created', 'leave_pending_hours', 'user_inactive_days', 'sla_breach', 'multiple_failed_logins', 'ticket_created', 'ticket_priority');
CREATE TYPE automation_action AS ENUM ('auto_approve', 'auto_reject', 'send_notification', 'escalate', 'create_ticket', 'block_user', 'assign_user');
CREATE TYPE automation_task_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE incident_status AS ENUM ('investigating', 'identified', 'monitoring', 'resolved');
CREATE TYPE login_method AS ENUM ('password', 'faceid', 'webauthn', 'google');
CREATE TYPE chat_type AS ENUM ('direct', 'group');
CREATE TYPE chat_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'audio', 'system', 'call');
CREATE TYPE call_type AS ENUM ('audio', 'video');
CREATE TYPE call_status AS ENUM ('ringing', 'active', 'ended', 'missed', 'declined');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE event_type AS ENUM ('meeting', 'conference', 'training', 'team_building', 'holiday', 'deadline', 'other');
CREATE TYPE event_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE driver_shift_status AS ENUM ('active', 'completed', 'paused', 'overtime');
CREATE TYPE driver_schedule_type AS ENUM ('trip', 'blocked', 'maintenance', 'time_off');
CREATE TYPE driver_schedule_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE trip_priority AS ENUM ('P0', 'P1', 'P2', 'P3');
CREATE TYPE trip_category AS ENUM ('client_meeting', 'airport', 'office_transfer', 'emergency', 'team_event', 'personal');
CREATE TYPE driver_request_status AS ENUM ('pending', 'approved', 'declined', 'cancelled', 'completed');
CREATE TYPE calendar_access_level AS ENUM ('full', 'busy_only', 'none');
CREATE TYPE inspection_status AS ENUM ('passed', 'failed', 'overdue');
CREATE TYPE document_category AS ENUM ('resume', 'contract', 'certificate', 'performance_review', 'id_document', 'other');
CREATE TYPE note_type AS ENUM ('performance', 'behavior', 'achievement', 'concern', 'general');
CREATE TYPE note_visibility AS ENUM ('private', 'hr_only', 'manager_only', 'employee_visible');
CREATE TYPE sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE time_status AS ENUM ('checked_in', 'checked_out', 'absent');
CREATE TYPE subscription_plan AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
CREATE TYPE notification_type AS ENUM ('leave_request', 'leave_approved', 'leave_rejected', 'driver_request', 'driver_request_approved', 'driver_request_rejected', 'employee_added', 'join_request', 'join_approved', 'join_rejected', 'security_alert', 'status_change', 'message_mention', 'system');
CREATE TYPE invite_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

-- =====================================================
-- ORGANIZATIONS
-- =====================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    plan org_plan NOT NULL DEFAULT 'starter',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by_superadmin BOOLEAN NOT NULL DEFAULT false,
    logo_url TEXT,
    primary_color VARCHAR(7),
    timezone VARCHAR(50),
    country VARCHAR(100),
    industry VARCHAR(100),
    employee_limit INTEGER NOT NULL DEFAULT 10,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan);
CREATE INDEX idx_organizations_active ON organizations(is_active);

-- Organization Requests
CREATE TABLE organization_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requested_name VARCHAR(255) NOT NULL,
    requested_slug VARCHAR(100) NOT NULL UNIQUE,
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(50),
    requester_password VARCHAR(255) NOT NULL,
    requested_plan org_plan NOT NULL,
    industry VARCHAR(100),
    country VARCHAR(100),
    team_size VARCHAR(50),
    description TEXT,
    status request_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at BIGINT,
    rejection_reason TEXT,
    organizationId UUID REFERENCES organizations(id),
    userid UUID REFERENCES users(id),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_org_requests_status ON organization_requests(status);
CREATE INDEX idx_org_requests_email ON organization_requests(requester_email);
CREATE INDEX idx_org_requests_slug ON organization_requests(requested_slug);

-- Organization Invites
CREATE TABLE organization_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    requested_by_email VARCHAR(255) NOT NULL,
    requested_by_name VARCHAR(255) NOT NULL,
    requested_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    status invite_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at BIGINT,
    rejection_reason TEXT,
    userid UUID REFERENCES users(id),
    invite_token VARCHAR(255) UNIQUE,
    invite_email VARCHAR(255),
    invite_expiry BIGINT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_org_invites_org ON organization_invites(organizationId);
CREATE INDEX idx_org_invites_email ON organization_invites(requested_by_email);
CREATE INDEX idx_org_invites_status ON organization_invites(status);
CREATE INDEX idx_org_invites_org_status ON organization_invites(organizationId, status);
CREATE INDEX idx_org_invites_token ON organization_invites(invite_token);

-- =====================================================
-- USERS & AUTH
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    googleid VARCHAR(255) UNIQUE,
    clerkid VARCHAR(255) UNIQUE,
    role user_role NOT NULL DEFAULT 'employee',
    employee_type employee_type NOT NULL DEFAULT 'staff',
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(50),
    location VARCHAR(255),
    avatar_url TEXT,
    presence_status presence_status DEFAULT 'available',
    supervisorid UUID REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at BIGINT,
    travel_allowance NUMERIC(10,2) NOT NULL DEFAULT 0,
    paid_leave_balance INTEGER NOT NULL DEFAULT 0,
    sick_leave_balance INTEGER NOT NULL DEFAULT 0,
    family_leave_balance INTEGER NOT NULL DEFAULT 0,
    webauthn_challenge TEXT,
    face_descriptor JSONB,
    face_image_url TEXT,
    face_registered_at BIGINT,
    faceid_blocked BOOLEAN DEFAULT false,
    faceid_blocked_at BIGINT,
    faceid_failed_attempts INTEGER DEFAULT 0,
    faceid_last_attempt BIGINT,
    date_of_birth DATE,
    language VARCHAR(10),
    timezone VARCHAR(50),
    date_format VARCHAR(20),
    time_format VARCHAR(20),
    first_day_of_week VARCHAR(10),
    theme VARCHAR(20),
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    is_suspended BOOLEAN DEFAULT false,
    suspended_until BIGINT,
    suspended_reason TEXT,
    suspended_by UUID REFERENCES users(id),
    suspended_at BIGINT,
    totp_secret TEXT,
    totp_enabled BOOLEAN DEFAULT false,
    backup_codes JSONB,
    reset_password_token VARCHAR(255) UNIQUE,
    reset_password_expiry BIGINT,
    session_token VARCHAR(255) UNIQUE,
    session_expiry BIGINT,
    focus_mode_enabled BOOLEAN DEFAULT false,
    work_hours_start TIME,
    work_hours_end TIME,
    break_reminders_enabled BOOLEAN DEFAULT true,
    break_interval INTEGER DEFAULT 60,
    daily_task_goal INTEGER DEFAULT 5,
    default_view VARCHAR(50),
    data_refresh_rate VARCHAR(20),
    compact_mode BOOLEAN DEFAULT false,
    dashboard_widgets JSONB DEFAULT '{"quickStats": true, "leaveCalendar": true, "upcomingTasks": true, "teamActivity": true, "recentLeaves": true, "analytics": true}',
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT,
    last_login_at BIGINT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organizationId);
CREATE INDEX idx_users_org_role ON users(organizationId, role);
CREATE INDEX idx_users_org_active ON users(organizationId, is_active);
CREATE INDEX idx_users_org_approval ON users(organizationId, is_approved);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_supervisor ON users(supervisorid);
CREATE INDEX idx_users_approval ON users(is_approved);
CREATE INDEX idx_users_clerkid ON users(clerkid);
CREATE INDEX idx_users_org_email ON users(organizationId, email);
CREATE INDEX idx_users_org_created ON users(organizationId, created_at);
CREATE INDEX idx_users_session_token ON users(session_token);
CREATE INDEX idx_users_reset_token ON users(reset_password_token);

-- WebAuthn Credentials
CREATE TABLE webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credentialid VARCHAR(255) NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    device_name VARCHAR(255),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    last_used_at BIGINT
);

CREATE INDEX idx_webauthn_user ON webauthn_credentials(userid);
CREATE INDEX idx_webauthn_credential ON webauthn_credentials(credentialid);

-- =====================================================
-- LEAVES
-- =====================================================

CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id),
    type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL,
    reason TEXT NOT NULL,
    comment TEXT,
    status leave_status NOT NULL DEFAULT 'pending',
    is_read BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES users(id),
    review_comment TEXT,
    reviewed_at BIGINT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_leaves_org ON leave_requests(organizationId);
CREATE INDEX idx_leaves_user ON leave_requests(userid);
CREATE INDEX idx_leaves_org_status ON leave_requests(organizationId, status);
CREATE INDEX idx_leaves_status ON leave_requests(status);
CREATE INDEX idx_leaves_created ON leave_requests(created_at);
CREATE INDEX idx_leaves_status_created ON leave_requests(status, created_at);
CREATE INDEX idx_leaves_user_status ON leave_requests(userid, status);
CREATE INDEX idx_leaves_org_created ON leave_requests(organizationId, created_at);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    relatedid VARCHAR(255),
    metadata TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_notifications_user ON notifications(userid);
CREATE INDEX idx_notifications_org ON notifications(organizationId);
CREATE INDEX idx_notifications_user_unread ON notifications(userid, is_read);
CREATE INDEX idx_notifications_unread_date ON notifications(userid, is_read, created_at);
CREATE INDEX idx_notifications_org_created ON notifications(organizationId, created_at);

-- =====================================================
-- TICKETS
-- =====================================================

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'medium',
    status ticket_status NOT NULL DEFAULT 'open',
    category ticket_category NOT NULL DEFAULT 'other',
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    related_leaveid UUID REFERENCES leave_requests(id),
    related_driver_requestid UUID REFERENCES driver_requests(id),
    related_taskid UUID REFERENCES tasks(id),
    resolution TEXT,
    resolved_at BIGINT,
    resolved_by UUID REFERENCES users(id),
    closed_at BIGINT,
    sla_deadline BIGINT,
    first_response_at BIGINT,
    chatid UUID REFERENCES chat_conversations(id),
    chat_activated BOOLEAN DEFAULT false,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_tickets_org ON support_tickets(organizationId);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_tickets_created_by ON support_tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_tickets_status_priority ON support_tickets(status, priority);
CREATE INDEX idx_tickets_created ON support_tickets(created_at);
CREATE INDEX idx_tickets_number ON support_tickets(ticket_number);

CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticketid UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    organizationId UUID REFERENCES organizations(id),
    authorid UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT false,
    attachments JSONB,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticketid);
CREATE INDEX idx_ticket_comments_org ON ticket_comments(organizationId);
CREATE INDEX idx_ticket_comments_created ON ticket_comments(created_at);

-- =====================================================
-- AUTOMATION
-- =====================================================

CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    trigger_type automation_trigger NOT NULL,
    trigger_conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    execution_count INTEGER NOT NULL DEFAULT 0,
    last_executed_at BIGINT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_automation_org ON automation_rules(organizationId);
CREATE INDEX idx_automation_active ON automation_rules(is_active);
CREATE INDEX idx_automation_trigger ON automation_rules(trigger_type);

CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_workflows_active ON automation_workflows(is_active);

CREATE TABLE automation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status automation_task_status NOT NULL DEFAULT 'pending',
    result JSONB,
    error TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_automation_tasks_status ON automation_tasks(status);
CREATE INDEX idx_automation_tasks_created ON automation_tasks(created_at);

-- =====================================================
-- SECURITY
-- =====================================================

CREATE TABLE impersonation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    superadminid UUID NOT NULL REFERENCES users(id),
    target_userid UUID NOT NULL REFERENCES users(id),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    reason TEXT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at BIGINT NOT NULL,
    started_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    ended_at BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_impersonation_superadmin ON impersonation_sessions(superadminid);
CREATE INDEX idx_impersonation_target ON impersonation_sessions(target_userid);
CREATE INDEX idx_impersonation_token ON impersonation_sessions(token);
CREATE INDEX idx_impersonation_active ON impersonation_sessions(is_active);

CREATE TABLE emergency_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity incident_severity NOT NULL DEFAULT 'medium',
    status incident_status NOT NULL DEFAULT 'investigating',
    affected_users INTEGER NOT NULL DEFAULT 0,
    affected_orgs INTEGER NOT NULL DEFAULT 0,
    root_cause TEXT,
    resolution TEXT,
    started_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    resolved_at BIGINT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_incidents_status ON emergency_incidents(status);
CREATE INDEX idx_incidents_severity ON emergency_incidents(severity);
CREATE INDEX idx_incidents_org ON emergency_incidents(organizationId);
CREATE INDEX idx_incidents_created ON emergency_incidents(created_at);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255),
    details TEXT,
    ip VARCHAR(45),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_audit_org ON audit_logs(organizationId);
CREATE INDEX idx_audit_user ON audit_logs(userid);

CREATE TABLE security_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    updated_by UUID NOT NULL REFERENCES users(id),
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    description TEXT
);

CREATE INDEX idx_security_settings_key ON security_settings(key);

CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    userid UUID REFERENCES users(id),
    organizationId UUID REFERENCES organizations(id),
    success BOOLEAN NOT NULL DEFAULT false,
    method login_method NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    risk_score NUMERIC(3,2),
    risk_factors JSONB,
    blocked_reason TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_user ON login_attempts(userid);
CREATE INDEX idx_login_attempts_org ON login_attempts(organizationId);
CREATE INDEX idx_login_attempts_created ON login_attempts(created_at);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);

CREATE TABLE device_fingerprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userid UUID NOT NULL REFERENCES users(id),
    fingerprint VARCHAR(255) NOT NULL,
    user_agent TEXT,
    first_seen_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    last_seen_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    is_trusted BOOLEAN NOT NULL DEFAULT false,
    login_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_device_fingerprints_user ON device_fingerprints(userid);
CREATE INDEX idx_device_fingerprints_fingerprint ON device_fingerprints(fingerprint);
CREATE INDEX idx_device_fingerprints_user_fp ON device_fingerprints(userid, fingerprint);

CREATE TABLE keystroke_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userid UUID NOT NULL REFERENCES users(id) UNIQUE,
    avg_dwell NUMERIC(5,2) NOT NULL,
    avg_flight NUMERIC(5,2) NOT NULL,
    std_dev_dwell NUMERIC(5,2),
    std_dev_flight NUMERIC(5,2),
    sample_count INTEGER NOT NULL DEFAULT 0,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_keystroke_user ON keystroke_profiles(userid);

-- =====================================================
-- SLA
-- =====================================================

CREATE TABLE sla_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id) UNIQUE,
    target_response_time INTEGER NOT NULL DEFAULT 4,
    warning_threshold INTEGER NOT NULL DEFAULT 2,
    critical_threshold INTEGER NOT NULL DEFAULT 1,
    business_hours_only BOOLEAN NOT NULL DEFAULT true,
    business_start_hour INTEGER NOT NULL DEFAULT 9,
    business_end_hour INTEGER NOT NULL DEFAULT 18,
    exclude_weekends BOOLEAN NOT NULL DEFAULT true,
    notify_on_warning BOOLEAN NOT NULL DEFAULT true,
    notify_on_critical BOOLEAN NOT NULL DEFAULT true,
    notify_on_breach BOOLEAN NOT NULL DEFAULT true,
    updated_by UUID NOT NULL REFERENCES users(id),
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_sla_config_org ON sla_config(organizationId);

CREATE TABLE sla_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    leave_requestid UUID NOT NULL REFERENCES leave_requests(id),
    submitted_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    responded_at BIGINT,
    response_time_hours NUMERIC(5,2),
    target_response_time INTEGER NOT NULL DEFAULT 4,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    sla_score NUMERIC(5,2),
    warning_triggered BOOLEAN NOT NULL DEFAULT false,
    critical_triggered BOOLEAN NOT NULL DEFAULT false,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_sla_metrics_org ON sla_metrics(organizationId);
CREATE INDEX idx_sla_metrics_leave ON sla_metrics(leave_requestid);
CREATE INDEX idx_sla_metrics_status ON sla_metrics(status);
CREATE INDEX idx_sla_metrics_submitted ON sla_metrics(submitted_at);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE keystroke_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_metrics ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (
        id IN (SELECT organizationId FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Superadmins can view all organizations" ON organizations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superadmin')
    );

-- User policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can view others in same organization" ON users
    FOR SELECT USING (
        organizationId IN (SELECT organizationId FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage users in their organization" ON users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );

-- Leave policies
CREATE POLICY "Users can view their own leaves" ON leave_requests
    FOR SELECT USING (userid = auth.uid());

CREATE POLICY "Users can view leaves in their organization" ON leave_requests
    FOR SELECT USING (
        organizationId IN (SELECT organizationId FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can create their own leaves" ON leave_requests
    FOR INSERT WITH CHECK (userid = auth.uid());

CREATE POLICY "Admins can manage all leaves" ON leave_requests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (userid = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (userid = auth.uid());

-- Ticket policies
CREATE POLICY "Users can view tickets in their organization" ON support_tickets
    FOR SELECT USING (
        organizationId IN (SELECT organizationId FROM users WHERE id = auth.uid())
        OR created_by = auth.uid()
        OR assigned_to = auth.uid()
    );

CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update assigned tickets" ON support_tickets
    FOR UPDATE USING (
        assigned_to = auth.uid()
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );

-- Audit log policies
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at
    BEFORE UPDATE ON ticket_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    ticket_num VARCHAR(50);
    num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1
    INTO num
    FROM support_tickets
    WHERE ticket_number LIKE 'TKT-%';
    
    ticket_num := 'TKT-' || LPAD(num::TEXT, 6, '0');
    NEW.ticket_number := ticket_num;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_ticket_number_trigger
    BEFORE INSERT ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE organizations IS 'Organizations/tenants in the multi-tenant system';
COMMENT ON TABLE users IS 'User accounts with auth and profile data';
COMMENT ON TABLE leave_requests IS 'Employee leave requests';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE support_tickets IS 'Customer support tickets';
COMMENT ON TABLE audit_logs IS 'Security audit trail';
COMMENT ON TABLE sla_config IS 'SLA configuration per organization';
COMMENT ON TABLE sla_metrics IS 'SLA performance metrics';
