/**
 * AI Assistant Router - Intelligent request processing based on user roles
 * 
 * This module provides role-based context and permissions for the AI assistant
 * to ensure each user gets appropriate responses and capabilities based on their role.
 */

export type UserRole = 'superadmin' | 'admin' | 'supervisor' | 'employee';

export interface UserContext {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  department?: string;
  position?: string;
}

export interface AICapability {
  id: string;
  name: string;
  description: string;
  requiredRole: UserRole[];
  keywords: string[];
  action?: string; // navigation or action to perform
}

/**
 * Define capabilities available to each role
 */
export const AI_CAPABILITIES: AICapability[] = [
  // ═══════════════════════════════════════════════════════════════
  // EMPLOYEE CAPABILITIES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'view_calendar',
    name: 'View Calendar',
    description: 'Open and view the team calendar',
    requiredRole: ['employee', 'supervisor', 'admin', 'superadmin'],
    keywords: ['calendar', 'календарь', 'покажи календарь', 'show calendar', 'открой календарь', 'open calendar'],
    action: '/calendar'
  },
  {
    id: 'view_my_leaves',
    name: 'View My Leaves',
    description: 'Check personal leave requests and balances',
    requiredRole: ['employee', 'supervisor', 'admin', 'superadmin'],
    keywords: ['my leaves', 'мои отпуска', 'мой отпуск', 'my vacation', 'leave balance', 'остаток отпуска'],
    action: '/leaves'
  },
  {
    id: 'book_leave',
    name: 'Book Leave',
    description: 'Request a new leave/vacation',
    requiredRole: ['employee', 'supervisor', 'admin', 'superadmin'],
    keywords: ['book leave', 'забронировать отпуск', 'хочу в отпуск', 'request vacation', 'взять отпуск'],
  },
  {
    id: 'view_tasks',
    name: 'View My Tasks',
    description: 'Check assigned tasks',
    requiredRole: ['employee', 'supervisor', 'admin', 'superadmin'],
    keywords: ['tasks', 'задачи', 'мои задачи', 'my tasks', 'todo', 'что делать'],
    action: '/tasks'
  },
  {
    id: 'view_profile',
    name: 'View Profile',
    description: 'Open user profile settings',
    requiredRole: ['employee', 'supervisor', 'admin', 'superadmin'],
    keywords: ['profile', 'профиль', 'мой профиль', 'my profile', 'settings', 'настройки'],
    action: '/profile'
  },
  {
    id: 'check_attendance',
    name: 'Check In/Out',
    description: 'View attendance and check in/out',
    requiredRole: ['employee', 'supervisor', 'admin', 'superadmin'],
    keywords: ['attendance', 'посещаемость', 'check in', 'отметиться', 'check out'],
    action: '/attendance'
  },
  {
    id: 'view_team',
    name: 'View Team',
    description: 'Check who is available, on leave, or busy',
    requiredRole: ['employee', 'supervisor', 'admin', 'superadmin'],
    keywords: ['team', 'команда', 'коллеги', 'who is available', 'кто на работе', 'кто в отпуске'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SUPERVISOR CAPABILITIES (includes all employee capabilities)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'approve_leaves',
    name: 'Approve Leave Requests',
    description: 'Review and approve team leave requests',
    requiredRole: ['supervisor', 'admin', 'superadmin'],
    keywords: ['approve leaves', 'одобрить отпуска', 'review requests', 'проверить заявки'],
    action: '/approvals'
  },
  {
    id: 'view_team_attendance',
    name: 'View Team Attendance',
    description: 'Monitor team attendance and ratings',
    requiredRole: ['supervisor', 'admin', 'superadmin'],
    keywords: ['team attendance', 'посещаемость команды', 'who is late', 'кто опоздал'],
    action: '/attendance'
  },

  // ═══════════════════════════════════════════════════════════════
  // ADMIN CAPABILITIES (includes all supervisor + employee)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'manage_employees',
    name: 'Manage Employees',
    description: 'Add, edit, or remove employees',
    requiredRole: ['admin', 'superadmin'],
    keywords: ['employees', 'сотрудники', 'add employee', 'добавить сотрудника', 'manage team', 'управление персоналом'],
    action: '/employees'
  },
  {
    id: 'view_analytics',
    name: 'View Analytics',
    description: 'Access HR analytics and reports',
    requiredRole: ['admin', 'superadmin'],
    keywords: ['analytics', 'аналитика', 'reports', 'отчеты', 'статистика', 'statistics'],
    action: '/analytics'
  },
  {
    id: 'approve_join_requests',
    name: 'Approve Join Requests',
    description: 'Review requests to join organization',
    requiredRole: ['admin', 'superadmin'],
    keywords: ['join requests', 'заявки на присоединение', 'new employees', 'новые сотрудники'],
    action: '/join-requests'
  },
  {
    id: 'organization_settings',
    name: 'Organization Settings',
    description: 'Configure organization settings',
    requiredRole: ['admin', 'superadmin'],
    keywords: ['settings', 'настройки организации', 'org settings', 'configure'],
    action: '/settings'
  },
  {
    id: 'view_reports',
    name: 'View Reports',
    description: 'Generate and download reports',
    requiredRole: ['admin', 'superadmin'],
    keywords: ['reports', 'отчеты', 'download report', 'скачать отчет', 'export'],
    action: '/reports'
  },

  // ═══════════════════════════════════════════════════════════════
  // SUPERADMIN CAPABILITIES (platform owner - sees ALL orgs)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'manage_organizations',
    name: 'Manage Organizations',
    description: 'Create and manage all organizations',
    requiredRole: ['superadmin'],
    keywords: ['organizations', 'организации', 'all orgs', 'все организации', 'create org'],
    action: '/superadmin/organizations'
  },
  {
    id: 'approve_org_requests',
    name: 'Approve Organization Requests',
    description: 'Review new organization creation requests',
    requiredRole: ['superadmin'],
    keywords: ['org requests', 'заявки организаций', 'organization requests', 'новые организации'],
    action: '/superadmin/org-requests'
  },
  {
    id: 'security_monitoring',
    name: 'Security Monitoring',
    description: 'Monitor security alerts and suspicious activity',
    requiredRole: ['superadmin'],
    keywords: ['security', 'безопасность', 'alerts', 'оповещения', 'suspicious', 'подозрительная активность'],
    action: '/superadmin/security'
  },
  {
    id: 'stripe_dashboard',
    name: 'Stripe Dashboard',
    description: 'View payment and subscription data',
    requiredRole: ['superadmin'],
    keywords: ['stripe', 'payments', 'платежи', 'subscriptions', 'подписки', 'billing'],
    action: '/superadmin/stripe-dashboard'
  },
  {
    id: 'manage_subscriptions',
    name: 'Manage Subscriptions',
    description: 'Manage organization subscriptions and plans',
    requiredRole: ['superadmin'],
    keywords: ['subscriptions', 'подписки', 'plans', 'тарифы', 'upgrade', 'downgrade'],
    action: '/superadmin/subscriptions'
  },
];

