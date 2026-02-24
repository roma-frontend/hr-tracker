"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, Users } from "lucide-react";

export default function ConflictDetection() {
  const conflicts = useQuery(api.admin.detectConflicts);

  if (!conflicts) {
    return (
      <Card className="border-[var(--border)]">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--text-secondary)]" />
        </CardContent>
      </Card>
    );
  }

  const criticalCount = conflicts.filter(c => c.severity === "critical").length;
  const warningCount = conflicts.filter(c => c.severity === "warning").length;

  return (
    <Card className="border-[var(--border)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Conflict Detection
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} Critical</Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary">{warningCount} Warnings</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {conflicts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="mb-3 h-12 w-12 text-green-500 opacity-50" />
            <p className="text-sm font-medium text-[var(--text-primary)]">No Conflicts Detected</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Leave schedules are well balanced
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] space-y-3 overflow-y-auto">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className={`rounded-lg border p-3 ${
                  conflict.severity === "critical"
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-orange-500/30 bg-orange-500/5"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {conflict.department}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {new Date(conflict.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={conflict.severity === "critical" ? "destructive" : "secondary"}
                  >
                    {conflict.severity}
                  </Badge>
                </div>
                
                <p className="mb-2 text-sm text-[var(--text-primary)]">
                  {conflict.recommendation}
                </p>
                
                <div className="text-xs text-[var(--text-secondary)]">
                  <p className="mb-1 font-medium">Employees out:</p>
                  <div className="flex flex-wrap gap-1">
                    {conflict.employeesOut.map((name, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
