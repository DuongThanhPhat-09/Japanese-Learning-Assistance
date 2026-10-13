import { BookMarked, BookOpen, Briefcase, Code, GraduationCap, Library, Newspaper, PenLine, Sparkles, Sprout, Type, Users, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = { Sprout, PenLine, Type, BookOpen, BookMarked, Library, Newspaper, GraduationCap, Briefcase, Code, Users, Sparkles };

export function StageIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? BookOpen;
  return <Icon className={className} />;
}