/**
 * Get capabilities available to a specific role
 */
export function getCapabilitiesForRole(role: UserRole): AICapability[] {
  return AI_CAPABILITIES.filter(cap => cap.requiredRole.includes(role));
}

/**
 * Detect intent from user message and return matching capability
 */
export function detectIntent(message: string, userRole: UserRole): AICapability | null {
  const normalizedMessage = message.toLowerCase().trim();
  const availableCapabilities = getCapabilitiesForRole(userRole);

  // Find best matching capability based on keywords
  for (const capability of availableCapabilities) {
    for (const keyword of capability.keywords) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        return capability;
      }
    }
  }

  return null;
}

/**
 * Build AI system prompt based on user context and role
 */
export function buildRoleBasedPrompt(userContext: UserContext, fullContext?: any): string {
  const capabilities = getCapabilitiesForRole(userContext.role);
  
  let prompt = `You are an intelligent HR AI assistant with role-based permissions.

CURRENT USER:
- Name: ${userContext.name}
- Role: ${userContext.role.toUpperCase()}
- Email: ${userContext.email}
- Department: ${userContext.department || 'Not specified'}
- Position: ${userContext.position || 'Not specified'}

ROLE CAPABILITIES:
You can help with the following based on the user's role:
${capabilities.map(cap => `- ${cap.name}: ${cap.description}`).join('\n')}

`;

  // Add role-specific instructions
  switch (userContext.role) {
    case 'superadmin':
      prompt += `
🔴 SUPERADMIN MODE - FULL SYSTEM ACCESS
You have complete access to all organizations, all employees, all data.
You can:
- Manage any organization
- View and modify any employee data across all organizations
- Access security monitoring and alerts
- Manage subscriptions and billing
- Approve organization creation requests
- Execute administrative commands

SECURITY: You are the platform owner (romangulanyan@gmail.com). Be careful with destructive actions.
`;
      break;

    case 'admin':
      prompt += `
🟠 ADMIN MODE - ORGANIZATION MANAGEMENT
You have full access to your organization's data.
You can:
- Manage employees in your organization
- Approve/reject leave requests
- View analytics and reports
- Approve join requests
- Configure organization settings
- Manage tasks and assignments

SCOPE: Your actions are limited to your organization only.
`;
      break;

    case 'supervisor':
      prompt += `
🟡 SUPERVISOR MODE - TEAM MANAGEMENT
You can manage your direct reports.
You can:
- View your team's attendance and leaves
- Approve/reject leave requests from your team
- Assign tasks to team members
- Rate employee performance
- View team analytics

SCOPE: You can only manage employees assigned to you as supervisor.
`;
      break;

    case 'employee':
      prompt += `
🟢 EMPLOYEE MODE - SELF SERVICE
You can manage your own data and requests.
You can:
- View and book your own leaves
- Check your leave balances
- View your tasks and attendance
- Update your profile
- View team calendar and availability

SCOPE: You can only access your own personal data. You cannot modify other employees' information.
`;
      break;
  }

  prompt += `

NATURAL LANGUAGE ACTIONS:
When users ask to do something, intelligently interpret and execute:

NAVIGATION COMMANDS:
- "показать календарь" / "show calendar" / "open calendar" → Navigate to calendar page
- "мои задачи" / "my tasks" / "show tasks" → Navigate to tasks page
- "мой профиль" / "my profile" / "settings" → Navigate to profile page
- "сотрудники" / "employees" / "team" → Navigate to employees page (if admin)
- "аналитика" / "analytics" / "reports" → Navigate to analytics (if admin+)
- "отпуска" / "leaves" / "vacations" → Navigate to leaves page

DATA QUERIES:
- Answer questions about availability, schedules, leave balances
- Provide statistics and insights
- Explain policies and procedures

BOOKING & ACTIONS:
- Book leaves, request time off
- Create tasks, assignments
- Update information (within permissions)

IMPORTANT RULES:
1. **Always respect role permissions** - Don't show data or actions not available to the user's role
2. **Be contextually aware** - Use the provided user and system context
3. **Respond in the user's language** (Russian or English)
4. **For navigation requests** - Clearly indicate you will navigate to the page
5. **For data requests** - Use the provided context to give accurate answers
6. **Be conversational and helpful** - Use emojis occasionally 😊
7. **Proactive suggestions** - Suggest related actions when appropriate

RESPONSE FORMAT:
- For navigation: "Открываю календарь... 📅" / "Opening calendar... 📅" then indicate the action
- For data: Provide clear, formatted answers with relevant details
- For confirmations: Ask before executing destructive actions

${fullContext ? `\nSYSTEM CONTEXT:\n${JSON.stringify(fullContext, null, 2)}` : ''}
`;

  return prompt;
}

/**
 * Check if user has permission for a specific action
 */
export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Get available actions/suggestions based on role
 */
export function getRoleSuggestions(role: UserRole): string[] {
  const allSuggestions: Record<UserRole, string[]> = {
    employee: [
      "Покажи мой календарь",
      "Сколько у меня осталось отпуска?",
      "Кто сегодня на работе?",
      "Мои задачи",
    ],
    supervisor: [
      "Показать заявки на отпуск",
      "Кто из команды опоздал сегодня?",
      "Посещаемость команды",
      "Создать задачу",
    ],
    admin: [
      "Показать аналитику",
      "Список всех сотрудников",
      "Заявки на присоединение",
      "Отчет по отпускам",
    ],
    superadmin: [
      "Все организации",
      "Безопасность",
      "Stripe подписки",
      "Заявки на создание организаций",
    ],
  };

  return allSuggestions[role] || allSuggestions.employee;
}
