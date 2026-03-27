"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store/ui-store";
import {
  Home,
  CircleDot,
  Columns3,
  Folder,
  RefreshCw,
  GanttChart,
  Bot,
  ChevronLeft,
  Search,
  Layers,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  CircleDot,
  Columns3,
  Folder,
  RefreshCw,
  GanttChart,
  Bot,
};

const NAV_SECTIONS = [
  {
    items: [
      { label: "Home", href: "/", icon: "Home", shortcut: "G H" },
    ],
  },
  {
    title: "Team",
    items: [
      { label: "Issues", href: "/issues", icon: "CircleDot", shortcut: "G I" },
      { label: "Board", href: "/board", icon: "Columns3", shortcut: "G B" },
      { label: "Projects", href: "/projects", icon: "Folder", shortcut: "G P" },
      { label: "Cycles", href: "/cycles", icon: "RefreshCw", shortcut: "G C" },
      { label: "Timeline", href: "/timeline", icon: "GanttChart", shortcut: "G T" },
    ],
  },
  {
    title: "Collaboration",
    items: [
      { label: "Agents", href: "/agents", icon: "Bot", shortcut: "G A" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, setCommandPaletteOpen } = useUIStore();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-linear-sidebar border-r border-linear-border transition-all duration-200 flex-shrink-0",
        sidebarOpen ? "w-[240px]" : "w-[48px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-3 border-b border-linear-border">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-linear-accent flex items-center justify-center">
              <Layers className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-linear-text-primary">
              Workspace
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-sm linear-hover text-linear-text-secondary"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform",
              !sidebarOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Search */}
      {sidebarOpen && (
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="mx-2 mt-2 flex items-center gap-2 px-2 py-1.5 rounded-sm text-linear-text-tertiary linear-hover text-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="ml-auto text-[10px] bg-linear-surface px-1 py-0.5 rounded border border-linear-border">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="mb-2">
            {section.title && sidebarOpen && (
              <div className="px-3 py-1 text-[11px] font-medium text-linear-text-tertiary uppercase tracking-wider">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = ICON_MAP[item.icon] || CircleDot;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 mx-1 px-2 py-1.5 rounded-sm text-[13px] transition-colors duration-150 relative group",
                    isActive
                      ? "bg-linear-surface text-linear-text-primary"
                      : "text-linear-text-secondary hover:bg-linear-surface-hover hover:text-linear-text-primary"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-linear-accent rounded-r" />
                  )}
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span>{item.label}</span>
                      <span className="ml-auto text-[10px] text-linear-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.shortcut}
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
