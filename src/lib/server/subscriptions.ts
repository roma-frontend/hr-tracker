import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

const SUPERADMIN_EMAIL = 'romangulanyan@gmail.com';

async function verifySuperadmin(userId: string) {
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) throw new Error('User not found');
  if (user.email.toLowerCase() !== SUPERADMIN_EMAIL) {
    throw new Error('Only the superadmin can perform this action');
  }
  return user;
}

export async function listAllWithSubscriptions(superadminUserId: string) {
  await verifySuperadmin(superadminUserId);

  const supabase = await createClient();
  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('*');

  if (error) throw error;

  return Promise.all(
    (subs || []).map(async (sub) => {
      let org: Organization | null = null;
      if (sub.organizationId) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', sub.organizationId)
          .single();
        org = orgData || null;
      }

      const { data: employees } = await supabase
        .from('users')
        .select('*')
        .eq('organizationId', sub.organizationId ?? '');

      const filteredEmployees = (employees || []).filter(
        (e) => e.role !== 'superadmin'
      );

      return {
        ...sub,
        organizationName: org?.name || 'Unknown',
        organizationSlug: org?.slug || '',
        employeeCount: filteredEmployees.length,
        isManual: sub.stripe_customerid.startsWith('manual_'),
        metadata: {
          customPrice: sub.stripe_subscriptionid.includes('manual') ? 49 : undefined,
        },
      };
    })
  );
}

export async function createManualSubscription(args: {
  superadminUserId: string;
  organizationId: string;
  plan: 'starter' | 'professional' | 'enterprise';
  customPrice?: number;
  notes?: string;
}) {
  await verifySuperadmin(args.superadminUserId);

  const supabase = await createClient();
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', args.organizationId)
    .single();

  if (orgError || !org) throw new Error('Organization not found');

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organizationId', args.organizationId)
    .single();

  const now = Math.floor(Date.now() / 1000);
  const oneYearLater = now + 365 * 24 * 60 * 60;

  const subscriptionData = {
    organizationId: args.organizationId,
    plan: args.plan,
    status: 'active' as const,
    stripe_customerid: `manual_${args.organizationId}_${now}`,
    stripe_subscriptionid: `manual_sub_${args.organizationId}_${now}`,
    stripe_sessionid: null,
    current_period_end: oneYearLater,
    current_period_start: now,
    cancel_at_period_end: false,
    created_at: now,
    updated_at: now,
  };

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    result = { success: true, subscriptionId: data.id, action: 'updated' };

    await supabase
      .from('organizations')
      .update({ plan: args.plan })
      .eq('id', args.organizationId);
  } else {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) throw error;
    result = { success: true, subscriptionId: data.id, action: 'created' };

    await supabase
      .from('organizations')
      .update({ plan: args.plan })
      .eq('id', args.organizationId);
  }

  return result;
}

export async function cancelSubscription(args: {
  superadminUserId: string;
  subscriptionId: string;
}) {
  await verifySuperadmin(args.superadminUserId);

  const supabase = await createClient();
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
      updated_at: Math.floor(Date.now() / 1000),
    })
    .eq('id', args.subscriptionId);

  if (error) throw error;
  return { success: true };
}
