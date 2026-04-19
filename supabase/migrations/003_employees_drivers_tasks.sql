-- =====================================================
-- HR Platform - Employees, Drivers, Tasks, Events, Productivity
-- Day 3: Employee profiles, driver management, tasks, events
-- =====================================================

-- =====================================================
-- EMPLOYEES
-- =====================================================

CREATE TABLE employee_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id) UNIQUE,
    biography JSONB,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_employee_profiles_org ON employee_profiles(organizationId);
CREATE INDEX idx_employee_profiles_user ON employee_profiles(userid);

CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id),
    uploaderid UUID NOT NULL REFERENCES users(id),
    category document_category NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    description TEXT,
    uploaded_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_employee_docs_org ON employee_documents(organizationId);
CREATE INDEX idx_employee_docs_user ON employee_documents(userid);

CREATE TABLE employee_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    employeeid UUID NOT NULL REFERENCES users(id),
    authorid UUID NOT NULL REFERENCES users(id),
    type note_type NOT NULL,
    visibility note_visibility NOT NULL DEFAULT 'private',
    content TEXT NOT NULL,
    sentiment sentiment NOT NULL DEFAULT 'neutral',
    tags TEXT[] DEFAULT '{}',
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_employee_notes_org ON employee_notes(organizationId);
CREATE INDEX idx_employee_notes_employee ON employee_notes(employeeid);
CREATE INDEX idx_employee_notes_author ON employee_notes(authorid);

CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    punctuality_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    absence_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    late_arrivals INTEGER NOT NULL DEFAULT 0,
    kpi_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    project_completion NUMERIC(5,2) NOT NULL DEFAULT 0,
    deadline_adherence NUMERIC(5,2) NOT NULL DEFAULT 0,
    teamwork_rating NUMERIC(5,2) NOT NULL DEFAULT 0,
    communication_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    conflict_incidents INTEGER NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_perf_metrics_org ON performance_metrics(organizationId);
CREATE INDEX idx_perf_metrics_user ON performance_metrics(userid);

CREATE TABLE time_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id),
    check_in_time BIGINT NOT NULL,
    check_out_time BIGINT,
    scheduled_start_time BIGINT NOT NULL,
    scheduled_end_time BIGINT NOT NULL,
    is_late BOOLEAN NOT NULL DEFAULT false,
    late_minutes INTEGER,
    is_early_leave BOOLEAN NOT NULL DEFAULT false,
    early_leave_minutes INTEGER,
    overtime_minutes INTEGER,
    total_worked_minutes INTEGER,
    status time_status NOT NULL DEFAULT 'checked_in',
    date DATE NOT NULL,
    notes TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_time_tracking_org ON time_tracking(organizationId);
CREATE INDEX idx_time_tracking_user ON time_tracking(userid);
CREATE INDEX idx_time_tracking_date ON time_tracking(date);
CREATE INDEX idx_time_tracking_user_date ON time_tracking(userid, date);
CREATE INDEX idx_time_tracking_status ON time_tracking(status);

CREATE TABLE supervisor_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    employeeid UUID NOT NULL REFERENCES users(id),
    supervisorid UUID NOT NULL REFERENCES users(id),
    quality_of_work NUMERIC(5,2) NOT NULL,
    efficiency NUMERIC(5,2) NOT NULL,
    teamwork NUMERIC(5,2) NOT NULL,
    initiative NUMERIC(5,2) NOT NULL,
    communication NUMERIC(5,2) NOT NULL,
    reliability NUMERIC(5,2) NOT NULL,
    overall_rating NUMERIC(5,2) NOT NULL,
    strengths TEXT,
    areas_for_improvement TEXT,
    general_comments TEXT,
    rating_period VARCHAR(50) NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_supervisor_ratings_org ON supervisor_ratings(organizationId);
CREATE INDEX idx_supervisor_ratings_employee ON supervisor_ratings(employeeid);
CREATE INDEX idx_supervisor_ratings_supervisor ON supervisor_ratings(supervisorid);
CREATE INDEX idx_supervisor_ratings_period ON supervisor_ratings(rating_period);

