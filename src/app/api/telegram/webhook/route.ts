import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const REPLIES = {
  en: {
    subscribed: '🎉 Subscribed! Every Monday you will receive an AI-generated HR digest.',
    already: '✅ You are already subscribed to HR Office Weekly Digest!',
    stopped: '👋 Unsubscribed. Send /start to subscribe again.',
    help: '📬 <b>HR Office Newsletter Bot</b>\n\n/start — subscribe\n/stop — unsubscribe\n/lang [en|ru] — change language\n/topics — choose topics\n/pause [1-4] — pause for N weeks\n/digest — get latest digest now\n/invite — get referral link',
    langUpdated: '✅ Language updated to: ',
    topicsPrompt:
      '📋 Send topics separated by comma:\nhr-tips, leadership, wellness, tech\n\nExample: /topics hr-tips, tech',
    topicsUpdated: '✅ Topics updated!',
    paused: '⏸ Paused for {n} weeks. Will resume automatically.',
    pauseHelp: 'Usage: /pause 2 (pause for 2 weeks)',
    digestSending: '⏳ Generating your personal digest...',
    inviteMsg:
      '🎁 Share your referral link:\n\nhttps://t.me/hremailbot?start=ref_{code}\n\nReferrals: {count}',
  },
  ru: {
    subscribed: '🎉 Подписка оформлена! Каждый понедельник — AI-дайджест.',
    already: '✅ Вы уже подписаны!',
    stopped: '👋 Отписаны. /start чтобы вернуться.',
    help: '📬 <b>HR Office Newsletter Bot</b>\n\n/start — подписаться\n/stop — отписаться\n/lang [en|ru] — сменить язык\n/topics — выбрать темы\n/pause [1-4] — пауза на N недель\n/digest — получить дайджест сейчас\n/invite — реферальная ссылка',
    langUpdated: '✅ Язык изменён на: ',
    topicsPrompt:
      '📋 Отправьте темы через запятую:\nhr-tips, leadership, wellness, tech\n\nПример: /topics hr-tips, tech',
    topicsUpdated: '✅ Темы обновлены!',
    paused: '⏸ Пауза на {n} нед. Возобновится автоматически.',
    pauseHelp: 'Использование: /pause 2 (пауза на 2 недели)',
    digestSending: '⏳ Генерирую ваш персональный дайджест...',
    inviteMsg:
      '🎁 Ваша реферальная ссылка:\n\nhttps://t.me/hremailbot?start=ref_{code}\n\nПриглашено: {count}',
  },
} as Record<string, Record<string, string>>;

function detectLanguage(langCode: string): 'en' | 'ru' | 'hy' | 'deu' {
  const map: Record<string, 'en' | 'ru' | 'hy' | 'deu'> = { ru: 'ru', hy: 'hy', de: 'deu' };
  return map[langCode.slice(0, 2)] || 'en';
}

async function sendReply(token: string, chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return NextResponse.json({ ok: true });

    // Handle poll callback (inline button press)
    if (body.callback_query) {
      const cb = body.callback_query;
      const chatId = String(cb.message?.chat?.id || '');
      const data = cb.data || '';
      const match = data.match(/^poll_(.+)_(\d+)$/);
      if (match && chatId) {
        const result = await convex.mutation(api.newsletter.votePoll, {
          pollId: match[1] as any,
          chatId,
          optionIndex: parseInt(match[2]!),
        });
        const answer = result.success
          ? `✅ Vote recorded! (${result.totalVotes} total votes)`
          : result.error === 'already_voted'
            ? '⚠️ You already voted!'
            : '❌ Poll closed';
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: cb.id, text: answer }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    if (!message?.text || !message?.chat) return NextResponse.json({ ok: true });

    const chatId = String(message.chat.id);
    const text = message.text.trim();
    const firstName = message.from?.first_name || '';
    const language = detectLanguage(message.from?.language_code || 'en');

    const r = REPLIES[language] || REPLIES.en!;
    const cmd = text.split(' ')[0]!.toLowerCase();
    const arg = text.slice(cmd.length).trim();

    let reply = '';

    switch (cmd) {
      case '/start': {
        // Check if referral
        const refMatch = arg.match(/^ref_(.+)$/);
        if (refMatch) {
          await convex.mutation(api.newsletter.subscribeTelegram, {
            chatId,
            name: firstName || undefined,
            language,
          });
          await convex.mutation(api.newsletter.trackReferral, {
            chatId,
            referrerCode: refMatch[1]!,
          });
        } else {
          const result = await convex.mutation(api.newsletter.subscribeTelegram, {
            chatId,
            name: firstName || undefined,
            language,
          });
          reply = result.alreadySubscribed ? r.already! : r.subscribed!;
        }
        if (!reply) reply = r.subscribed!;
        break;
      }
      case '/stop':
        await convex.mutation(api.newsletter.unsubscribeTelegram, { chatId });
        reply = r.stopped!;
        break;
      case '/lang': {
        const validLangs = ['en', 'ru', 'hy', 'deu'];
        const newLang = arg.toLowerCase();
        if (validLangs.includes(newLang)) {
          await convex.mutation(api.newsletter.updateLanguage, {
            chatId,
            language: newLang as any,
          });
          reply = r.langUpdated! + newLang;
        } else {
          reply = 'Available: en, ru, hy, deu\nExample: /lang ru';
        }
        break;
      }
      case '/topics': {
        if (!arg) {
          reply = r.topicsPrompt!;
          break;
        }
        const valid = ['hr-tips', 'leadership', 'wellness', 'tech'];
        const topics = arg
          .split(',')
          .map((t: string) => t.trim().toLowerCase())
          .filter((t: string) => valid.includes(t));
        if (topics.length > 0) {
          await convex.mutation(api.newsletter.updateTopics, { chatId, topics: topics as any });
          reply = r.topicsUpdated! + '\n' + topics.join(', ');
        } else {
          reply = r.topicsPrompt!;
        }
        break;
      }
      case '/pause': {
        const weeks = parseInt(arg);
        if (weeks >= 1 && weeks <= 4) {
          await convex.mutation(api.newsletter.pauseSubscription, { chatId, weeks });
          reply = r.paused!.replace('{n}', String(weeks));
        } else {
          reply = r.pauseHelp!;
        }
        break;
      }
      case '/digest':
        reply = r.digestSending!;
        await sendReply(token, chatId, reply);
        // Trigger digest generation async (fire and forget via fetch to self)
        try {
          const sub = await convex.query(api.newsletter.getSubscriberPublic, { chatId });
          if (sub) {
            const content = await convex.action(api.newsletter.sendTestTelegram, {
              chatId,
              language: sub.language,
            });
            return NextResponse.json({ ok: true });
          }
        } catch {
          /* ignore errors, user already got "generating" message */
        }
        return NextResponse.json({ ok: true });
      case '/invite': {
        const sub = await convex.query(api.newsletter.getSubscriberPublic, { chatId });
        const code = sub?.referralCode || chatId;
        const count = sub?.referralCount || 0;
        reply = r.inviteMsg!.replace('{code}', code).replace('{count}', String(count));
        break;
      }
      default:
        reply = r.help!;
    }

    await sendReply(token, chatId, reply);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
