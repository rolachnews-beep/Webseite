"use client";

import { Actor } from "@/lib/types/actor";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CapabilityMatrixProps {
  actors: Actor[];
}

export function CapabilityMatrix({ actors }: CapabilityMatrixProps) {
  // Collect all unique capabilities
  const allCapabilities = Array.from(
    new Set(actors.flatMap((a) => a.capabilities))
  ).sort();

  if (allCapabilities.length === 0) return null;

  return (
    <div className="linear-card overflow-hidden">
      <div className="px-4 py-3 border-b border-linear-border">
        <h3 className="text-sm font-semibold text-linear-text-primary">
          Capability Matrix
        </h3>
        <p className="text-2xs text-linear-text-tertiary mt-0.5">
          Who can do what
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-linear-border">
              <th className="text-left px-4 py-2 text-2xs font-medium text-linear-text-tertiary uppercase tracking-wider sticky left-0 bg-linear-card">
                Actor
              </th>
              {allCapabilities.map((cap) => (
                <th
                  key={cap}
                  className="px-3 py-2 text-2xs font-medium text-linear-text-tertiary text-center whitespace-nowrap"
                >
                  {cap}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actors.map((actor) => (
              <tr
                key={actor.id}
                className="border-b border-linear-border last:border-b-0 hover:bg-linear-surface-hover"
              >
                <td className="px-4 py-2 text-xs text-linear-text-primary font-medium sticky left-0 bg-linear-card whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          actor.status === "idle"
                            ? "#27ae60"
                            : actor.status === "working"
                              ? "#f2c94c"
                              : "#6b7280",
                      }}
                    />
                    {actor.name}
                  </div>
                </td>
                {allCapabilities.map((cap) => (
                  <td key={cap} className="px-3 py-2 text-center">
                    {actor.capabilities.includes(cap) ? (
                      <Check className="w-3.5 h-3.5 text-green-400 mx-auto" />
                    ) : (
                      <span className="text-linear-text-tertiary text-2xs">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
