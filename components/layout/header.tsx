"use client";

import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <div className="flex items-center justify-between h-12 px-6 border-b border-linear-border flex-shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-linear-text-primary">
          {title}
        </h1>
        {subtitle && (
          <span className="text-xs text-linear-text-tertiary">{subtitle}</span>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