-- =====================================================
-- DRIVERS
-- =====================================================

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id) UNIQUE,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_plate_number VARCHAR(50) NOT NULL,
    vehicle_capacity INTEGER NOT NULL,
    vehicle_color VARCHAR(50),
    vehicle_year INTEGER,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_on_shift BOOLEAN DEFAULT false,
    last_status_update_at BIGINT,
    working_hours_start TIME NOT NULL,
    working_hours_end TIME NOT NULL,
    working_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}',
    max_trips_per_day INTEGER NOT NULL DEFAULT 10,
    current_trips_today INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3,2) NOT NULL DEFAULT 0,
    total_trips INTEGER NOT NULL DEFAULT 0,
    kpi_metrics JSONB,
    current_shift_start BIGINT,
    current_shift_end BIGINT,
    overtime_hours NUMERIC(5,2),
    last_maintenance_date BIGINT,
    next_maintenance_due BIGINT,
    vehicle_mileage NUMERIC(10,2),
    inspection_status inspection_status,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_drivers_org ON drivers(organizationId);
CREATE INDEX idx_drivers_user ON drivers(userid);
CREATE INDEX idx_drivers_org_available ON drivers(organizationId, is_available);
CREATE INDEX idx_drivers_on_shift ON drivers(is_on_shift);

CREATE TABLE driver_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    driverid UUID NOT NULL REFERENCES drivers(id),
    userid UUID NOT NULL REFERENCES users(id),
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    scheduled_start_time BIGINT,
    scheduled_end_time BIGINT,
    status driver_shift_status NOT NULL DEFAULT 'active',
    total_hours NUMERIC(5,2),
    break_time NUMERIC(5,2),
    overtime_hours NUMERIC(5,2),
    trips_completed INTEGER NOT NULL DEFAULT 0,
    total_distance NUMERIC(10,2),
    total_duration NUMERIC(10,2),
    on_time_performance NUMERIC(5,2),
    average_rating NUMERIC(3,2),
    driver_notes TEXT,
    supervisor_notes TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_driver_shifts_driver ON driver_shifts(driverid);
CREATE INDEX idx_driver_shifts_org ON driver_shifts(organizationId);
CREATE INDEX idx_driver_shifts_driver_status ON driver_shifts(driverid, status);
CREATE INDEX idx_driver_shifts_org_status ON driver_shifts(organizationId, status);
CREATE INDEX idx_driver_shifts_start_time ON driver_shifts(start_time);

CREATE TABLE driver_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    driverid UUID NOT NULL REFERENCES drivers(id),
    userid UUID NOT NULL REFERENCES users(id),
    start_time BIGINT NOT NULL,
    end_time BIGINT NOT NULL,
    type driver_schedule_type NOT NULL,
    status driver_schedule_status NOT NULL DEFAULT 'scheduled',
    trip_info JSONB,
    reason TEXT,
    driver_feedback JSONB,
    map_data JSONB,
    driver_notes TEXT,
    arrived_at BIGINT,
    passenger_picked_up_at BIGINT,
    wait_time_minutes NUMERIC(5,2),
    eta_minutes NUMERIC(5,2),
    eta_updated_at BIGINT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_driver_schedules_org ON driver_schedules(organizationId);
CREATE INDEX idx_driver_schedules_driver ON driver_schedules(driverid);
CREATE INDEX idx_driver_schedules_driver_time ON driver_schedules(driverid, start_time);
CREATE INDEX idx_driver_schedules_user ON driver_schedules(userid);
CREATE INDEX idx_driver_schedules_status ON driver_schedules(status);

