"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "../store/ui-store";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { setCommandPaletteOpen } = useUIStore();
  const lastKey = useRef<string | null>(null);
  const lastKeyTime = useRef<number>(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
        return;

      // Cmd+K: Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      const now = Date.now();
      const key = e.key.toLowerCase();

      // G + key navigation shortcuts
      if (lastKey.current === "g" && now - lastKeyTime.current < 500) {
        switch (key) {
          case "h": router.push("/"); break;
          case "i": router.push("/issues"); break;
          case "b": router.push("/board"); break;
          case "p": router.push("/projects"); break;
          case "c": router.push("/cycles"); break;
          case "t": router.push("/timeline"); break;
        }
        lastKey.current = null;
        return;
      }

      lastKey.current = key;
      lastKeyTime.current = now;
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, setCommandPaletteOpen]);
}
