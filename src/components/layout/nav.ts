import {
  BookA,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Headphones,
  House,
  Library,
  NotebookPen,
  Printer,
  Repeat,
  Settings,
  Swords,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type TabId = "home" | "learn" | "review" | "profile";

export interface Tab {
  id: TabId;
  href: string;
  label: string;
  icon: LucideIcon;
  /** Route prefixes that belong to this tab (besides `href` itself). */
  match: string[];
}

/** The only four top-level destinations. Mobile tab bar and desktop rail both render this. */
export const TABS: Tab[] = [
  { id: "home", href: "/", label: "Trang chủ", icon: House, match: ["/today"] },
  {
    id: "learn",
    href: "/learn/",
    label: "Học",
    icon: BookOpen,
    match: ["/learn", "/roadmap", "/stage", "/kana", "/vocabulary", "/grammar", "/kanji", "/reading", "/listening", "/quiz", "/exams", "/modules", "/native"],
  },
  { id: "review", href: "/review/", label: "Ôn tập", icon: Repeat, match: ["/review"] },
  { id: "profile", href: "/profile/", label: "Hồ sơ", icon: UserRound, match: ["/profile", "/achievements", "/planner", "/notes", "/settings"] },
];

const trim = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

export function tabFor(pathname: string): Tab {
  const path = trim(pathname);
  if (path === "/") return TABS[0];
  return TABS.find((t) => t.match.some((m) => path === m || path.startsWith(`${m}/`))) ?? TABS[0];
}

/** True on a tab's own page; nested pages get a back link to it instead. */
export function isTabRoot(pathname: string): boolean {
  return TABS.some((t) => trim(t.href) === trim(pathname));
}

export interface MenuItem {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
}

/** Free practice tools, reachable from the Learn tab. */
export const PRACTICE_LIBRARY: MenuItem[] = [
  { href: "/vocabulary/", label: "Từ vựng", description: "Tra cứu & luyện theo cấp", icon: BookA },
  { href: "/grammar/", label: "Ngữ pháp", description: "Mẫu câu N5 → N1", icon: BookOpen },
  { href: "/kanji/", label: "Kanji", description: "Âm Hán Việt, thứ tự nét", icon: Library },
  { href: "/reading/", label: "Đọc hiểu", description: "Bài đọc có furigana", icon: FileText },
  { href: "/listening/", label: "Nghe hiểu", description: "Hội thoại & bản tin", icon: Headphones },
  { href: "/quiz/", label: "Quiz & Thử thách", description: "Trắc nghiệm, 60 giây", icon: Swords },
  { href: "/exams/", label: "Thi thử JLPT", description: "Đề N5 → N1", icon: GraduationCap },
];

export const PROFILE_MENU: MenuItem[] = [
  { href: "/achievements/", label: "Thành tích & cấp độ", icon: Trophy },
  { href: "/planner/", label: "Kế hoạch, lịch học & mục tiêu", icon: CalendarDays },
  { href: "/notes/", label: "Ghi chú & từ điển cá nhân", icon: NotebookPen },
  { href: "/report/", label: "Báo cáo tiến độ (PDF)", icon: Printer },
  { href: "/settings/", label: "Cài đặt & dữ liệu", icon: Settings },
];
