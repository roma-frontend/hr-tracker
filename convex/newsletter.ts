// @ts-nocheck - Convex API types cause TS2589 in complex module graphs
import {
  mutation,
  action,
  internalAction,
  internalQuery,
  internalMutation,
} from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { WeeklyDigestEmail } from '../src/emails/WeeklyDigestEmail';

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('your_api_key')) return null;
  return new Resend(key);
}

async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const subscribe = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    language: v.union(v.literal('en'), v.literal('ru'), v.literal('hy'), v.literal('deu')),
    topics: v.optional(
      v.array(
        v.union(
          v.literal('hr-tips'),
          v.literal('leadership'),
          v.literal('wellness'),
          v.literal('tech'),
        ),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('newsletterSubscribers')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    if (existing) {
      if (existing.unsubscribed) {
        await ctx.db.patch(existing._id, { unsubscribed: false, subscribedAt: Date.now() });
        return { success: true, alreadySubscribed: false };
      }
      return { success: true, alreadySubscribed: true };
    }

    const unsubscribeToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    await ctx.db.insert('newsletterSubscribers', {
      email: args.email,
      name: args.name,
      language: args.language,
      topics: args.topics,
      subscribedAt: Date.now(),
      unsubscribed: false,
      unsubscribeToken,
    });

    return { success: true, alreadySubscribed: false };
  },
});

export const unsubscribe = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db
      .query('newsletterSubscribers')
      .withIndex('by_token', (q) => q.eq('unsubscribeToken', args.token))
      .first();

    if (!subscriber) return { success: false };
    await ctx.db.patch(subscriber._id, { unsubscribed: true });
    return { success: true };
  },
});

export const subscribeTelegram = mutation({
  args: {
    chatId: v.string(),
    name: v.optional(v.string()),
    language: v.union(v.literal('en'), v.literal('ru'), v.literal('hy'), v.literal('deu')),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('newsletterSubscribers')
      .withIndex('by_telegram', (q) => q.eq('telegramChatId', args.chatId))
      .first();

    if (existing) {
      if (existing.unsubscribed) {
        await ctx.db.patch(existing._id, { unsubscribed: false, subscribedAt: Date.now() });
        return { success: true, alreadySubscribed: false };
      }
      return { success: true, alreadySubscribed: true };
    }

    const unsubscribeToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    await ctx.db.insert('newsletterSubscribers', {
      email: `telegram_${args.chatId}@bot`,
      name: args.name,
      language: args.language,
      subscribedAt: Date.now(),
      unsubscribed: false,
      unsubscribeToken,
      telegramChatId: args.chatId,
      channel: 'telegram',
    });

    return { success: true, alreadySubscribed: false };
  },
});

export const unsubscribeTelegram = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query('newsletterSubscribers')
      .withIndex('by_telegram', (q) => q.eq('telegramChatId', args.chatId))
      .first();
    if (!sub || sub.unsubscribed) return { success: false };
    await ctx.db.patch(sub._id, { unsubscribed: true });
    return { success: true };
  },
});

export const getActiveSubscribers = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('newsletterSubscribers')
      .withIndex('by_active', (q) => q.eq('unsubscribed', false))
      .collect();
  },
});

