"use client";

import { Sidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <CommandPalette />
    </div>
  );
}
