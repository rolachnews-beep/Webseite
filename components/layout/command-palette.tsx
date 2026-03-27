"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useUIStore } from "@/lib/store/ui-store";
import { useTaskStore } from "@/lib/store/task-store";
import {
  Home,
  CircleDot,
  Columns3,
  Folder,
  RefreshCw,
  GanttChart,
  Search,
} from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { tasks } = useTaskStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!commandPaletteOpen) setSearch("");
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const navigate = (path: string) => {
    router.push(path);
    setCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => setCommandPaletteOpen(false)}
      />
      <Command
        className="relative w-[560px] max-h-[400px] bg-linear-surface border border-linear-border rounded-lg shadow-2xl overflow-hidden animate-fade-in"
        shouldFilter={true}
      >
        <div className="flex items-center gap-2 px-4 border-b border-linear-border">
          <Search className="w-4 h-4 text-linear-text-tertiary" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="w-full py-3 text-sm bg-transparent text-linear-text-primary placeholder-linear-text-tertiary outline-none"
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto p-1">
          <Command.Empty className="px-4 py-8 text-center text-sm text-linear-text-tertiary">
            No results found.
          </Command.Empty>

          <Command.Group
            heading="Navigation"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-linear-text-tertiary [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
          >
            <CommandItem onSelect={() => navigate("/")} icon={<Home className="w-4 h-4" />}>
              Home
            </CommandItem>
            <CommandItem onSelect={() => navigate("/issues")} icon={<CircleDot className="w-4 h-4" />}>
              Issues
            </CommandItem>
            <CommandItem onSelect={() => navigate("/board")} icon={<Columns3 className="w-4 h-4" />}>
              Board
            </CommandItem>
            <CommandItem onSelect={() => navigate("/projects")} icon={<Folder className="w-4 h-4" />}>
              Projects
            </CommandItem>
            <CommandItem onSelect={() => navigate("/cycles")} icon={<RefreshCw className="w-4 h-4" />}>
              Cycles
            </CommandItem>
            <CommandItem onSelect={() => navigate("/timeline")} icon={<GanttChart className="w-4 h-4" />}>
              Timeline
            </CommandItem>
          </Command.Group>

          {search && tasks.length > 0 && (
            <Command.Group
              heading="Issues"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-linear-text-tertiary [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              {tasks.slice(0, 8).map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() => navigate(`/issues/${task.id}`)}
                  icon={<CircleDot className="w-4 h-4" />}
                >
                  <span className="text-linear-text-tertiary text-xs mr-2">
                    {task.id}
                  </span>
                  {task.title}
                </CommandItem>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}

function CommandItem({
  children,
  onSelect,
  icon,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-2 px-3 py-2 mx-1 rounded-sm text-sm text-linear-text-secondary cursor-pointer data-[selected=true]:bg-linear-surface-hover data-[selected=true]:text-linear-text-primary"
    >
      {icon && <span className="text-linear-text-tertiary">{icon}</span>}
      {children}
    </Command.Item>
  );
}