export const generateWeeklyContent = internalAction({
  args: { language: v.optional(v.string()) },
  handler: async (_, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

    const lang = args.language || 'en';
    const langInstruction =
      lang === 'en'
        ? ''
        : ` Write ALL content in ${lang === 'ru' ? 'Russian' : lang === 'hy' ? 'Armenian' : 'German'} language.`;

    const prompt = `Generate a professional HR weekly newsletter in JSON format.${langInstruction} Include:
- subject: catchy email subject line
- greeting: warm opening paragraph
- tips: array of 3 objects with {title, body, emoji} - practical HR tips
- trends: array of 2 objects with {title, body} - current HR industry trends
- quote: object with {text, author} - inspirational leadership quote
- promo: object with {title, body, cta, link} - call to action for HR Office platform

Keep content professional, actionable, and concise. Return ONLY valid JSON.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'HR Office',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: 'You are an HR content expert. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');
    return JSON.parse(jsonMatch[0]);
  },
});

export const sendWeeklyDigest = internalAction({
  args: {},
  handler: async (ctx) => {
    const subscribers = await ctx.runQuery(internal.newsletter.getActiveSubscribers, {});
    if (subscribers.length === 0) {
      console.log('No active subscribers, skipping newsletter');
      return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hr-project-sigma.vercel.app';

    // Group subscribers by language
    const byLang: Record<string, typeof subscribers> = {};
    for (const sub of subscribers) {
      const lang = sub.language || 'en';
      (byLang[lang] ??= []).push(sub);
    }

    for (const [lang, subs] of Object.entries(byLang)) {
      const content = await ctx.runAction(internal.newsletter.generateWeeklyContent, {
        language: lang,
      });

      // Email subscribers
      const emailSubs = subs.filter((s) => !s.telegramChatId || s.channel === 'email');
      const resend = getResendClient();
      if (resend && emailSubs.length > 0) {
        for (let i = 0; i < emailSubs.length; i += 100) {
          const batch = emailSubs.slice(i, i + 100);
          const emails = batch.map((sub) => ({
            from: 'HR Office <onboarding@resend.dev>',
            to: sub.email,
            subject: content.subject,
            html: render(
              WeeklyDigestEmail({
                name: sub.name || 'HR Professional',
                content,
                unsubscribeUrl: `${appUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribeToken}`,
              }),
            ),
          }));
          try {
            await resend.batch.send(emails);
          } catch (e) {
            console.error('Email batch error:', e);
          }
        }
      }

      // Telegram subscribers
      const telegramSubs = subs.filter((s) => s.telegramChatId && s.channel === 'telegram');
      if (telegramSubs.length > 0) {
        const tgMessage = formatTelegramNewsletter(content);
        for (const sub of telegramSubs) {
          await sendTelegramMessage(sub.telegramChatId!, tgMessage);
        }
      }

      // Update lastSentAt
      for (const sub of subs) {
        await ctx.runMutation(internal.newsletter.updateLastSent, { id: sub._id });
      }
    }

    console.log(
      `Newsletter sent to ${subscribers.length} subscribers in ${Object.keys(byLang).length} languages`,
    );
  },
});

export const updateLastSent = internalMutation({
  args: { id: v.id('newsletterSubscribers') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastSentAt: Date.now() });
  },
});

export const sendTestEmail = action({
  args: { email: v.string(), language: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const resend = getResendClient();
    if (!resend) throw new Error('Resend not configured');

    const content = await ctx.runAction(internal.newsletter.generateWeeklyContent, {
      language: args.language,
    });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hr-project-sigma.vercel.app';

    const html = render(
      WeeklyDigestEmail({
        name: 'Test User',
        content,
        unsubscribeUrl: `${appUrl}/api/newsletter/unsubscribe?token=test`,
      }),
    );

    await resend.emails.send({
      from: 'HR Office <onboarding@resend.dev>',
      to: args.email,
      subject: content.subject,
      html,
    });

    return { success: true };
  },
});

function formatTelegramNewsletter(content: any): string {
  let msg = `🏢 <b>HR Office Weekly Digest</b>\n\n`;
  msg += `${content.greeting}\n\n`;
  msg += `💡 <b>Tips of the Week</b>\n`;
  for (const tip of content.tips || []) {
    msg += `\n${tip.emoji} <b>${tip.title}</b>\n${tip.body}\n`;
  }
  msg += `\n📈 <b>HR Trends</b>\n`;
  for (const trend of content.trends || []) {
    msg += `\n• <b>${trend.title}</b>\n${trend.body}\n`;
  }
  if (content.quote) {
    msg += `\n💬 <i>"${content.quote.text}"</i>\n— ${content.quote.author}\n`;
  }
  if (content.promo) {
    msg += `\n🚀 <b>${content.promo.title}</b>\n${content.promo.body}\n`;
    msg += `\n👉 <a href="${content.promo.link}">${content.promo.cta}</a>`;
  }
  return msg;
}

export const sendTestTelegram = action({
  args: { chatId: v.string(), language: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const content = await ctx.runAction(internal.newsletter.generateWeeklyContent, {
      language: args.language,
    });
    const msg = formatTelegramNewsletter(content);
    const ok = await sendTelegramMessage(args.chatId, msg);
    if (!ok) throw new Error('Failed to send Telegram message. Check TELEGRAM_BOT_TOKEN.');
    return { success: true };
  },
});
