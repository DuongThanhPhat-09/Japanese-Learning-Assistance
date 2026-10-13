"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Flame, Moon, Sun } from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import { useAchievementWatcher, useProgressCelebrations, useStudyTimer } from "@/hooks/useBackground";
import { useStats } from "@/hooks/useStats";
import { useAppStore } from "@/store/useAppStore";
import { dateKey } from "@/lib/date";
import { CelebrationHost } from "@/components/motivation/CelebrationHost";
import { isTabRoot, tabFor, TABS } from "./nav";

export function useTheme() {
  const [dark, setDark] = useState(false);
  // Several toggles can be on screen (rail + Profile); all follow the <html> class.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };
  return { dark, toggle };
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="bg-hero grid size-9 place-items-center rounded-xl font-jp text-lg font-black text-white shadow-soft">日</span>
      {!compact && <span className="text-lg font-extrabold tracking-tight">NihongoPath</span>}
    </Link>
  );
}

/** Streak is the one motivational signal kept on every screen. */
function StreakChip() {
  const { streak } = useStats();
  const activeToday = useAppStore((s) => (s.activity[dateKey()]?.xp ?? 0) > 0);
  return (
    <Link
      href="/profile/"
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold tabular-nums transition-colors",
        activeToday ? "bg-streak/12 text-streak-ink" : "bg-muted text-muted-foreground",
      )}
      title={activeToday ? "Chuỗi ngày học" : "Học hôm nay để giữ chuỗi"}
    >
      <Flame className={cn("size-[18px]", activeToday && "fill-streak/70")} />
      {streak}
    </Link>
  );
}

function TopBar() {
  const pathname = usePathname();
  const tab = tabFor(pathname);
  const root = isTabRoot(pathname);
  return (
    <header className="no-print sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
        {root ? (
          <div className="lg:invisible">
            <Brand />
          </div>
        ) : (
          <Link href={tab.href} className="-ml-2 flex items-center gap-0.5 rounded-lg py-1.5 pl-1 pr-2.5 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ChevronLeft className="size-5" /> {tab.label}
          </Link>
        )}
        <StreakChip />
      </div>
    </header>
  );
}

function SideRail() {
  const pathname = usePathname();
  const active = tabFor(pathname).id;
  const { dark, toggle } = useTheme();
  return (
    <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-8 border-r border-hairline bg-sidebar px-4 py-6 lg:flex">
      <div className="px-2">
        <Brand />
      </div>
      <nav className="flex flex-col gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={cn(
              "flex items-center gap-3.5 rounded-2xl px-4 py-3 text-[15px] font-bold transition-colors",
              active === t.id ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <t.icon className="size-6" strokeWidth={active === t.id ? 2.4 : 2} />
            {t.label}
          </Link>
        ))}
      </nav>
      <button onClick={toggle} className="mt-auto flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
        {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        {dark ? "Giao diện sáng" : "Giao diện tối"}
      </button>
    </aside>
  );
}

function BottomTabs() {
  const pathname = usePathname();
  const active = tabFor(pathname).id;
  return (
    <nav className="no-print pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-background/90 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-4">
        {TABS.map((t) => {
          const on = active === t.id;
          return (
            <Link key={t.id} href={t.href} className={cn("flex flex-col items-center justify-center gap-1 text-[11px] font-bold", on ? "text-primary" : "text-muted-foreground")}>
              <span className={cn("grid h-8 w-14 place-items-center rounded-full transition-colors", on && "bg-primary/12")}>
                <t.icon className="size-[22px]" strokeWidth={on ? 2.4 : 2} />
              </span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function BackgroundServices() {
  useStudyTimer();
  useAchievementWatcher();
  useProgressCelebrations();
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const bare = pathname.startsWith("/report");

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <span className="bg-hero grid size-14 animate-pulse place-items-center rounded-2xl font-jp text-2xl font-black text-white">日</span>
          <span className="text-sm">Đang tải dữ liệu học tập…</span>
        </div>
      </div>
    );
  }

  if (bare) {
    return (
      <>
        {children}
        <Toaster richColors position="top-center" />
      </>
    );
  }

  return (
    <div className="flex min-h-screen">
      <BackgroundServices />
      <SideRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-32 pt-4 sm:px-6 lg:pb-16 lg:pt-6">{children}</main>
        <BottomTabs />
      </div>
      <CelebrationHost />
      <Toaster richColors position="top-center" />
    </div>
  );
}
