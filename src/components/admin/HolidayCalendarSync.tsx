"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function HolidayCalendarSync() {
  const [isExporting, setIsExporting] = useState(false);
  const calendarData = useQuery(api.admin.getCalendarExportData, {});

  const handleExportICS = async () => {
    if (!calendarData) return;
    
    setIsExporting(true);
    try {
      // Create iCal format
      let icsContent = "BEGIN:VCALENDAR\n";
      icsContent += "VERSION:2.0\n";
      icsContent += "PRODID:-//Office Leave Management//EN\n";
      icsContent += "CALSCALE:GREGORIAN\n";
      icsContent += "METHOD:PUBLISH\n";
      icsContent += "X-WR-CALNAME:Company Leaves\n";
      icsContent += "X-WR-TIMEZONE:UTC\n";

      calendarData.forEach((leave) => {
        const startDate = leave.startDate.replace(/-/g, "");
        const endDate = leave.endDate.replace(/-/g, "");
        const uid = `${leave.id}@office.example.com`;

        icsContent += "BEGIN:VEVENT\n";
        icsContent += `UID:${uid}\n`;
        icsContent += `DTSTART;VALUE=DATE:${startDate}\n`;
        icsContent += `DTEND;VALUE=DATE:${endDate}\n`;
        icsContent += `SUMMARY:${leave.title}\n`;
        icsContent += `DESCRIPTION:${leave.description}\\nDepartment: ${leave.department}\n`;
        icsContent += `LOCATION:${leave.department}\n`;
        icsContent += "STATUS:CONFIRMED\n";
        icsContent += "END:VEVENT\n";
      });

      icsContent += "END:VCALENDAR";

      // Download file
      const blob = new Blob([icsContent], { type: "text/calendar" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `company-leaves-${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("iCal file downloaded successfully");
    } catch (error) {
      toast.error("Failed to export calendar");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGoogleCalendar = () => {
    toast.info("Google Calendar sync will be available soon");
  };

  const handleOutlook = () => {
    toast.info("Outlook sync will be available soon");
  };

  if (!calendarData) {
    return (
      <Card className="border-[var(--border)]">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--text-secondary)]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--border)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Calendar Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4">
          <p className="text-sm text-[var(--text-secondary)]">Upcoming Leaves</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            {calendarData.length}
          </p>
        </div>

        {/* Export Options */}
        <div className="space-y-2">
          <h4 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
            Export Calendar
          </h4>
          
          <Button
            onClick={handleExportICS}
            disabled={isExporting || calendarData.length === 0}
            className="w-full justify-start"
            variant="outline"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download iCal (.ics)
          </Button>

          <Button
            onClick={handleGoogleCalendar}
            className="w-full justify-start"
            variant="outline"
            disabled={calendarData.length === 0}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Sync with Google Calendar
          </Button>

          <Button
            onClick={handleOutlook}
            className="w-full justify-start"
            variant="outline"
            disabled={calendarData.length === 0}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Sync with Outlook
          </Button>
        </div>

        {calendarData.length === 0 && (
          <p className="text-center text-sm text-[var(--text-secondary)]">
            No upcoming leaves to export
          </p>
        )}
      </CardContent>
    </Card>
  );
}
