"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

function SLASettings() {
  const { user } = useAuthStore();
  const config = useQuery(api.sla.getSLAConfig);
  const updateConfig = useMutation(api.sla.updateSLAConfig);
  
  const [targetHours, setTargetHours] = useState(24);
  const [warningThreshold, setWarningThreshold] = useState(75);
  const [criticalThreshold, setCriticalThreshold] = useState(90);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (config) {
      setTargetHours(config.targetResponseTimeHours);
      setWarningThreshold(config.warningThresholdPercent);
      setCriticalThreshold(config.criticalThresholdPercent);
    }
  }, [config]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      await updateConfig({
        userId: user.id as any,
        targetResponseTime: targetHours,
        warningThreshold: warningThreshold,
        criticalThreshold: criticalThreshold,
        businessHoursOnly: false,
        businessStartHour: 9,
        businessEndHour: 17,
        excludeWeekends: false,
        notifyOnWarning: false,
        notifyOnCritical: false,
        notifyOnBreach: false,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-[var(--border)] bg-[var(--card)]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-[var(--text-primary)]">
              SLA Configuration
            </CardTitle>
            <CardDescription className="text-sm text-[var(--text-muted)]">
              Configure response time targets and thresholds
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Response Time */}
        <div className="space-y-2">
          <Label htmlFor="target" className="text-sm font-medium text-[var(--text-primary)]">
            Target Response Time (hours)
          </Label>
          <Input
            id="target"
            type="number"
            min="1"
            max="168"
            value={targetHours}
            onChange={(e) => setTargetHours(Number(e.target.value))}
            className="max-w-xs"
          />
          <p className="text-xs text-[var(--text-muted)]">
            Leave requests should be reviewed within {targetHours} hours
          </p>
        </div>

        {/* Warning Threshold */}
        <div className="space-y-2">
          <Label htmlFor="warning" className="text-sm font-medium text-[var(--text-primary)]">
            Warning Threshold (%)
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="warning"
              type="number"
              min="1"
              max="100"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
              className="max-w-xs"
            />
            <span className="text-sm text-[var(--text-muted)]">
              = {Math.round((targetHours * warningThreshold) / 100)} hours
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Show warning when request reaches {warningThreshold}% of target time
          </p>
        </div>

        {/* Critical Threshold */}
        <div className="space-y-2">
          <Label htmlFor="critical" className="text-sm font-medium text-[var(--text-primary)]">
            Critical Threshold (%)
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="critical"
              type="number"
              min="1"
              max="100"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="max-w-xs"
            />
            <span className="text-sm text-[var(--text-muted)]">
              = {Math.round((targetHours * criticalThreshold) / 100)} hours
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Show critical alert when request reaches {criticalThreshold}% of target time
          </p>
        </div>

        {/* Validation Alert */}
        {warningThreshold >= criticalThreshold && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-600 dark:text-amber-400">
              Warning threshold should be lower than critical threshold
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-[var(--border)]">
          <Button
            onClick={handleSave}
            disabled={isSaving || warningThreshold >= criticalThreshold}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SLASettings;
