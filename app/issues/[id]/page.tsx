"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/layout/header";
import { Task, STATUS_LABELS, PRIORITY_LABELS, TaskStatus, TaskPriority, Estimate } from "@/lib/types/task";
import { STATUS_COLORS, PRIORITY_COLORS, LABEL_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  User,
  Folder,
  Tag,
  RefreshCw,
  AlertTriangle,
  Gauge,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable state
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [assigneeDraft, setAssigneeDraft] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchTask() {
      try {
        const res = await fetch("/api/vault/tasks");
        const tasks: Task[] = await res.json();
        setAllTasks(tasks);
        const found = tasks.find((t) => t.id === params.id);
        setTask(found || null);
      } catch (error) {
        console.error("Failed to fetch task:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [params.id]);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const updateProperty = async (updates: Partial<Task>) => {
    if (!task) return;
    setTask({ ...task, ...updates } as Task);
    try {
      await fetch("/api/vault/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: task.filePath, updates }),
      });
      showSaved();
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await fetch("/api/vault/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: task.filePath }),
      });
      router.push("/issues");
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const saveTitle = () => {
    if (titleDraft.trim() && titleDraft.trim() !== task?.title) {
      updateProperty({ title: titleDraft.trim() });
    }
    setEditingTitle(false);
  };

  const saveDescription = () => {
    updateProperty({ content: descriptionDraft } as Partial<Task>);
    setEditingDescription(false);
  };

  const saveAssignee = () => {
    updateProperty({ assignee: assigneeDraft.trim() || undefined });
    setEditingAssignee(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-linear-text-tertiary text-sm">Loading...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-linear-text-tertiary text-sm">Issue not found</div>
        <button
          onClick={() => router.push("/issues")}
          className="text-sm text-linear-accent hover:text-linear-accent-hover"
        >
          Back to Issues
        </button>
      </div>
    );
  }

  const blockedByTasks = allTasks.filter((t) =>
    task.blocked_by.some((b) => b.includes(t.id) || b.includes(t.title))
  );
  const blockingTasks = allTasks.filter((t) =>
    task.blocking.some((b) => b.includes(t.id) || b.includes(t.title))
  );
  const subTasks = allTasks.filter(
    (t) => t.parent && (t.parent.includes(task.id) || t.parent.includes(task.title))
  );

  return (
    <div className="h-full flex flex-col">
      <Header title={task.id}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-xs text-linear-text-secondary hover:text-linear-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <span className="text-linear-text-tertiary text-xs">/</span>
          <Link
            href="/issues"
            className="text-xs text-linear-text-secondary hover:text-linear-text-primary"
          >
            Issues
          </Link>
          <span className="text-linear-text-tertiary text-xs">/</span>
          <span className="text-xs text-linear-text-primary">{task.id}</span>

          {saved && (
            <span className="flex items-center gap-1 text-2xs text-status-done animate-fade-in">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}

          <div className="ml-auto">
            {confirmingDelete ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-linear-text-secondary">Delete?</span>
                <button
                  onClick={handleDelete}
                  className="px-2 py-0.5 bg-priority-urgent/20 text-priority-urgent rounded-sm hover:bg-priority-urgent/30"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="px-2 py-0.5 bg-linear-surface-hover text-linear-text-secondary rounded-sm"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="p-1 rounded-sm linear-hover text-linear-text-tertiary hover:text-priority-urgent"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </Header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            {/* Editable Title */}
            {editingTitle ? (
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                className="w-full text-xl font-semibold text-linear-text-primary mb-6 bg-transparent border-b border-linear-accent outline-none"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-semibold text-linear-text-primary mb-6 cursor-pointer hover:text-linear-accent transition-colors"
                onClick={() => {
                  setTitleDraft(task.title);
                  setEditingTitle(true);
                }}
              >
                {task.title}
              </h1>
            )}

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-medium text-linear-text-tertiary uppercase tracking-wider">
                  Description
                </h3>
                <button
                  onClick={() => {
                    if (editingDescription) {
                      saveDescription();
                    } else {
                      setDescriptionDraft(task.content || "");
                      setEditingDescription(true);
                    }
                  }}
                  className="p-0.5 rounded-sm text-linear-text-tertiary hover:text-linear-text-primary"
                >
                  {editingDescription ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Pencil className="w-3.5 h-3.5" />
                  )}
                </button>
                {editingDescription && (
                  <button
                    onClick={() => setEditingDescription(false)}
                    className="p-0.5 rounded-sm text-linear-text-tertiary hover:text-linear-text-primary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {editingDescription ? (
                <textarea
                  value={descriptionDraft}
                  onChange={(e) => setDescriptionDraft(e.target.value)}
                  rows={8}
                  className="w-full bg-linear-surface border border-linear-border rounded-sm px-3 py-2 text-sm text-linear-text-primary outline-none focus:border-linear-accent resize-none"
                  placeholder="Add description (Markdown supported)..."
                />
              ) : task.content ? (
                <div className="prose prose-invert prose-sm max-w-none text-linear-text-secondary [&_h1]:text-linear-text-primary [&_h2]:text-linear-text-primary [&_h3]:text-linear-text-primary [&_strong]:text-linear-text-primary [&_a]:text-linear-accent [&_code]:bg-linear-surface [&_code]:px-1 [&_code]:rounded [&_pre]:bg-linear-surface [&_pre]:border [&_pre]:border-linear-border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {task.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p
                  className="text-sm text-linear-text-tertiary cursor-pointer hover:text-linear-text-secondary"
                  onClick={() => {
                    setDescriptionDraft("");
                    setEditingDescription(true);
                  }}
                >
                  Click to add description...
                </p>
              )}
            </div>

            {/* Sub-Issues */}
            {subTasks.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-medium text-linear-text-tertiary uppercase tracking-wider mb-3">
                  Sub-Issues
                </h3>
                <div className="space-y-1">
                  {subTasks.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/issues/${sub.id}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-sm linear-hover group"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[sub.status] }}
                      />
                      <span className="text-xs text-linear-text-tertiary">
                        {sub.id}
                      </span>
                      <span className="text-sm text-linear-text-secondary group-hover:text-linear-text-primary">
                        {sub.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Relations */}
            {(blockedByTasks.length > 0 || blockingTasks.length > 0) && (
              <div className="mt-8">
                <h3 className="text-xs font-medium text-linear-text-tertiary uppercase tracking-wider mb-3">
                  Relations
                </h3>
                <div className="space-y-2">
                  {blockedByTasks.map((bt) => (
                    <Link
                      key={bt.id}
                      href={`/issues/${bt.id}`}
                      className="flex items-center gap-2 text-sm text-linear-text-secondary hover:text-linear-text-primary"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-priority-urgent" />
                      <span className="text-xs text-linear-text-tertiary">
                        Blocked by
                      </span>
                      <span>{bt.title}</span>
                    </Link>
                  ))}
                  {blockingTasks.map((bt) => (
                    <Link
                      key={bt.id}
                      href={`/issues/${bt.id}`}
                      className="flex items-center gap-2 text-sm text-linear-text-secondary hover:text-linear-text-primary"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-priority-high" />
                      <span className="text-xs text-linear-text-tertiary">
                        Blocking
                      </span>
                      <span>{bt.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Activity */}
            <div className="mt-8">
              <h3 className="text-xs font-medium text-linear-text-tertiary uppercase tracking-wider mb-3">
                Activity
              </h3>
              <div className="space-y-2 text-xs text-linear-text-tertiary">
                <div>Created on {task.created}</div>
                <div>Last updated {task.updated}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Sidebar */}
        <div className="w-[280px] border-l border-linear-border overflow-y-auto p-4 flex-shrink-0">
          <div className="space-y-4">
            {/* Task ID */}
            <PropertySection icon={<Tag className="w-3.5 h-3.5" />} label="Identifier">
              <span className="text-sm text-linear-text-primary font-mono">
                {task.id}
              </span>
            </PropertySection>

            {/* Status */}
            <PropertySection icon={<Gauge className="w-3.5 h-3.5" />} label="Status">
              <select
                value={task.status}
                onChange={(e) => updateProperty({ status: e.target.value as TaskStatus })}
                className="w-full bg-linear-surface border border-linear-border rounded-sm px-2 py-1 text-sm text-linear-text-primary outline-none focus:border-linear-accent"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </PropertySection>

            {/* Priority */}
            <PropertySection icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Priority">
              <select
                value={task.priority}
                onChange={(e) => updateProperty({ priority: e.target.value as TaskPriority })}
                className="w-full bg-linear-surface border border-linear-border rounded-sm px-2 py-1 text-sm text-linear-text-primary outline-none focus:border-linear-accent"
              >
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </PropertySection>

            {/* Assignee */}
            <PropertySection icon={<User className="w-3.5 h-3.5" />} label="Assignee">
              {editingAssignee ? (
                <input
                  type="text"
                  value={assigneeDraft}
                  onChange={(e) => setAssigneeDraft(e.target.value)}
                  onBlur={saveAssignee}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveAssignee();
                    if (e.key === "Escape") setEditingAssignee(false);
                  }}
                  className="w-full bg-linear-surface border border-linear-border rounded-sm px-2 py-1 text-sm text-linear-text-primary outline-none focus:border-linear-accent"
                  autoFocus
                />
              ) : (
                <span
                  className="text-sm text-linear-text-secondary cursor-pointer hover:text-linear-text-primary"
                  onClick={() => {
                    setAssigneeDraft(task.assignee || "");
                    setEditingAssignee(true);
                  }}
                >
                  {task.assignee || "Unassigned"}
                </span>
              )}
            </PropertySection>

            {/* Project */}
            <PropertySection icon={<Folder className="w-3.5 h-3.5" />} label="Project">
              {task.project ? (
                <Link
                  href={`/projects/${task.project}`}
                  className="text-sm text-linear-text-secondary hover:text-linear-accent"
                >
                  {task.project}
                </Link>
              ) : (
                <span className="text-sm text-linear-text-tertiary">None</span>
              )}
            </PropertySection>

            {/* Cycle */}
            <PropertySection icon={<RefreshCw className="w-3.5 h-3.5" />} label="Cycle">
              {task.cycle ? (
                <Link
                  href={`/cycles/${task.cycle}`}
                  className="text-sm text-linear-text-secondary hover:text-linear-accent"
                >
                  {task.cycle}
                </Link>
              ) : (
                <span className="text-sm text-linear-text-tertiary">None</span>
              )}
            </PropertySection>

            {/* Estimate */}
            <PropertySection icon={<Gauge className="w-3.5 h-3.5" />} label="Estimate">
              <div className="flex gap-1">
                {(["XS", "S", "M", "L", "XL"] as Estimate[]).map((est) => (
                  <button
                    key={est}
                    onClick={() => updateProperty({ estimate: est })}
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-sm border transition-colors",
                      task.estimate === est
                        ? "bg-linear-accent text-white border-linear-accent"
                        : "bg-linear-surface border-linear-border text-linear-text-tertiary hover:text-linear-text-secondary"
                    )}
                  >
                    {est}
                  </button>
                ))}
              </div>
            </PropertySection>

            {/* Labels */}
            <PropertySection icon={<Tag className="w-3.5 h-3.5" />} label="Labels">
              {task.labels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {task.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-sm border border-linear-border"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: LABEL_COLORS[label] || "#8a8a8e",
                        }}
                      />
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-linear-text-tertiary">None</span>
              )}
            </PropertySection>

            {/* Start Date */}
            <PropertySection icon={<Calendar className="w-3.5 h-3.5" />} label="Start Date">
              <input
                type="date"
                value={task.start_date || ""}
                onChange={(e) => updateProperty({ start_date: e.target.value || undefined })}
                className="w-full bg-linear-surface border border-linear-border rounded-sm px-2 py-1 text-sm text-linear-text-primary outline-none focus:border-linear-accent"
              />
            </PropertySection>

            {/* Due Date */}
            <PropertySection icon={<Calendar className="w-3.5 h-3.5" />} label="Due Date">
              <input
                type="date"
                value={task.due_date || ""}
                onChange={(e) => updateProperty({ due_date: e.target.value || undefined })}
                className={cn(
                  "w-full bg-linear-surface border border-linear-border rounded-sm px-2 py-1 text-sm outline-none focus:border-linear-accent",
                  task.due_date &&
                    new Date(task.due_date) < new Date() &&
                    task.status !== "done"
                    ? "text-priority-urgent"
                    : "text-linear-text-primary"
                )}
              />
            </PropertySection>

            {/* Dates */}
            <div className="pt-4 border-t border-linear-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-linear-text-tertiary">Created</span>
                <span className="text-linear-text-secondary">{task.created}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-linear-text-tertiary">Updated</span>
                <span className="text-linear-text-secondary">{task.updated}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertySection({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-linear-text-tertiary">{icon}</span>
        <span className="text-xs font-medium text-linear-text-tertiary">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
