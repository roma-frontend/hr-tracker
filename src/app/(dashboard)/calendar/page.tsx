"use client";

import dynamic from "next/dynamic";

// CalendarClient pulls @fullcalendar which is ~300KB — lazy load it
const CalendarClient = dynamic(
  () => import("@/components/calendar/CalendarClient"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-white/5" />
        <div className="h-[600px] rounded-2xl bg-white/5" />
      </div>
    ),
  }
);

export default function CalendarPage() {
  return <CalendarClient />;
}