CREATE TABLE driver_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    requesterid UUID NOT NULL REFERENCES users(id),
    driverid UUID NOT NULL REFERENCES drivers(id),
    start_time BIGINT NOT NULL,
    end_time BIGINT NOT NULL,
    trip_from VARCHAR(255) NOT NULL,
    trip_to VARCHAR(255) NOT NULL,
    trip_purpose TEXT NOT NULL,
    passenger_count INTEGER NOT NULL,
    trip_notes TEXT,
    pickup_coords JSONB,
    dropoff_coords JSONB,
    priority trip_priority,
    business_justification TEXT,
    trip_category trip_category,
    cost_center VARCHAR(100),
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at BIGINT,
    status driver_request_status NOT NULL DEFAULT 'pending',
    decline_reason TEXT,
    reviewed_at BIGINT,
    passenger_rated BOOLEAN DEFAULT false,
    cancelled_at BIGINT,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_driver_requests_org ON driver_requests(organizationId);
CREATE INDEX idx_driver_requests_requester ON driver_requests(requesterid);
CREATE INDEX idx_driver_requests_driver ON driver_requests(driverid);
CREATE INDEX idx_driver_requests_status ON driver_requests(status);
CREATE INDEX idx_driver_requests_org_status ON driver_requests(organizationId, status);
CREATE INDEX idx_driver_requests_priority ON driver_requests(priority);
CREATE INDEX idx_driver_requests_requires_approval ON driver_requests(requires_approval);

CREATE TABLE calendar_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    ownerid UUID NOT NULL REFERENCES users(id),
    viewerid UUID NOT NULL REFERENCES users(id),
    access_level calendar_access_level NOT NULL DEFAULT 'busy_only',
    granted_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    expires_at BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_calendar_access_org ON calendar_access(organizationId);
CREATE INDEX idx_calendar_access_owner ON calendar_access(ownerid);
CREATE INDEX idx_calendar_access_viewer ON calendar_access(viewerid);
CREATE INDEX idx_calendar_access_owner_viewer ON calendar_access(ownerid, viewerid);

CREATE TABLE recurring_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id),
    driverid UUID NOT NULL REFERENCES drivers(id),
    trip_from VARCHAR(255) NOT NULL,
    trip_to VARCHAR(255) NOT NULL,
    trip_purpose TEXT NOT NULL,
    passenger_count INTEGER NOT NULL,
    trip_notes TEXT,
    pickup_coords JSONB,
    dropoff_coords JSONB,
    schedule_days_of_week INTEGER[] NOT NULL,
    schedule_start_time TIME NOT NULL,
    schedule_end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_generated_at BIGINT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_recurring_trips_user ON recurring_trips(userid);
CREATE INDEX idx_recurring_trips_org_active ON recurring_trips(organizationId, is_active);

CREATE TABLE favorite_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id),
    driverid UUID NOT NULL REFERENCES drivers(id),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_favorite_drivers_user ON favorite_drivers(userid);
CREATE INDEX idx_favorite_drivers_user_driver ON favorite_drivers(userid, driverid);

