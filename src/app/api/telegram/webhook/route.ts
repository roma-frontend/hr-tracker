import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const REPLIES = {
  en: {
    subscribed: '🎉 Subscribed! Every Monday you will receive an AI-generated HR digest.',
    already: '✅ You are already subscribed to HR Office Weekly Digest!',
    stopped: '👋 Unsubscribed. Send /start to subscribe again.',
    help: '📬 <b>HR Office Newsletter Bot</b>\n\n/start — subscribe\n/stop — unsubscribe',
  },
  ru: {
    subscribed:
      '🎉 Подписка оформлена! Каждый понедельник вы будете получать AI-сгенерированный HR дайджест.',
    already: '✅ Вы уже подписаны на HR Office Weekly Digest!',
    stopped: '👋 Вы отписаны от рассылки. Напишите /start чтобы подписаться снова.',
    help: '📬 <b>HR Office Newsletter Bot</b>\n\n/start — подписаться\n/stop — отписаться',
  },
} as Record<string, { subscribed: string; already: string; stopped: string; help: string }>;

function detectLanguage(langCode: string): 'en' | 'ru' | 'hy' | 'deu' {
  const map: Record<string, 'en' | 'ru' | 'hy' | 'deu'> = { ru: 'ru', hy: 'hy', de: 'deu' };
  return map[langCode.slice(0, 2)] || 'en';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;
    if (!message?.text || !message?.chat) return NextResponse.json({ ok: true });

    const chatId = String(message.chat.id);
    const text = message.text.trim();
    const firstName = message.from?.first_name || '';
    const language = detectLanguage(message.from?.language_code || 'en');
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return NextResponse.json({ ok: true });

    const r = REPLIES[language] || REPLIES.en!;
    let reply = '';

    if (text === '/start') {
      const result = await convex.mutation(api.newsletter.subscribeTelegram, {
        chatId,
        name: firstName || undefined,
        language,
      });
      reply = result.alreadySubscribed ? r.already : r.subscribed;
    } else if (text === '/stop') {
      await convex.mutation(api.newsletter.unsubscribeTelegram, { chatId });
      reply = r.stopped;
    } else {
      reply = r.help;
    }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply, parse_mode: 'HTML' }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
