import { NextRequest, NextResponse } from "next/server";
import { createOutlookCalendarEvent } from "@/lib/calendar-sync";

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("outlook_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with Outlook Calendar" },
        { status: 401 }
      );
    }

    const { events } = await request.json();

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: "Invalid events data" }, { status: 400 });
    }

    // Create events in Outlook Calendar
    const results = [];
    for (const event of events) {
      try {
        const result = await createOutlookCalendarEvent(accessToken, event);
        results.push({ success: true, eventId: event.id, outlookEventId: result.id });
      } catch (error) {
        results.push({ success: false, eventId: event.id, error: String(error) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Synced ${successCount} events, ${failureCount} failed`,
      results,
    });
  } catch (error) {
    console.error("Outlook Calendar sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync with Outlook Calendar" },
      { status: 500 }
    );
  }
}
