"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CreateTaskModal } from "./CreateTaskModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { AssignSupervisorModal } from "./AssignSupervisorModal";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
type Status = "pending" | "in_progress" | "review" | "completed" | "cancelled";
type Priority = "low" | "medium" | "high" | "urgent";
type ViewMode = "kanban" | "list";

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending:     { label: "Pending",     color: "text-slate-500",   bg: "bg-slate-100",   border: "border-slate-200", dot: "bg-slate-400" },
  in_progress: { label: "In Progress", color: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-200",  dot: "bg-blue-500" },
  review:      { label: "In Review",   color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200", dot: "bg-amber-500" },
  completed:   { label: "Completed",   color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200", dot: "bg-emerald-500" },
  cancelled:   { label: "Cancelled",   color: "text-rose-500",    bg: "bg-rose-50",     border: "border-rose-200",  dot: "bg-rose-400" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; icon: string }> = {
  low:    { label: "Low",    color: "text-slate-500",  bg: "bg-slate-100",  icon: "↓" },
  medium: { label: "Medium", color: "text-blue-500",   bg: "bg-blue-100",   icon: "→" },
  high:   { label: "High",   color: "text-orange-500", bg: "bg-orange-100", icon: "↑" },
  urgent: { label: "Urgent", color: "text-rose-600",   bg: "bg-rose-100",   icon: "⚡" },
};

const KANBAN_COLUMNS: Status[] = ["pending", "in_progress", "review", "completed"];

// ── Avatar helper ──────────────────────────────────────────────────────────
function Avatar({ name, url, size = "sm" }: { name: string; url?: string | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-600`}>
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : initials}
    </div>
  );
}

// ── Deadline badge ─────────────────────────────────────────────────────────
function DeadlineBadge({ deadline, status }: { deadline?: number; status: Status }) {
  if (!deadline) return null;
  const now = Date.now();
  const diff = deadline - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const overdue = diff < 0 && status !== "completed" && status !== "cancelled";
  const soon = diff > 0 && days <= 2 && status !== "completed";
  const dateStr = new Date(deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  if (overdue) return <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">⏰ Overdue</span>;
  if (soon) return <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">⚡ {dateStr}</span>;
  return <span className="text-xs text-slate-400">📅 {dateStr}</span>;
}

// ── Task Card (base content, reused in both draggable and overlay) ──────────
function TaskCardContent({ task, isDragging = false }: { task: any; isDragging?: boolean }) {
  const statusCfg = STATUS_CONFIG[task.status as Status];
  const priorityCfg = PRIORITY_CONFIG[task.priority as Priority];
  return (
    <div className={`group bg-white rounded-2xl border shadow-sm p-4 space-y-3 transition-all duration-200 ${
      isDragging
        ? "border-indigo-400 shadow-2xl rotate-2 scale-105 opacity-90"
        : "border-slate-100 hover:shadow-md hover:border-indigo-200"
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityCfg.bg} ${priorityCfg.color}`}>
          {priorityCfg.icon} {priorityCfg.label}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
      </div>
      <p className={`font-semibold text-sm leading-snug line-clamp-2 ${isDragging ? "text-indigo-700" : "text-slate-800"}`}>
        {task.title}
      </p>
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="text-xs bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <Avatar name={task.assignedToUser?.name ?? "?"} url={task.assignedToUser?.avatarUrl} size="sm" />
          <span className="text-xs text-slate-500 truncate max-w-[100px]">{task.assignedToUser?.name ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.commentCount > 0 && <span className="text-xs text-slate-400">💬 {task.commentCount}</span>}
          <DeadlineBadge deadline={task.deadline} status={task.status as Status} />
        </div>
      </div>
    </div>
  );
}

// ── Draggable Task Card ────────────────────────────────────────────────────
function DraggableTaskCard({ task, onOpen }: { task: any; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 };
  const dragStartTime = useRef<number>(0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="cursor-grab active:cursor-grabbing"
      onPointerDown={() => { dragStartTime.current = Date.now(); }}
      onClick={() => {
        if (Date.now() - dragStartTime.current < 200) onOpen();
      }}
      {...listeners}
      {...attributes}
    >
      <TaskCardContent task={task} isDragging={isDragging} />
    </div>
  );
}

// ── Droppable Kanban Column ────────────────────────────────────────────────
function DroppableKanbanColumn({ status, tasks, onOpen }: { status: Status; tasks: any[]; onOpen: (t: any) => void }) {
  const cfg = STATUS_CONFIG[status];
  const { isOver, setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex-1 min-w-[260px] max-w-[320px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
        <span className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[120px] p-2 rounded-2xl transition-all duration-200 ${
          isOver ? `border-2 border-dashed ${cfg.border} bg-indigo-50/50` : "border-2 border-transparent"
        }`}
      >
        {tasks.map(task => (
          <DraggableTaskCard key={task._id} task={task} onOpen={() => onOpen(task)} />
        ))}
        {tasks.length === 0 && (
          <div className={`rounded-2xl border-2 border-dashed ${cfg.border} p-6 text-center transition-colors ${isOver ? "bg-indigo-50" : ""}`}>
            <p className="text-xs text-slate-400">{isOver ? "Drop here" : "No tasks"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── List Row ───────────────────────────────────────────────────────────────
function TaskRow({ task, onOpen }: { task: any; onOpen: () => void }) {
  const statusCfg = STATUS_CONFIG[task.status as Status];
  const priorityCfg = PRIORITY_CONFIG[task.priority as Priority];

  return (
    <tr
      onClick={onOpen}
      className="group hover:bg-indigo-50/50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
          <span className="font-medium text-slate-800 text-sm group-hover:text-indigo-700 transition-colors line-clamp-1">{task.title}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar name={task.assignedToUser?.name ?? "?"} url={task.assignedToUser?.avatarUrl} size="sm" />
          <span className="text-sm text-slate-600">{task.assignedToUser?.name ?? "—"}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priorityCfg.bg} ${priorityCfg.color}`}>
          {priorityCfg.icon} {priorityCfg.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <DeadlineBadge deadline={task.deadline} status={task.status as Status} />
      </td>
      <td className="px-4 py-3 text-xs text-slate-400">
        {task.commentCount > 0 && `💬 ${task.commentCount}`}
      </td>
    </tr>
  );
}

// (KanbanColumn replaced by DroppableKanbanColumn above)

// ── Main Client ────────────────────────────────────────────────────────────
interface TasksClientProps {
  userId: string;
  userRole: "admin" | "supervisor" | "employee";
}

export function TasksClient({ userId, userRole }: TasksClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [activeTask, setActiveTask] = useState<any>(null);

  const convexId = userId as Id<"users">;
  const canManage = userRole === "admin" || userRole === "supervisor";

  // DnD sensors — require 8px movement before drag starts (prevents accidental drags)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const updateStatus = useMutation(api.tasks.updateTaskStatus);

  // Queries
  const adminTasks = useQuery(api.tasks.getAllTasks, userRole === "admin" ? {} : "skip");
  const supervisorTasks = useQuery(api.tasks.getTasksAssignedBy, userRole === "supervisor" ? { supervisorId: convexId } : "skip");
  const employeeTasks = useQuery(api.tasks.getTasksForEmployee, userRole === "employee" ? { userId: convexId } : "skip");

  const rawTasks = userRole === "admin" ? adminTasks : userRole === "supervisor" ? supervisorTasks : employeeTasks;

  // Filter
  const tasks = useMemo(() => {
    if (!rawTasks) return [];
    return rawTasks.filter(t => {
      const matchPriority = filterPriority === "all" || t.priority === filterPriority;
      const matchStatus = filterStatus === "all" || t.status === filterStatus;
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      return matchPriority && matchStatus && matchSearch;
    });
  }, [rawTasks, filterPriority, filterStatus, search]);

  // Stats
  const stats = useMemo(() => {
    const all = rawTasks ?? [];
    return {
      total: all.length,
      pending: all.filter(t => t.status === "pending").length,
      inProgress: all.filter(t => t.status === "in_progress").length,
      review: all.filter(t => t.status === "review").length,
      completed: all.filter(t => t.status === "completed").length,
      overdue: all.filter(t => t.deadline && t.deadline < Date.now() && t.status !== "completed" && t.status !== "cancelled").length,
    };
  }, [rawTasks]);

  const tasksByStatus = useMemo(() => {
    const map: Record<Status, any[]> = { pending: [], in_progress: [], review: [], completed: [], cancelled: [] };
    tasks.forEach(t => { map[t.status as Status].push(t); });
    return map;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {userRole === "employee" ? "My Tasks" : "Task Manager"}
            </h1>
            <p className="text-slate-500 mt-1">
              {userRole === "employee" ? "Track your assignments and progress" : "Assign and monitor team tasks"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {userRole === "admin" && (
              <button
                onClick={() => setShowAssign(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium text-sm"
              >
                <span>👥</span> Assign Supervisor
              </button>
            )}
            {canManage && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all"
              >
                <span className="text-lg leading-none">+</span> New Task
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {[
            { label: "Total", value: stats.total, color: "from-slate-600 to-slate-700", bg: "bg-white" },
            { label: "Pending", value: stats.pending, color: "from-slate-400 to-slate-500", bg: "bg-white" },
            { label: "In Progress", value: stats.inProgress, color: "from-blue-500 to-blue-600", bg: "bg-white" },
            { label: "In Review", value: stats.review, color: "from-amber-500 to-amber-600", bg: "bg-white" },
            { label: "Completed", value: stats.completed, color: "from-emerald-500 to-emerald-600", bg: "bg-white" },
            { label: "Overdue", value: stats.overdue, color: "from-rose-500 to-rose-600", bg: "bg-white" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-100 shadow-sm p-4 text-center`}>
              <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value as any)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">⚡ Urgent</option>
          <option value="high">↑ High</option>
          <option value="medium">→ Medium</option>
          <option value="low">↓ Low</option>
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="review">In Review</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* View toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 ml-auto">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "kanban" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            ⊞ Kanban
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "list" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            ☰ List
          </button>
        </div>
      </div>

      {/* Content */}
      {rawTasks === undefined ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm">Loading tasks...</p>
          </div>
        </div>
      ) : viewMode === "kanban" ? (
        <DndContext
          sensors={sensors}
          onDragStart={(e: DragStartEvent) => {
            const task = tasks.find(t => t._id === e.active.id);
            setActiveTask(task ?? null);
          }}
          onDragEnd={async (e: DragEndEvent) => {
            setActiveTask(null);
            const { active, over } = e;
            if (!over) return;
            const newStatus = over.id as Status;
            const task = tasks.find(t => t._id === active.id);
            if (!task || task.status === newStatus) return;
            try {
              await updateStatus({ taskId: task._id as Id<"tasks">, status: newStatus, userId: convexId });
              toast.success(`Moved to ${STATUS_CONFIG[newStatus].label} ✓`, { duration: 2000 });
            } catch {
              toast.error("Failed to update status");
            }
          }}
          onDragCancel={() => setActiveTask(null)}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map(status => (
              <DroppableKanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onOpen={setSelectedTask}
              />
            ))}
          </div>
          {/* Drag overlay — floating card while dragging */}
          <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
            {activeTask ? (
              <div className="w-[280px] rotate-2">
                <TaskCardContent task={activeTask} isDragging={true} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {tasks.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-500 font-medium">No tasks found</p>
              <p className="text-slate-400 text-sm mt-1">
                {canManage ? "Create a new task to get started" : "Your supervisor hasn't assigned any tasks yet"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Assignee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <TaskRow key={task._id} task={task} onOpen={() => setSelectedTask(task)} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateTaskModal
          currentUserId={convexId}
          userRole={userRole}
          onClose={() => setShowCreate(false)}
        />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          currentUserId={convexId}
          userRole={userRole}
          onClose={() => setSelectedTask(null)}
        />
      )}
      {showAssign && (
        <AssignSupervisorModal onClose={() => setShowAssign(false)} />
      )}
    </div>
  );
}
