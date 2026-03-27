"use client";

import { useState } from "react";
import { CYCLE_STATUS_LABELS, CycleStatus } from "@/lib/types/cycle";
import { X } from "lucide-react";

interface CreateCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateCycleModal({
  isOpen,
  onClose,
  onCreated,
}: CreateCycleModalProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<CycleStatus>("upcoming");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setStatus("upcoming");
    setError("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await fetch("/api/vault/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          start_date: startDate,
          end_date: endDate,
          status,
        }),
      });

      handleClose();
      onCreated();
    } catch (err) {
      console.error("Failed to create cycle:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full bg-linear-surface border border-linear-border rounded-sm px-2 py-1.5 text-sm text-linear-text-primary outline-none focus:border-linear-accent";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative w-[480px] bg-linear-surface border border-linear-border rounded-lg shadow-2xl animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-linear-border">
          <h2 className="text-sm font-semibold text-linear-text-primary">
            New Cycle
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-sm linear-hover text-linear-text-tertiary hover:text-linear-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sprint 26-09"
                className={inputClass}
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-priority-urgent">{error}</p>
            )}

            <div>
              <label className="block text-xs font-medium text-linear-text-tertiary mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CycleStatus)}
                className={inputClass}
              >
                {Object.entries(CYCLE_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
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
              disabled={!title.trim() || !startDate || !endDate || submitting}
              className="px-4 py-1.5 text-xs bg-linear-accent text-white rounded-sm hover:bg-linear-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Creating..." : "Create Cycle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