CREATE TABLE passenger_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    scheduleid UUID NOT NULL REFERENCES driver_schedules(id),
    requestid UUID REFERENCES driver_requests(id),
    passengerid UUID NOT NULL REFERENCES users(id),
    driverid UUID NOT NULL REFERENCES drivers(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_passenger_ratings_schedule ON passenger_ratings(scheduleid);
CREATE INDEX idx_passenger_ratings_passenger ON passenger_ratings(passengerid);
CREATE INDEX idx_passenger_ratings_driver ON passenger_ratings(driverid);

-- =====================================================
-- TASKS
-- =====================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID NOT NULL REFERENCES users(id),
    assigned_by UUID NOT NULL REFERENCES users(id),
    status task_status NOT NULL DEFAULT 'pending',
    priority task_priority NOT NULL DEFAULT 'medium',
    deadline BIGINT,
    completed_at BIGINT,
    tags TEXT[],
    attachment_url TEXT,
    attachments JSONB,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_tasks_org ON tasks(organizationId);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX idx_tasks_org_deadline ON tasks(organizationId, deadline);

CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taskid UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    authorid UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_task_comments_task ON task_comments(taskid);

-- =====================================================
-- EVENTS
-- =====================================================

CREATE TABLE company_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date BIGINT NOT NULL,
    end_date BIGINT NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    required_departments TEXT[] NOT NULL DEFAULT '{}',
    required_employeeids UUID[],
    event_type event_type NOT NULL,
    priority event_priority,
    created_by UUID NOT NULL REFERENCES users(id),
    notify_days_before INTEGER,
    notified_at BIGINT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_events_org ON company_events(organizationId);
CREATE INDEX idx_events_date ON company_events(start_date);
CREATE INDEX idx_events_org_date ON company_events(organizationId, start_date);
CREATE INDEX idx_events_priority ON company_events(priority);

-- =====================================================
-- PRODUCTIVITY
-- =====================================================

CREATE TABLE work_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    working_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_work_schedules_org ON work_schedules(organizationId);
CREATE INDEX idx_work_schedules_user ON work_schedules(userid);

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userid UUID NOT NULL REFERENCES users(id),
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_user_prefs_user ON user_preferences(userid);
CREATE INDEX idx_user_prefs_user_key ON user_preferences(userid, key);

CREATE TABLE pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userid UUID NOT NULL REFERENCES users(id),
    taskid UUID REFERENCES tasks(id),
    start_time BIGINT NOT NULL,
    end_time BIGINT NOT NULL,
    duration INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    interrupted BOOLEAN NOT NULL DEFAULT false,
    actual_end_time BIGINT
);

CREATE INDEX idx_pomodoro_user ON pomodoro_sessions(userid);
CREATE INDEX idx_pomodoro_user_active ON pomodoro_sessions(userid, completed, interrupted);

-- =====================================================
-- SETTINGS
-- =====================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID REFERENCES organizations(id),
    stripe_customerid VARCHAR(255) NOT NULL UNIQUE,
    stripe_subscriptionid VARCHAR(255) NOT NULL UNIQUE,
    stripe_sessionid VARCHAR(255),
    plan subscription_plan NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    email VARCHAR(255),
    userid UUID REFERENCES users(id),
    current_period_start BIGINT,
    current_period_end BIGINT,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    trial_end BIGINT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_subscriptions_org ON subscriptions(organizationId);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customerid);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscriptionid);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_user ON subscriptions(userid);
CREATE INDEX idx_subscriptions_email ON subscriptions(email);

CREATE TABLE contact_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    team_size VARCHAR(50),
    message TEXT NOT NULL,
    plan VARCHAR(50),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_contact_inquiries_created ON contact_inquiries(created_at);

CREATE TABLE maintenance_mode (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    is_active BOOLEAN NOT NULL DEFAULT false,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    estimated_duration VARCHAR(50),
    icon VARCHAR(50),
    enabled_by UUID NOT NULL REFERENCES users(id),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_maintenance_org ON maintenance_mode(organizationId);
CREATE INDEX idx_maintenance_active ON maintenance_mode(is_active);

CREATE TABLE scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    function_name VARCHAR(255) NOT NULL,
    schedule VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run BIGINT,
    next_run BIGINT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_scheduled_jobs_org ON scheduled_jobs(organizationId);
CREATE INDEX idx_scheduled_jobs_org_active ON scheduled_jobs(organizationId, is_active);
CREATE INDEX idx_scheduled_jobs_function ON scheduled_jobs(function_name);

-- =====================================================
-- CORPORATE, CONFLICTS, AI, ANALYTICS
-- =====================================================

CREATE TABLE corporate_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_corporate_docs_org ON corporate_documents(organizationId);
CREATE INDEX idx_corporate_docs_type ON corporate_documents(document_type);

CREATE TABLE conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    parties UUID[] NOT NULL,
    reported_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at BIGINT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_conflicts_org ON conflicts(organizationId);
CREATE INDEX idx_conflicts_status ON conflicts(status);
CREATE INDEX idx_conflicts_reported_by ON conflicts(reported_by);

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    userid UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    model VARCHAR(50) NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_ai_conversations_org ON ai_conversations(organizationId);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(userid);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversationid UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversationid);

