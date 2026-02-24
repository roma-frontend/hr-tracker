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
    
    // Fetch AI insights (patterns, best dates, balance warnings)
    let aiInsights = '';
    try {
      const insightsRes = await fetch(`${req.headers.get('origin')}/api/chat/insights${userId ? `?userId=${userId}` : ''}`, {
        headers: { cookie: req.headers.get('cookie') || '' },
      });
      if (insightsRes.ok) {
        const insights = await insightsRes.json();
        if (insights) {
          aiInsights = `

AI INSIGHTS FOR THIS EMPLOYEE:
${insights.balanceWarning ? `⚠️ BALANCE WARNING: ${insights.balanceWarning}` : ''}
${insights.patterns?.length ? `📊 ATTENDANCE PATTERNS:\n${insights.patterns.map((p: string) => `- ${p}`).join('\n')}` : ''}
${insights.bestDates?.length ? `📅 RECOMMENDED VACATION DATES (no team conflicts):\n${insights.bestDates.map((d: string) => `- ${d}`).join('\n')}` : ''}
${insights.teamConflicts?.length ? `⚠️ TEAM CONFLICTS (people already on leave):\n${insights.teamConflicts.map((c: string) => `- ${c}`).join('\n')}` : ''}
`;
        }
      }
    } catch (e) {
      // silently ignore
    }

    // Fetch FULL SYSTEM CONTEXT — all employees, leaves, calendar, attendance
    let fullContext = '';
    try {
      const fullRes = await fetch(`${req.headers.get('origin')}/api/chat/full-context`, {
        headers: { cookie: req.headers.get('cookie') || '' },
      });
      if (fullRes.ok) {
        const data = await fullRes.json();
        
        // Build employees info
        const employeesInfo = (data.employees ?? []).map((e: any) => {
          const lines = [`👤 ${e.name} (${e.role}, ${e.department ?? 'No dept'}, ${e.position ?? 'No position'})`];
          if (e.todayStatus) {
            lines.push(`  Today: ${e.todayStatus.status} | In: ${e.todayStatus.checkIn ?? '—'} | Out: ${e.todayStatus.checkOut ?? '—'}${e.todayStatus.isLate ? ` | LATE by ${e.todayStatus.lateMinutes}min` : ''} | Worked: ${e.todayStatus.workedHours ?? '—'}h`);
          } else {
            lines.push(`  Today: not checked in`);
          }
          if (e.currentLeave) {
            lines.push(`  🏖 ON LEAVE NOW: ${e.currentLeave.type} (${e.currentLeave.startDate} → ${e.currentLeave.endDate})`);
          }
          if (e.upcomingLeaves?.length) {
            e.upcomingLeaves.forEach((l: any) => {
              lines.push(`  📅 Upcoming: ${l.type} ${l.startDate} → ${l.endDate}`);
            });
          }
          if (e.pendingLeaves?.length) {
            e.pendingLeaves.forEach((l: any) => {
              lines.push(`  ⏳ Pending approval: ${l.type} ${l.startDate} → ${l.endDate} (${l.days} days)`);
            });
          }
          lines.push(`  Leave balance: Paid: ${e.leaveBalance?.paid ?? '?'}d, Sick: ${e.leaveBalance?.sick ?? '?'}d, Family: ${e.leaveBalance?.family ?? '?'}d`);
          return lines.join('\n');
        }).join('\n\n');

        // Calendar events next 90 days
        const calendarInfo = (data.calendarEvents ?? []).map((ev: any) =>
          `  📅 ${ev.employee} (${ev.department}): ${ev.type} ${ev.startDate} → ${ev.endDate} (${ev.days} days)`
        ).join('\n');

        // Today's attendance
        const attendanceInfo = (data.todayAttendance ?? []).map((t: any) =>
          `  ${t.status === 'checked_in' ? '🟢' : t.status === 'checked_out' ? '🔵' : '🔴'} ${t.name} (${t.department}): ${t.checkIn ?? '—'} → ${t.checkOut ?? 'still working'}${t.isLate ? ` [LATE ${t.lateMinutes}min]` : ''}`
        ).join('\n');

        fullContext = `

=== COMPLETE SYSTEM DATA ===

TOTAL EMPLOYEES: ${data.totalEmployees ?? 0}
CURRENTLY AT WORK TODAY: ${data.currentlyAtWork ?? 0}
ON LEAVE TODAY: ${data.onLeaveToday ?? 0}

ALL EMPLOYEES (with today's status, leaves, balances):
${employeesInfo || 'No employees found'}

TODAY'S ATTENDANCE:
${attendanceInfo || 'No attendance records today'}

CALENDAR — APPROVED LEAVES (next 90 days):
${calendarInfo || 'No upcoming approved leaves'}
`;
      }
    } catch (e) {
      console.error('Failed to fetch full context:', e);
    }

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an HR AI assistant for an office leave monitoring system with FULL ACCESS to all company data.
${userContext}${aiInsights}${fullContext}
${userId ? `CURRENT USER ID: ${userId}` : ''}

Your role is to help employees and admins with:
- Information about ANY employee's leave balances, attendance, schedule
- Questions about leave policies
- Recommendations for optimal leave dates
- Information about team availability and calendar
- General HR questions
- **BOOKING LEAVES, SICK DAYS, VACATIONS** — you can submit requests on behalf of the employee!
- Answering questions like "Is John in today?", "When is Anna on vacation?", "Who is on leave this week?"

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

SMART RECOMMENDATIONS:
- When user asks for best dates → use RECOMMENDED VACATION DATES from AI INSIGHTS
- When user wants to book → proactively mention any TEAM CONFLICTS
- When BALANCE WARNING exists → always mention it proactively
- When a leave is rejected → suggest alternative dates

IMPORTANT:
- You have FULL ACCESS to all employee data — use it to answer any question about any employee
- Always use exact numbers and names from the data above
- Check if user has enough balance before booking
- Be helpful, concise, and professional
- Use emojis occasionally to be friendly 😊
- **ALWAYS respond in the same language as the user's question**
- All leave requests go to admin for approval — inform the user about this
- If dates are not specified, ask the user for them before booking

When asked about specific employees, use the COMPLETE SYSTEM DATA above to give precise answers.`,
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
