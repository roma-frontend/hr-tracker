"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS, getTravelAllowance } from "@/lib/types";
import { useAuthStore } from "@/store/useAuthStore";

const ADMIN_EMAIL = "romangulanyan@gmail.com";

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("hy-AM") + " ֏";
}

export function AddEmployeeModal({ open, onClose }: AddEmployeeModalProps) {
  const createUser = useMutation(api.users.createUser);
  const currentUser = useAuthStore((s) => s.user);
  const isActualAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "supervisor" | "employee">("employee");
  const [type, setType] = useState<"staff" | "contractor">("staff");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const allowance = getTravelAllowance(email);

  useEffect(() => {
    if (open) {
      setName(""); setEmail(""); setDepartment(""); setPosition("");
      setPhone(""); setType("staff"); setRole("employee"); setErrors({});
    }
  }, [open]);

  // Auto-detect contractor from email
  useEffect(() => {
    if (email.toLowerCase().includes("contractor")) setType("contractor");
    else if (email && !email.toLowerCase().includes("contractor")) setType("staff");
  }, [email]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format";
    if (!department) errs.department = "Department is required";
    if (!position.trim()) errs.position = "Position is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await createUser({
        name,
        email,
        passwordHash: "temp-password-will-be-changed", // User will need to reset password
        role,
        department,
        position,
        employeeType: type,
        phone: phone || undefined,
      });
      toast.success(`${name} has been added successfully!`);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Create a new employee record in the system.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="emp-name">Full Name *</Label>
            <Input
              id="emp-name" placeholder="John Smith"
              value={name} onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-[var(--destructive)]" : ""}
            />
            {errors.name && <p className="text-xs text-[var(--destructive)]">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="emp-email">Email *</Label>
            <Input
              id="emp-email" type="email" placeholder="john.smith@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-[var(--destructive)]" : ""}
            />
            {errors.email && <p className="text-xs text-[var(--destructive)]">{errors.email}</p>}
            <p className="text-xs text-[var(--text-muted)]">
              Tip: include &quot;contractor&quot; in email → auto-sets contractor type (12,000 ֏ allowance)
            </p>
          </div>

          {/* Department + Position */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className={errors.department ? "border-[var(--destructive)]" : ""}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-xs text-[var(--destructive)]">{errors.department}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-position">Position *</Label>
              <Input
                id="emp-position" placeholder="e.g. Developer"
                value={position} onChange={(e) => setPosition(e.target.value)}
                className={errors.position ? "border-[var(--destructive)]" : ""}
              />
              {errors.position && <p className="text-xs text-[var(--destructive)]">{errors.position}</p>}
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "supervisor" | "employee")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                {isActualAdmin && (
                  <SelectItem value="admin">Administrator</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="emp-phone">Phone Number</Label>
            <Input
              id="emp-phone" placeholder="+374 91 123456"
              value={phone} onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Employee type */}
          <div className="space-y-1.5">
            <Label>Employee Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["staff", "contractor"] as const).map((t) => (
                <button
                  key={t} type="button" onClick={() => setType(t)}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium capitalize transition-all ${
                    type === t
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text-primary)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-subtle)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Travel allowance preview */}
          <motion.div
            key={allowance}
            initial={{ scale: 0.97 }} animate={{ scale: 1 }}
            className="rounded-lg bg-[var(--background-subtle)] border border-[var(--border)] p-3 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-[var(--text-muted)]">Calculated Travel Allowance</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Based on {type === "contractor" ? "contractor" : "staff"} rate
              </p>
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(allowance)}</p>
          </motion.div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
