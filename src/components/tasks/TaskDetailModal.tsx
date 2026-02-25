"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type Status = "pending" | "in_progress" | "review" | "completed" | "cancelled";
type Priority = "low" | "medium" | "high" | "urgent";

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  pending:     { label: "Pending",     color: "text-slate-500",   bg: "bg-slate-100",   dot: "bg-slate-400" },
  in_progress: { label: "In Progress", color: "text-blue-600",    bg: "bg-blue-100",    dot: "bg-blue-500" },
  review:      { label: "In Review",   color: "text-amber-600",   bg: "bg-amber-100",   dot: "bg-amber-500" },
  completed:   { label: "Completed",   color: "text-emerald-600", bg: "bg-emerald-100", dot: "bg-emerald-500" },
  cancelled:   { label: "Cancelled",   color: "text-rose-500",    bg: "bg-rose-100",    dot: "bg-rose-400" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; icon: string }> = {
  low:    { label: "Low",    color: "text-slate-500",  bg: "bg-slate-100",  icon: "↓" },
  medium: { label: "Medium", color: "text-blue-500",   bg: "bg-blue-100",   icon: "→" },
  high:   { label: "High",   color: "text-orange-500", bg: "bg-orange-100", icon: "↑" },
  urgent: { label: "Urgent", color: "text-rose-600",   bg: "bg-rose-100",   icon: "⚡" },
};

// Status transitions available per role
const EMPLOYEE_TRANSITIONS: Record<Status, Status[]> = {
  pending:     ["in_progress"],
  in_progress: ["review", "pending"],
  review:      ["in_progress"],
  completed:   [],
  cancelled:   [],
};

const MANAGER_TRANSITIONS: Record<Status, Status[]> = {
  pending:     ["in_progress", "cancelled"],
  in_progress: ["review", "pending", "cancelled"],
  review:      ["completed", "in_progress", "cancelled"],
  completed:   ["in_progress"],
  cancelled:   ["pending"],
};

function Avatar({ name, url }: { name: string; url?: string | null }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white text-xs bg-gradient-to-br from-indigo-500 to-purple-600">
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : initials}
    </div>
  );
}

interface Props {
  task: any;
  currentUserId: Id<"users">;
  userRole: "admin" | "supervisor" | "employee";
  onClose: () => void;
}

export function TaskDetailModal({ task, currentUserId, userRole, onClose }: Props) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description ?? "");
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editDeadline, setEditDeadline] = useState(
    task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : ""
  );

  const canManage = userRole === "admin" || userRole === "supervisor";
  const isAssignee = task.assignedTo === currentUserId;

  const comments = useQuery(api.tasks.getTaskComments, { taskId: task._id });
  const updateStatus = useMutation(api.tasks.updateTaskStatus);
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const addComment = useMutation(api.tasks.addComment);
  const markRead = useMutation(api.notifications.markAllAsRead);

  // Mark task notifications as read when modal opens
  React.useEffect(() => {
    markRead({ userId: currentUserId }).catch(() => {});
  }, []);

  const statusCfg = STATUS_CONFIG[task.status as Status];
  const priorityCfg = PRIORITY_CONFIG[task.priority as Priority];

  const transitions = canManage
    ? MANAGER_TRANSITIONS[task.status as Status]
    : EMPLOYEE_TRANSITIONS[task.status as Status];

  const handleStatusChange = async (newStatus: Status) => {
    await updateStatus({ taskId: task._id, status: newStatus, userId: currentUserId });
    onClose();
  };

  const handleSaveEdit = async () => {
    await updateTask({
      taskId: task._id,
      title: editTitle.trim(),
      description: editDesc.trim() || undefined,
      priority: editPriority,
      deadline: editDeadline ? new Date(editDeadline).getTime() : undefined,
    });
    setEditMode(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    await deleteTask({ taskId: task._id });
    onClose();
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    await addComment({ taskId: task._id, authorId: currentUserId, content: comment.trim() });
    setComment("");
    setSubmitting(false);
  };

  const deadlinePassed = task.deadline && task.deadline < Date.now() && task.status !== "completed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {editMode ? (
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-white/20 text-white placeholder-white/60 rounded-xl px-3 py-1.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              ) : (
                <h2 className="text-xl font-bold text-white leading-snug">{task.title}</h2>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
                  {statusCfg.label}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
                  {priorityCfg.icon} {priorityCfg.label}
                </span>
                {deadlinePassed && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/80 text-white">⏰ Overdue</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {canManage && !editMode && (
                <button onClick={() => setEditMode(true)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm transition-colors" title="Edit">✏️</button>
              )}
              {editMode && (
                <>
                  <button onClick={handleSaveEdit} className="px-3 py-1.5 rounded-lg bg-white text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-colors">Save</button>
                  <button onClick={() => setEditMode(false)} className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors">Cancel</button>
                </>
              )}
              {canManage && !editMode && (
                <button onClick={handleDelete} className="w-8 h-8 rounded-full bg-white/20 hover:bg-rose-500/80 flex items-center justify-center text-white text-sm transition-colors" title="Delete">🗑️</button>
              )}
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">✕</button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Description</h3>
              {editMode ? (
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              ) : (
                <p className="text-slate-600 text-sm leading-relaxed">{task.description || <span className="text-slate-300 italic">No description</span>}</p>
              )}
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Assigned To</h3>
                <div className="flex items-center gap-2">
                  <Avatar name={task.assignedToUser?.name ?? "?"} url={task.assignedToUser?.avatarUrl} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{task.assignedToUser?.name ?? "—"}</p>
                    <p className="text-xs text-slate-400">{task.assignedToUser?.position ?? ""}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Assigned By</h3>
                <div className="flex items-center gap-2">
                  <Avatar name={task.assignedByUser?.name ?? "?"} url={task.assignedByUser?.avatarUrl} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{task.assignedByUser?.name ?? "—"}</p>
                    <p className="text-xs text-slate-400">{task.assignedByUser?.role ?? ""}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Priority</h3>
                {editMode ? (
                  <select value={editPriority} onChange={e => setEditPriority(e.target.value as Priority)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="low">↓ Low</option>
                    <option value="medium">→ Medium</option>
                    <option value="high">↑ High</option>
                    <option value="urgent">⚡ Urgent</option>
                  </select>
                ) : (
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${priorityCfg.bg} ${priorityCfg.color}`}>
                    {priorityCfg.icon} {priorityCfg.label}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Deadline</h3>
                {editMode ? (
                  <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                ) : task.deadline ? (
                  <p className={`text-sm font-medium ${deadlinePassed ? "text-rose-600" : "text-slate-700"}`}>
                    {deadlinePassed ? "⏰ " : "📅 "}
                    {new Date(task.deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No deadline</p>
                )}
              </div>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full font-medium">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Status transitions */}
            {transitions.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Move To</h3>
                <div className="flex flex-wrap gap-2">
                  {transitions.map(st => {
                    const cfg = STATUS_CONFIG[st];
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 ${cfg.bg} ${cfg.color} border-current/20 hover:scale-105 transition-all shadow-sm`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Comments {comments ? `(${comments.length})` : ""}
              </h3>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                {comments?.length === 0 && (
                  <p className="text-sm text-slate-400 italic text-center py-3">No comments yet</p>
                )}
                {comments?.map(c => (
                  <div key={c._id} className="flex gap-3">
                    <Avatar name={c.author?.name ?? "?"} url={(c.author as any)?.avatarUrl} />
                    <div className="flex-1 bg-slate-50 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700">{c.author?.name}</span>
                        <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment input */}
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold disabled:opacity-50 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
