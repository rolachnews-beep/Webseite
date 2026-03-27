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
          className="bg-linear-surface border border-linear-border/60 rounded-lg p-5 transition-colors duration-200 hover:bg-linear-surface-hover group"
        >
          <span className="text-xs text-linear-text-secondary font-medium">
            {card.label}
          </span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-semibold text-linear-text-primary font-mono tabular-nums">
              {card.value}
            </span>
            {card.trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-2xs font-medium px-1.5 py-0.5 rounded-sm",
                  card.trend.direction === "up" && "text-status-done bg-status-done/10",
                  card.trend.direction === "down" && "text-status-cancelled bg-status-cancelled/10",
                  card.trend.direction === "neutral" && "text-linear-text-tertiary bg-linear-surface-hover"
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
