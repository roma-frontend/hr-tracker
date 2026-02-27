"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Search, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LeaveRequestModal } from "@/components/leaves/LeaveRequestModal";
import { useAuthStore } from "@/store/useAuthStore";
import { LEAVE_TYPE_LABELS, DEPARTMENTS, type LeaveType, type LeaveStatus } from "@/lib/types";
import dynamic from "next/dynamic";

const AILeaveAssistant = dynamic(() => import("@/components/leaves/AILeaveAssistant"), { ssr: false });

function safeFormat(dateStr: string | undefined | null, fmt: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return format(d, fmt);
  } catch {
    return "—";
  }
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, { variant: "warning" | "success" | "destructive"; label: string }> = {
    pending: { variant: "warning", label: "Pending" },
    approved: { variant: "success", label: "Approved" },
    rejected: { variant: "destructive", label: "Rejected" },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function LeaveTypeBadge({ type }: { type: LeaveType }) {
  const colorMap: Record<LeaveType, string> = {
    paid: "bg-[#2563eb]/20 text-[#2563eb] border-[#2563eb]/30",
    unpaid: "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30",
    sick: "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30",
    family: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30",
    doctor: "bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/30",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorMap[type]}`}>
      {LEAVE_TYPE_LABELS[type]}
    </span>
  );
}

export function LeavesClient() {
  const { user } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  React.useEffect(() => { setMounted(true); }, []);

  const leaves = useQuery(api.leaves.getAllLeaves, user?.id ? { requesterId: user.id as Id<"users"> } : "skip");

  const approveLeave = useMutation(api.leaves.approveLeave);
  const rejectLeave = useMutation(api.leaves.rejectLeave);
  const deleteLeave = useMutation(api.leaves.deleteLeave);

  const filtered = useMemo(() => {
    if (!leaves) return [];
    return leaves.filter((l) => {
      if (!search) return true;
      return (
        (l.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (l.userDepartment ?? "").toLowerCase().includes(search.toLowerCase()) ||
        l.reason.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [leaves, search]);

  const handleApprove = async (id: Id<"leaveRequests">, comment?: string) => {
    if (!user?.id) {
      toast.error("Please login again");
      return;
    }
    try {
      await approveLeave({ 
        leaveId: id, 
        reviewerId: user.id as Id<"users">,
        comment 
      });
      toast.success("Leave request approved");
    } catch (err) {
      console.error("Approve error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const handleReject = async (id: Id<"leaveRequests">, comment?: string) => {
    if (!user?.id) {
      toast.error("Please login again");
      return;
    }
    try {
      await rejectLeave({ 
        leaveId: id, 
        reviewerId: user.id as Id<"users">,
        comment 
      });
      toast.success("Leave request rejected");
    } catch (err) {
      console.error("Reject error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    }
  };

  const handleDelete = async (id: Id<"leaveRequests">) => {
    if (!user?.id) {
      toast.error("Please login again");
      return;
    }
    try {
      await deleteLeave({ leaveId: id, requesterId: user.id as Id<"users"> });
      toast.success("Leave request deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (!mounted) return null;

  const isLoading = leaves === undefined;
  const isError = leaves === null;
  const isAdmin = user?.role === "admin" || user?.role === "supervisor";

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <Plus className="w-8 h-8 text-amber-500" />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Convex Not Deployed</h2>
      <p className="text-[var(--text-muted)] text-sm max-w-sm">
        Run <code className="bg-[var(--background-subtle)] px-2 py-0.5 rounded text-[#2563eb]">npx convex dev</code> in the terminal to connect to the database.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Leave Requests</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Manage and track all leave requests in real time
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> New Request
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  placeholder="Search by employee, department, reason..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {(Object.entries(LEAVE_TYPE_LABELS) as [LeaveType, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {isLoading ? "Loading..." : `${filtered.length} request${filtered.length !== 1 ? "s" : ""}`}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-[var(--text-muted)] text-sm">Loading data from Convex...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-[var(--text-muted)] text-sm">No leave requests found.</p>
                <Button className="mt-4" size="sm" onClick={() => setModalOpen(true)}>
                  <Plus className="w-4 h-4" /> Create First Request
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Employee</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">Dates</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden sm:table-cell">Days</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">Reason</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                      {isAdmin && <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filtered.map((req, i) => (
                      <React.Fragment key={req._id}>
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-[var(--background-subtle)] transition-colors cursor-pointer"
                          onClick={() => isAdmin && req.status === "pending" && setExpandedRow(expandedRow === req._id ? null : req._id)}
                        >
                        <td className="px-6 py-3">
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{req.userName}</p>
                            <p className="text-xs text-[var(--text-muted)]">{req.userDepartment}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3"><LeaveTypeBadge type={req.type as LeaveType} /></td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-xs text-[var(--text-secondary)]">
                            {safeFormat(req.startDate, "MMM d")} – {safeFormat(req.endDate, "MMM d, yyyy")}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{req.days}d</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-xs text-[var(--text-muted)] max-w-[180px] truncate">{req.reason}</p>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={req.status as LeaveStatus} /></td>
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {req.status === "pending" && (
                                <>
                                  <Button size="icon-sm" variant="ghost" className="text-emerald-500 hover:text-emerald-400"
                                    onClick={(e) => { e.stopPropagation(); handleApprove(req._id); }}>
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon-sm" variant="ghost" className="text-red-500 hover:text-red-400"
                                    onClick={(e) => { e.stopPropagation(); handleReject(req._id); }}>
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button size="icon-sm" variant="ghost" className="text-[var(--text-muted)] hover:text-red-400"
                                onClick={(e) => { e.stopPropagation(); handleDelete(req._id); }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                      
                      {/* AI Assistant Expandable Row */}
                      {isAdmin && req.status === "pending" && expandedRow === req._id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={7} className="px-6 py-4 bg-[var(--background-subtle)]">
                            <AILeaveAssistant
                              leaveRequestId={req._id}
                              userId={req.userId}
                              onApprove={(comment?: string) => handleApprove(req._id, comment)}
                              onReject={(comment?: string) => handleReject(req._id, comment)}
                            />
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <LeaveRequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default LeavesClient;
