/**
 * Telegram Bot Notification Utility
 * Sends messages to a Telegram chat via Bot API
 */

const TELEGRAM_API = 'https://api.telegram.org/bot';

export async function sendTelegramNotification(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return false;

  try {
    const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