CREATE TABLE analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizationId UUID NOT NULL REFERENCES organizations(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(15,2) NOT NULL,
    period_start BIGINT NOT NULL,
    period_end BIGINT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE INDEX idx_analytics_org ON analytics_snapshots(organizationId);
CREATE INDEX idx_analytics_metric ON analytics_snapshots(metric_name);
CREATE INDEX idx_analytics_period ON analytics_snapshots(period_start, period_end);

-- =====================================================
-- RLS POLICIES FOR ALL NEW TABLES
-- =====================================================

ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE passenger_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Employee policies
CREATE POLICY "Users can view employee profiles in their org" ON employee_profiles
    FOR SELECT USING (
        organizationId IN (SELECT organizationId FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage employee profiles" ON employee_profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );

-- Driver policies
CREATE POLICY "Users can view drivers in their org" ON drivers
    FOR SELECT USING (
        organizationId IN (SELECT organizationId FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage drivers" ON drivers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );

-- Task policies
CREATE POLICY "Users can view tasks assigned to them or in their org" ON tasks
    FOR SELECT USING (
        assigned_to = auth.uid()
        OR organizationId IN (SELECT organizationId FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can create tasks" ON tasks
    FOR INSERT WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Users can update tasks assigned to them" ON tasks
    FOR UPDATE USING (
        assigned_to = auth.uid()
        OR assigned_by = auth.uid()
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );

-- Event policies
CREATE POLICY "Users can view events in their org" ON company_events
    FOR SELECT USING (
        organizationId IN (SELECT organizationId FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage events" ON company_events
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );

-- Subscription policies
CREATE POLICY "Users can view their org subscription" ON subscriptions
    FOR SELECT USING (
        organizationId IN (SELECT organizationId FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage subscriptions" ON subscriptions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );

-- AI conversation policies
CREATE POLICY "Users can view their own AI conversations" ON ai_conversations
    FOR SELECT USING (userid = auth.uid());

CREATE POLICY "Users can create AI conversations" ON ai_conversations
    FOR INSERT WITH CHECK (userid = auth.uid());

CREATE POLICY "Users can update their AI conversations" ON ai_conversations
    FOR UPDATE USING (userid = auth.uid());

CREATE POLICY "Users can delete their AI conversations" ON ai_conversations
    FOR DELETE USING (userid = auth.uid());

-- AI message policies
CREATE POLICY "Users can view messages in their conversations" ON ai_messages
    FOR SELECT USING (
        conversationid IN (SELECT id FROM ai_conversations WHERE userid = auth.uid())
    );

CREATE POLICY "Users can insert messages in their conversations" ON ai_messages
    FOR INSERT WITH CHECK (
        conversationid IN (SELECT id FROM ai_conversations WHERE userid = auth.uid())
    );

-- Analytics policies
CREATE POLICY "Admins can view analytics" ON analytics_snapshots
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'supervisor'))
    );

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_employee_profiles_updated_at
    BEFORE UPDATE ON employee_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_shifts_updated_at
    BEFORE UPDATE ON driver_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_schedules_updated_at
    BEFORE UPDATE ON driver_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_requests_updated_at
    BEFORE UPDATE ON driver_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_events_updated_at
    BEFORE UPDATE ON company_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_schedules_updated_at
    BEFORE UPDATE ON work_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_mode_updated_at
    BEFORE UPDATE ON maintenance_mode
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE employee_profiles IS 'Extended employee profile data';
COMMENT ON TABLE drivers IS 'Driver records with vehicle and availability info';
COMMENT ON TABLE driver_requests IS 'Trip requests from employees';
COMMENT ON TABLE tasks IS 'Task management with assignment and tracking';
COMMENT ON TABLE company_events IS 'Organization-wide events and meetings';
COMMENT ON TABLE subscriptions IS 'Stripe subscription management';
COMMENT ON TABLE ai_conversations IS 'AI chat conversation history';
COMMENT ON TABLE analytics_snapshots IS 'Periodic analytics data snapshots';
