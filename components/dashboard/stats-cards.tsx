"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCard {
  label: string;
  value: number;
  trend?: { value: number; direction: "up" | "down" | "neutral" };
}

interface StatsCardsProps {
  cards: StatCard[];
}

export function StatsCards({ cards }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-linear-surface border border-linear-border rounded-[6px] p-4"
        >
          <span className="text-xs text-linear-text-secondary font-medium">
            {card.label}
          </span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-semibold text-linear-text-primary tabular-nums">
              {card.value}
            </span>
            {card.trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  card.trend.direction === "up" && "text-status-done",
                  card.trend.direction === "down" && "text-status-cancelled",
                  card.trend.direction === "neutral" && "text-linear-text-tertiary"
                )}
              >
                {card.trend.direction === "up" && (
                  <TrendingUp className="w-3 h-3" />
                )}
                {card.trend.direction === "down" && (
                  <TrendingDown className="w-3 h-3" />
                )}
                {card.trend.direction === "neutral" && (
                  <Minus className="w-3 h-3" />
                )}
                <span>{card.trend.value}%</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
