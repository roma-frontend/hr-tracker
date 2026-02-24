import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Generate iCal format
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HR Office//Leave Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Employee Leaves
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
UID:leave-001@hroffice.com
DTSTAMP:20260224T000000Z
DTSTART:20260301T000000Z
DTEND:20260305T000000Z
SUMMARY:John Doe - Paid Leave
DESCRIPTION:Approved leave request
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:leave-002@hroffice.com
DTSTAMP:20260224T000000Z
DTSTART:20260310T000000Z
DTEND:20260312T000000Z
SUMMARY:Jane Smith - Sick Leave
DESCRIPTION:Approved leave request
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="holidays.ics"',
      },
    });
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
