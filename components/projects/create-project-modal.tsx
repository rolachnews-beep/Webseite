"use client";

import { useState } from "react";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_HEALTH_LABELS,
  ProjectStatus,
  ProjectHealth,
} from "@/lib/types/project";
import { X } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("planned");
  const [health, setHealth] = useState<ProjectHealth>("on-track");
  const [lead, setLead] = useState("");
  const [teams, setTeams] = useState<string[]>([]);
  const [teamInput, setTeamInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("planned");
    setHealth("on-track");
    setLead("");
    setTeams([]);
    setTeamInput("");
    setStartDate("");
    setTargetDate("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        status,
        health,
        teams,
      };
      if (description.trim()) body.description = description.trim();
      if (lead.trim()) body.lead = lead.trim();
      if (startDate) body.start_date = startDate;
      if (targetDate) body.target_date = targetDate;

      await fetch("/api/vault/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      handleClose();
      onCreated();
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const addTeam = () => {
    const val = teamInput.trim();
    if (val && !teams.includes(val)) {
      setTeams([...teams, val]);
    }
    setTeamInput("");
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full bg-linear-surface border border-linear-border rounded-sm px-2 py-1.5 text-sm text-linear-text-primary outline-none focus:border-linear-accent";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative w-[560px] max-h-[75vh] bg-linear-surface border border-linear-border rounded-lg shadow-2xl animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-linear-border">
          <h2 className="text-sm font-semibold text-linear-text-primary">
            New Project
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-sm linear-hover text-linear-text-tertiary hover:text-linear-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
                className={inputClass}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project description"
                rows={3}
                className={inputClass + " resize-none"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className={inputClass}
                >
                  {Object.entries(PROJECT_STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Health
                </label>
                <select
                  value={health}
                  onChange={(e) => setHealth(e.target.value as ProjectHealth)}
                  className={inputClass}
                >
                  {Object.entries(PROJECT_HEALTH_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Lead
                </label>
                <input
                  type="text"
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  placeholder="Project lead"
                  className={inputClass}
                />
              </div>

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

              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Teams */}
            <div>
              <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                Teams
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {teams.map((team) => (
                  <span
                    key={team}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-sm bg-linear-accent/10 text-linear-accent"
                  >
                    {team}
                    <button
                      type="button"
                      onClick={() => setTeams(teams.filter((t) => t !== team))}
                      className="ml-0.5 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTeam();
                    }
                  }}
                  placeholder="Add team..."
                  className={inputClass + " flex-1"}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-linear-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs text-linear-text-secondary hover:text-linear-text-primary rounded-sm linear-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-4 py-1.5 text-xs bg-linear-accent text-white rounded-sm hover:bg-linear-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
