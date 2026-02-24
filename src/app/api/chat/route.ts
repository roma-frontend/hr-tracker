import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Remove edge runtime to see better errors
// export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    console.log('🤖 AI Chat request received');
    const { messages, userId } = await req.json();
    console.log('📝 Messages count:', messages.length);

  // Fetch user context
  let userContext = '';
  try {
    const contextRes = await fetch(`${req.headers.get('origin')}/api/chat/context`, {
      headers: {
        cookie: req.headers.get('cookie') || '',
      },
    });
    
    if (contextRes.ok) {
      const context = await contextRes.json();
      userContext = `

USER CONTEXT:
- Name: ${context.user.name}
- Role: ${context.user.role}
- Department: ${context.user.department}

LEAVE BALANCES:
- Paid Leave: ${context.leaveBalances.paid} days
- Sick Leave: ${context.leaveBalances.sick} days
- Family Leave: ${context.leaveBalances.family} days

STATISTICS:
- Total days taken: ${context.stats.totalDaysTaken}
- Pending requests: ${context.stats.pendingDays} days

RECENT LEAVES:
${context.recentLeaves.map((l: any) => `- ${l.type}: ${l.startDate} to ${l.endDate} (${l.status})`).join('\n')}

TEAM AVAILABILITY (Next 30 days):
${context.teamAvailability.map((l: any) => `- ${l.userName} (${l.department}): ${l.startDate} to ${l.endDate}`).join('\n')}
`;
    }
  } catch (error) {
    console.error('Failed to fetch context:', error);
  }

    console.log('🧠 Calling Groq AI...');
    
    // Ensure API key is available
    const apiKey = process.env.GROQ_API_KEY;
    console.log('🔑 API Key available:', !!apiKey, 'Length:', apiKey?.length);
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    
    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an HR AI assistant for an office leave monitoring system.${userContext}
${userId ? `CURRENT USER ID: ${userId}` : ''}

Your role is to help employees with:
- Information about their leave balances (use the data above!)
- Questions about leave policies
- Recommendations for optimal leave dates
- Information about team availability
- General HR questions
- **BOOKING LEAVES, SICK DAYS, VACATIONS** — you can submit requests on behalf of the employee!

BOOKING LEAVES:
When a user asks to book/reserve/schedule any type of leave (vacation, sick day, day off, family leave, doctor appointment, etc.),
you MUST respond with a special JSON action block at the END of your message, like this:

<ACTION>
{
  "type": "BOOK_LEAVE",
  "leaveType": "paid|sick|family|unpaid|doctor",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "days": <number>,
  "reason": "<reason from user>"
}
</ACTION>

Leave types mapping:
- vacation / отпуск / holiday = "paid"
- sick / больничный / болею = "sick"
- family / семейный / family leave = "family"
- doctor / врач / medical = "doctor"
- unpaid / без сохранения = "unpaid"

IMPORTANT:
- Always use the USER CONTEXT data when answering questions about the user's leave balance
- Be specific with numbers from the context
- Check if user has enough balance before booking
- Mention team members on leave when relevant
- Be helpful, concise, and professional
- Use emojis occasionally to be friendly 😊
- **ALWAYS respond in the same language as the user's question** (if they ask in Russian, respond in Russian; if English, respond in English)
- All leave requests go to admin for approval — inform the user about this
- If dates are not specified, ask the user for them before booking

When user asks about their leave balance, you MUST use the exact numbers from LEAVE BALANCES above.
When user asks who's on leave, you MUST check TEAM AVAILABILITY above.`,
      messages,
    });

    console.log('✅ OpenAI response received');
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('❌ Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
