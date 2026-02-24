"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { generateICalendar, downloadICalFile, getGoogleCalendarAuthUrl, getOutlookAuthUrl } from "@/lib/calendar-sync";

export default function HolidayCalendarSync() {
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);
  const [isSyncingOutlook, setIsSyncingOutlook] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const calendarData = useQuery(api.admin.getCalendarExportData, {});

  // Check connection status on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_calendar") === "connected") {
      setGoogleConnected(true);
      toast.success("Successfully connected to Google Calendar!");
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("outlook_calendar") === "connected") {
      setOutlookConnected(true);
      toast.success("Successfully connected to Outlook Calendar!");
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("error")) {
      toast.error("Failed to connect to calendar");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleExportICS = async () => {
    if (!calendarData) return;
    
    setIsExporting(true);
    try {
      const icsContent = generateICalendar(calendarData);
      const filename = `company-leaves-${new Date().toISOString().split('T')[0]}.ics`;
      downloadICalFile(icsContent, filename);
      toast.success("iCal file downloaded successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export calendar");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGoogleCalendar = async () => {
    if (googleConnected) {
      // Already connected, sync events
      if (!calendarData || calendarData.length === 0) {
        toast.info("No events to sync");
        return;
      }

      setIsSyncingGoogle(true);
      try {
        const response = await fetch("/api/calendar/google/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events: calendarData }),
        });

        if (!response.ok) {
          throw new Error("Sync failed");
        }

        const result = await response.json();
        toast.success(result.message);
      } catch (error) {
        console.error("Google sync error:", error);
        toast.error("Failed to sync with Google Calendar");
        setGoogleConnected(false);
      } finally {
        setIsSyncingGoogle(false);
      }
    } else {
      // Need to authenticate
      try {
        const redirectUri = `${window.location.origin}/api/calendar/google/auth`;
        const authUrl = getGoogleCalendarAuthUrl(redirectUri);
        window.location.href = authUrl;
      } catch (error) {
        console.error("Google auth error:", error);
        toast.error("Google Calendar is not configured");
      }
    }
  };

  const handleOutlook = async () => {
    if (outlookConnected) {
      // Already connected, sync events
      if (!calendarData || calendarData.length === 0) {
        toast.info("No events to sync");
        return;
      }

      setIsSyncingOutlook(true);
      try {
        const response = await fetch("/api/calendar/outlook/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events: calendarData }),
        });

        if (!response.ok) {
          throw new Error("Sync failed");
        }

        const result = await response.json();
        toast.success(result.message);
      } catch (error) {
        console.error("Outlook sync error:", error);
        toast.error("Failed to sync with Outlook Calendar");
        setOutlookConnected(false);
      } finally {
        setIsSyncingOutlook(false);
      }
    } else {
      // Need to authenticate
      try {
        const redirectUri = `${window.location.origin}/api/calendar/outlook/auth`;
        const authUrl = getOutlookAuthUrl(redirectUri);
        window.location.href = authUrl;
      } catch (error) {
        console.error("Outlook auth error:", error);
        toast.error("Outlook Calendar is not configured");
      }
    }
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

          <div className="relative">
            <Button
              onClick={handleGoogleCalendar}
              className="w-full justify-start"
              variant="outline"
              disabled={isSyncingGoogle || calendarData.length === 0}
            >
              {isSyncingGoogle ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : googleConnected ? (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              {googleConnected ? "Sync with Google Calendar" : "Connect Google Calendar"}
            </Button>
            {googleConnected && (
              <Badge 
                variant="secondary" 
                className="absolute -right-2 -top-2 bg-green-500 text-white"
              >
                Connected
              </Badge>
            )}
          </div>

          <div className="relative">
            <Button
              onClick={handleOutlook}
              className="w-full justify-start"
              variant="outline"
              disabled={isSyncingOutlook || calendarData.length === 0}
            >
              {isSyncingOutlook ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : outlookConnected ? (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              {outlookConnected ? "Sync with Outlook" : "Connect Outlook"}
            </Button>
            {outlookConnected && (
              <Badge 
                variant="secondary" 
                className="absolute -right-2 -top-2 bg-green-500 text-white"
              >
                Connected
              </Badge>
            )}
          </div>
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
