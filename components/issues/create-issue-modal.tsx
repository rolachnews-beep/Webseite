"use client";

import { useState, useEffect, useCallback } from "react";
import { useUIStore } from "@/lib/store/ui-store";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  TaskStatus,
  TaskPriority,
  Estimate,
} from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import { Cycle } from "@/lib/types/cycle";
import { LABEL_COLORS } from "@/lib/constants";
import { X, Plus } from "lucide-react";

const ESTIMATES: Estimate[] = ["XS", "S", "M", "L", "XL"];

export function CreateIssueModal() {
  const { createIssueModalOpen, setCreateIssueModalOpen } = useUIStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("backlog");
  const [priority, setPriority] = useState<TaskPriority>("none");
  const [assignee, setAssignee] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [project, setProject] = useState("");
  const [cycle, setCycle] = useState("");
  const [estimate, setEstimate] = useState<Estimate | "">("");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    if (createIssueModalOpen) {
      Promise.all([
        fetch("/api/vault/projects").then((r) => r.json()),
        fetch("/api/vault/cycles").then((r) => r.json()),
      ]).then(([p, c]) => {
        setProjects(p);
        setCycles(c);
      });
    }
  }, [createIssueModalOpen]);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setStatus("backlog");
    setPriority("none");
    setAssignee("");
    setLabels([]);
    setLabelInput("");
    setProject("");
    setCycle("");
    setEstimate("");
    setDueDate("");
    setStartDate("");
  }, []);

  const close = useCallback(() => {
    setCreateIssueModalOpen(false);
    resetForm();
  }, [setCreateIssueModalOpen, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        status,
        priority,
        labels,
      };
      if (description.trim()) body.content = description.trim();
      if (assignee.trim()) body.assignee = assignee.trim();
      if (project) body.project = project;
      if (cycle) body.cycle = cycle;
      if (estimate) body.estimate = estimate;
      if (dueDate) body.due_date = dueDate;
      if (startDate) body.start_date = startDate;

      await fetch("/api/vault/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      close();
      window.location.reload();
    } catch (error) {
      console.error("Failed to create issue:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const addLabel = () => {
    const val = labelInput.trim().toLowerCase();
    if (val && !labels.includes(val)) {
      setLabels([...labels, val]);
    }
    setLabelInput("");
  };

  if (!createIssueModalOpen) return null;

  const inputClass =
    "w-full bg-linear-surface border border-linear-border rounded-sm px-2 py-1.5 text-sm text-linear-text-primary outline-none focus:border-linear-accent";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="fixed inset-0 bg-black/60" onClick={close} />
      <div className="relative w-[640px] max-h-[80vh] bg-linear-surface border border-linear-border rounded-lg shadow-2xl animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-linear-border">
          <h2 className="text-sm font-semibold text-linear-text-primary">
            Create Issue
          </h2>
          <button
            onClick={close}
            className="p-1 rounded-sm linear-hover text-linear-text-tertiary hover:text-linear-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title"
                className={inputClass}
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description (Markdown supported)"
                rows={3}
                className={inputClass + " resize-none"}
              />
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className={inputClass}
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className={inputClass}
                >
                  {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Assignee
                </label>
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Assign to..."
                  className={inputClass}
                />
              </div>

              {/* Estimate */}
              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Estimate
                </label>
                <select
                  value={estimate}
                  onChange={(e) => setEstimate(e.target.value as Estimate | "")}
                  className={inputClass}
                >
                  <option value="">None</option>
                  {ESTIMATES.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project */}
              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Project
                </label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className={inputClass}
                >
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cycle */}
              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Cycle
                </label>
                <select
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value)}
                  className={inputClass}
                >
                  <option value="">None</option>
                  {cycles.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                Labels
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-sm border border-linear-border text-linear-text-secondary"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: LABEL_COLORS[label] || "#8a8a8e",
                      }}
                    />
                    {label}
                    <button
                      type="button"
                      onClick={() =>
                        setLabels(labels.filter((l) => l !== label))
                      }
                      className="ml-0.5 text-linear-text-tertiary hover:text-linear-text-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLabel();
                    }
                  }}
                  placeholder="Add label..."
                  className={inputClass + " flex-1"}
                />
                <button
                  type="button"
                  onClick={addLabel}
                  className="px-2 py-1.5 text-xs bg-linear-surface-hover border border-linear-border rounded-sm text-linear-text-secondary hover:text-linear-text-primary"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {Object.keys(LABEL_COLORS).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {Object.keys(LABEL_COLORS)
                    .filter((l) => !labels.includes(l))
                    .map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLabels([...labels, l])}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-2xs rounded-sm text-linear-text-tertiary hover:text-linear-text-secondary hover:bg-linear-surface-hover"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: LABEL_COLORS[l] }}
                        />
                        {l}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-linear-border">
            <button
              type="button"
              onClick={close}
              className="px-3 py-1.5 text-xs text-linear-text-secondary hover:text-linear-text-primary rounded-sm linear-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-4 py-1.5 text-xs bg-linear-accent text-white rounded-sm hover:bg-linear-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
