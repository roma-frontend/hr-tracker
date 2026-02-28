"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuthStore } from "@/store/useAuthStore";
import { LEAVE_TYPE_LABELS, calculateDays, type LeaveType } from "@/lib/types";

interface LeaveRequestModalProps {
  open: boolean;
  onClose: () => void;
}

const LEAVE_TYPES: { value: LeaveType; label: string; color: string }[] = [
  { value: "paid", label: "Paid Vacation", color: "text-[#2563eb]" },
  { value: "unpaid", label: "Unpaid Leave", color: "text-[#f59e0b]" },
  { value: "sick", label: "Sick Leave", color: "text-[#ef4444]" },
  { value: "family", label: "Family Leave", color: "text-[#10b981]" },
  { value: "doctor", label: "Doctor Visit", color: "text-[#06b6d4]" },
];

export function LeaveRequestModal({ open, onClose }: LeaveRequestModalProps) {
  const { user } = useAuthStore();
  const allUsers = useQuery(api.users.getAllUsers, user?.id ? { requesterId: user.id as Id<"users"> } : "skip");
  const createLeave = useMutation(api.leaves.createLeave);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveType | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0;

  useEffect(() => {
    if (open) {
      // Auto-select current user for non-admin roles
      if (user?.role === "employee") {
        setSelectedUserId(user.id);
      } else {
        setSelectedUserId("");
      }
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setComment("");
      setErrors({});
    }
  }, [open, user]);

  useEffect(() => {
    if (startDate && endDate && endDate < startDate) setEndDate(startDate);
  }, [startDate, endDate]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedUserId) errs.employee = "Please select an employee";
    if (!leaveType) errs.type = "Please select a leave type";
    if (!startDate) errs.startDate = "Start date is required";
    if (!endDate) errs.endDate = "End date is required";
    if (endDate && startDate && endDate < startDate) errs.endDate = "End date must be after start date";
    if (!reason.trim()) errs.reason = "Please provide a reason";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      // Find the convex user id
      const targetUser = allUsers?.find((u) => u._id === selectedUserId);
      if (!targetUser) throw new Error("User not found");

      await createLeave({
        userId: targetUser._id,
        type: leaveType as LeaveType,
        startDate,
        endDate,
        days,
        reason,
        comment: comment || undefined,
      });
      toast.success("Leave request submitted successfully!");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg" style={{ maxHeight: '90vh' }}>
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)]">New Leave Request</DialogTitle>
          <DialogDescription className="text-[var(--text-muted)]">Submit a new leave request for an employee.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-180px)] overflow-y-auto overflow-x-visible pr-2">
          <form id="leave-request-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Employee */}
          <div className="space-y-1.5">
            <Label htmlFor="employee">Employee *</Label>
            {user?.role === "employee" ? (
              // Employees can only select themselves
              <div className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background-subtle)] text-sm text-[var(--text-primary)]">
                {user.name} {user.department && <span className="text-xs text-[var(--text-muted)]">· {user.department}</span>}
              </div>
            ) : (
              // Admin and supervisor can select anyone
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="employee" className={errors.employee ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {allUsers === undefined ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : allUsers.length === 0 ? (
                    <SelectItem value="empty" disabled>No employees found</SelectItem>
                  ) : (
                    allUsers.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        <div className="flex items-center gap-2">
                          <span>{emp.name}</span>
                          {emp.department && <span className="text-xs text-[var(--text-muted)]">· {emp.department}</span>}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {errors.employee && <p className="text-xs text-destructive">{errors.employee}</p>}
          </div>

          {/* Leave type */}
          <div className="space-y-1.5">
            <Label>Leave Type *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LEAVE_TYPES.map((lt) => (
                <button
                  key={lt.value}
                  type="button"
                  onClick={() => setLeaveType(lt.value)}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                    leaveType === lt.value
                      ? "border-[#2563eb] bg-[#2563eb]/10 text-[var(--text-primary)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-subtle)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {lt.label}
                </button>
              ))}
            </div>
            {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${errors.startDate ? "border-destructive" : ""}`}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {startDate ? format(new Date(startDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[200]" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate) : undefined}
                    onSelect={(date) => setStartDate(date ? format(date, "yyyy-MM-dd") : "")}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${errors.endDate ? "border-destructive" : ""}`}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {endDate ? format(new Date(endDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[200]" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate ? new Date(endDate) : undefined}
                    onSelect={(date) => setEndDate(date ? format(date, "yyyy-MM-dd") : "")}
                    disabled={(date) => {
                      const minDate = startDate ? new Date(startDate) : new Date(new Date().setHours(0,0,0,0));
                      return date < minDate;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          {/* Days preview */}
          {days > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#2563eb]/10 border border-[#2563eb]/20"
            >
              <CalendarDays className="w-4 h-4 text-[#2563eb] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{days} day{days !== 1 ? "s" : ""} requested</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {format(new Date(startDate), "MMMM d")} – {format(new Date(endDate), "MMMM d, yyyy")}
                </p>
              </div>
            </motion.div>
          )}

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason" placeholder="Brief reason for leave..."
              value={reason} onChange={(e) => setReason(e.target.value)}
              className={errors.reason ? "border-destructive" : ""}
            />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <Label htmlFor="comment">Additional Comments</Label>
            <textarea
              id="comment" placeholder="Any additional information..."
              value={comment} onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] resize-none"
            />
          </div>

          {/* Attachment hint */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-[var(--border)] cursor-pointer hover:border-[#2563eb] transition-colors group">
            <Paperclip className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#2563eb]" />
            <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
              Attach supporting documents (medical certificate, etc.)
            </span>
          </div>
          </form>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" form="leave-request-form" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
