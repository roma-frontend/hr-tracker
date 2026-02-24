"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Id } from "../../../convex/_generated/dataModel";

interface AILeaveAssistantProps {
  leaveRequestId: Id<"leaveRequests">;
  userId: Id<"users">;
  onApprove?: (comment?: string) => void;
  onReject?: (comment?: string) => void;
}

export default function AILeaveAssistant({ leaveRequestId, userId, onApprove, onReject }: AILeaveAssistantProps) {
  const evaluation = useQuery(api.aiEvaluator.evaluateLeaveRequest, { leaveRequestId });

  if (!evaluation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-[var(--text-muted)] animate-pulse" />
            <p className="text-sm text-[var(--text-muted)]">AI analyzing request...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { leaveEligibilityScore, breakdown, recommendation, confidence, reasoning } = evaluation;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendationBadge = () => {
    if (recommendation === "APPROVE") {
      return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approve</Badge>;
    } else if (recommendation === "REVIEW") {
      return <Badge variant="warning" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Review</Badge>;
    } else {
      return <Badge variant="destructive" className="flex items-center gap-1"><Minus className="w-3 h-3" /> Reject</Badge>;
    }
  };

  return (
    <Card className="border-2 border-[var(--primary)]/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-[var(--primary)]" />
            AI Leave Approval Assistant
          </CardTitle>
          {getRecommendationBadge()}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-[var(--text-muted)]">Confidence:</span>
          <Badge variant={confidence === "HIGH" ? "success" : confidence === "MEDIUM" ? "warning" : "destructive"}>
            {confidence}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Eligibility Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(leaveEligibilityScore)}`}>
              {leaveEligibilityScore}/100
            </span>
          </div>
          <Progress value={leaveEligibilityScore} className="h-2" />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[var(--text-muted)]">Performance</span>
              <span className={`font-medium ${getScoreColor(breakdown.performance.score)}`}>
                {breakdown.performance.score}%
              </span>
            </div>
            <Progress value={breakdown.performance.score} className="h-1.5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[var(--text-muted)]">Attendance</span>
              <span className={`font-medium ${getScoreColor(breakdown.attendance.score)}`}>
                {breakdown.attendance.score}%
              </span>
            </div>
            <Progress value={breakdown.attendance.score} className="h-1.5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[var(--text-muted)]">Behavior</span>
              <span className={`font-medium ${getScoreColor(breakdown.behavior.score)}`}>
                {breakdown.behavior.score}%
              </span>
            </div>
            <Progress value={breakdown.behavior.score} className="h-1.5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[var(--text-muted)]">Workload</span>
              <span className={`font-medium ${getScoreColor(breakdown.workload.score)}`}>
                {breakdown.workload.score}%
              </span>
            </div>
            <Progress value={breakdown.workload.score} className="h-1.5" />
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="pt-3 border-t border-[var(--border)]">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Brain className="w-4 h-4" />
            AI Analysis
          </h4>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {reasoning}
          </p>
        </div>

        {/* Key Factors */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Key Factors</h4>
          <div className="space-y-1.5">
            {breakdown.performance.factors.slice(0, 2).map((factor, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {factor.startsWith("✅") ? (
                  <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                ) : factor.startsWith("⚠️") ? (
                  <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <Minus className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-[var(--text-muted)]">{factor.substring(2)}</span>
              </div>
            ))}
            {breakdown.workload.factors.slice(0, 1).map((factor, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {factor.startsWith("✅") ? (
                  <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                ) : factor.startsWith("⚠️") ? (
                  <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <Minus className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-[var(--text-muted)]">{factor.substring(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
