import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const PLANS: Record<string, { priceId: string; name: string }> = {
  starter:      { priceId: process.env.STRIPE_PRICE_STARTER!,      name: 'Starter' },
  professional: { priceId: process.env.STRIPE_PRICE_PROFESSIONAL!, name: 'Professional' },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json();

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId = PLANS[plan].priceId;
    if (!priceId || priceId.startsWith('prod_')) {
      console.error(`[Stripe Checkout] Invalid price ID for plan "${plan}": "${priceId}". Must be a price_... ID, not a prod_... ID.`);
      return NextResponse.json(
        { error: `Stripe price ID for plan "${plan}" is not configured correctly. Expected a price_... ID.` },
        { status: 500 }
      );
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PLANS[plan].priceId,
          quantity: 1,
        },
      ],
      customer_email: email ?? undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        trial_period_days: 14,
        metadata: { plan },
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${origin}/#pricing`,
      metadata: { plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[Stripe Checkout]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
