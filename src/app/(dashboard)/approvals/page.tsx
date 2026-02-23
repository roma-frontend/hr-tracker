"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserCheck, UserX, Clock, Mail, Calendar, CheckCircle } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function ApprovalsPage() {
  const { user } = useAuthStore();
  
  // Debug
  React.useEffect(() => {
    console.log("Approvals page - Current user:", user);
  }, [user]);
  
  const pendingUsers = useQuery(api.users.getPendingApprovalUsers, {});
  const approveUser = useMutation(api.users.approveUser);
  const rejectUser = useMutation(api.users.rejectUser);

  const handleApprove = async (userId: Id<"users">, userName: string) => {
    if (!user?.id) {
      console.error("No user ID found in store:", user);
      toast.error("Please login again");
      return;
    }
    try {
      console.log("Approving user:", { userId, adminId: user.id });
      await approveUser({ userId, adminId: user.id as Id<"users"> });
      toast.success(`${userName} has been approved!`);
    } catch (err) {
      console.error("Approve error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to approve user");
    }
  };

  const handleReject = async (userId: Id<"users">, userName: string) => {
    if (!user?.id) return;
    if (!confirm(`Are you sure you want to reject ${userName}? This action cannot be undone.`)) return;
    try {
      await rejectUser({ userId, adminId: user.id as Id<"users"> });
      toast.success(`${userName} has been rejected`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject user");
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <UserX className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Access Denied</h2>
        <p className="text-[var(--text-muted)] text-sm">Only admins can access this page.</p>
      </div>
    );
  }

  const isLoading = pendingUsers === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">User Approvals</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Review and approve new user registrations
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Loading...</p>
          </CardContent>
        </Card>
      ) : pendingUsers && pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              All caught up!
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              No pending user approvals at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingUsers?.map((pendingUser) => (
            <Card key={pendingUser._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-lg">
                      {pendingUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{pendingUser.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3" />
                        {pendingUser.email}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-[var(--text-muted)] text-xs">Role</p>
                    <p className="text-[var(--text-primary)] font-medium capitalize">
                      {pendingUser.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-xs">Type</p>
                    <p className="text-[var(--text-primary)] font-medium capitalize">
                      {pendingUser.employeeType}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-xs">Registered</p>
                    <p className="text-[var(--text-primary)] font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(pendingUser.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-xs">Phone</p>
                    <p className="text-[var(--text-primary)] font-medium">
                      {pendingUser.phone ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(pendingUser._id, pendingUser.name)}
                    className="flex-1"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(pendingUser._id, pendingUser.name)}
                    className="flex-1"
                  >
                    <UserX className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
