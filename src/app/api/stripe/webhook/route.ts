import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const resend = new Resend(process.env.RESEND_API_KEY!);

// ── Send notification email to manager ────────────────────────────────────────
async function notifyManager({
  email,
  plan,
  subscriptionId,
  trialEnd,
}: {
  email: string;
  plan: string;
  subscriptionId: string;
  trialEnd?: number;
}) {
  const managerEmail = process.env.MANAGER_EMAIL;
  if (!managerEmail) {
    console.warn('[Stripe Webhook] MANAGER_EMAIL not set, skipping notification');
    return;
  }

  const planLabels: Record<string, string> = {
    starter:      'Starter ($29/mo)',
    professional: 'Professional ($79/mo)',
    enterprise:   'Enterprise (Custom)',
  };

  const trialEndStr = trialEnd
    ? new Date(trialEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL ?? 'notifications@yourdomain.com',
    to:      managerEmail,
    subject: `🎉 New subscription: ${planLabels[plan] ?? plan} — ${email}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">New Subscription 🎉</h2>
        <p style="color: #64748b; margin-bottom: 24px;">A new customer has started a free trial.</p>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 40%;">Customer email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">
              <a href="mailto:${email}" style="color: #3b82f6;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Plan</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">${planLabels[plan] ?? plan}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Trial ends</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${trialEndStr}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b;">Subscription ID</td>
            <td style="padding: 10px 0; color: #94a3b8; font-size: 13px; font-family: monospace;">${subscriptionId}</td>
          </tr>
        </table>

        <div style="margin-top: 28px; padding: 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
          <p style="margin: 0; color: #166534; font-size: 14px;">
            💡 <strong>Action needed:</strong> Contact the customer within 24h to onboard them and offer assistance.
          </p>
        </div>

        <p style="margin-top: 24px; color: #94a3b8; font-size: 12px;">
          This notification was sent automatically by your Stripe webhook.
        </p>
      </div>
    `,
  });

  console.log('[Stripe Webhook] ✉️ Manager notification sent to:', managerEmail);
}

// ── Plan resolution from Stripe Price ID ──────────────────────────────────────
function resolvePlan(priceId: string): 'starter' | 'professional' | 'enterprise' {
  if (priceId === process.env.STRIPE_PRICE_STARTER)      return 'starter';
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) return 'professional';
  return 'starter';
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── New successful checkout ───────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Stripe] ✅ checkout.session.completed:', session.id);

        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;

          // Fetch full subscription details from Stripe
          const sub = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price'],
          });

          const priceId = sub.items.data[0]?.price?.id ?? '';
          const plan    = session.metadata?.plan as 'starter' | 'professional' | 'enterprise'
                          ?? resolvePlan(priceId);

          await convex.mutation(api.subscriptions.upsertSubscription, {
            stripeCustomerId:     typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
            stripeSubscriptionId: sub.id,
            stripeSessionId:      session.id,
            plan,
            status:               sub.status as any,
            email:                session.customer_email ?? undefined,
            currentPeriodStart:   (sub as any).current_period_start * 1000,
            currentPeriodEnd:     (sub as any).current_period_end   * 1000,
            cancelAtPeriodEnd:    sub.cancel_at_period_end,
            trialEnd:             sub.trial_end ? sub.trial_end * 1000 : undefined,
          });

          console.log('[Stripe] ✅ Subscription saved to Convex:', sub.id, '| plan:', plan);

          // ── Notify manager via email ──────────────────────────────────────
          const customerEmail = session.customer_email ?? (session.customer_details as any)?.email;
          if (customerEmail) {
            await notifyManager({
              email:          customerEmail,
              plan,
              subscriptionId: sub.id,
              trialEnd:       sub.trial_end ? sub.trial_end * 1000 : undefined,
            });
          }
        }
        break;
      }

      // ── Subscription updated (renewal, plan change, cancel toggle) ────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        console.log('[Stripe] 🔄 subscription.updated:', sub.id, '| status:', sub.status);

        await convex.mutation(api.subscriptions.updateSubscriptionStatus, {
          stripeSubscriptionId: sub.id,
          status:               sub.status as any,
          cancelAtPeriodEnd:    sub.cancel_at_period_end,
          currentPeriodStart:   (sub as any).current_period_start * 1000,
          currentPeriodEnd:     (sub as any).current_period_end   * 1000,
        });
        break;
      }

      // ── Subscription cancelled ────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        console.log('[Stripe] ❌ subscription.deleted:', sub.id);

        await convex.mutation(api.subscriptions.updateSubscriptionStatus, {
          stripeSubscriptionId: sub.id,
          status:               'canceled',
          cancelAtPeriodEnd:    false,
        });
        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId   = typeof (invoice as any).subscription === 'string'
          ? (invoice as any).subscription
          : (invoice as any).subscription?.id;
        console.log('[Stripe] ⚠️ invoice.payment_failed:', invoice.id, '| sub:', subId);

        if (subId) {
          await convex.mutation(api.subscriptions.updateSubscriptionStatus, {
            stripeSubscriptionId: subId,
            status:               'past_due',
            cancelAtPeriodEnd:    false,
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (err: any) {
    console.error('[Stripe Webhook] Handler error:', err.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
