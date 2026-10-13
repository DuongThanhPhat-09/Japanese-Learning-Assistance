import type { LearnerStats } from "@/lib/stats";

export interface AchievementContext {
  stats: LearnerStats;
  xp: number;
  level: number;
  examsPassed: number;
  examsTaken: number;
  challengeBest: number;
  notes: number;
  dictionary: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji badge
  tier: "bronze" | "silver" | "gold" | "platinum";
  check: (c: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", title: "Bước đầu tiên", description: "Nhận XP đầu tiên", icon: "🌱", tier: "bronze", check: (c) => c.xp > 0 },
  { id: "kana-10", title: "Làm quen Kana", description: "Học 10 ký tự kana", icon: "あ", tier: "bronze", check: (c) => c.stats.kanaLearned >= 10 },
  { id: "kana-46", title: "Thuộc bảng cơ bản", description: "Học 46 ký tự kana", icon: "🈁", tier: "silver", check: (c) => c.stats.kanaLearned >= 46 },
  { id: "kana-all", title: "Bậc thầy Kana", description: "Học 150 ký tự kana", icon: "🎌", tier: "gold", check: (c) => c.stats.kanaLearned >= 150 },
  { id: "vocab-10", title: "Từ vựng 10", description: "Học 10 từ vựng", icon: "📗", tier: "bronze", check: (c) => c.stats.vocabLearned >= 10 },
  { id: "vocab-100", title: "Từ vựng 100", description: "Học 100 từ vựng", icon: "📘", tier: "silver", check: (c) => c.stats.vocabLearned >= 100 },
  { id: "vocab-500", title: "Từ vựng 500", description: "Học 500 từ vựng", icon: "📚", tier: "gold", check: (c) => c.stats.vocabLearned >= 500 },
  { id: "kanji-10", title: "Chữ Hán đầu tiên", description: "Học 10 chữ Hán", icon: "漢", tier: "bronze", check: (c) => c.stats.kanjiLearned >= 10 },
  { id: "kanji-100", title: "Trăm chữ Hán", description: "Học 100 chữ Hán", icon: "🀄", tier: "gold", check: (c) => c.stats.kanjiLearned >= 100 },
  { id: "grammar-10", title: "Nhà ngữ pháp", description: "Hoàn thành 10 mẫu ngữ pháp", icon: "🧩", tier: "silver", check: (c) => c.stats.grammarCompleted >= 10 },
  { id: "grammar-50", title: "Kiến trúc sư câu", description: "Hoàn thành 50 mẫu ngữ pháp", icon: "🏛️", tier: "gold", check: (c) => c.stats.grammarCompleted >= 50 },
  { id: "streak-3", title: "Khởi động", description: "Chuỗi 3 ngày học", icon: "🔥", tier: "bronze", check: (c) => c.stats.longestStreak >= 3 },
  { id: "streak-7", title: "Một tuần bền bỉ", description: "Chuỗi 7 ngày học", icon: "⚡", tier: "silver", check: (c) => c.stats.longestStreak >= 7 },
  { id: "streak-30", title: "Kỷ luật thép", description: "Chuỗi 30 ngày học", icon: "🏆", tier: "gold", check: (c) => c.stats.longestStreak >= 30 },
  { id: "streak-100", title: "Huyền thoại", description: "Chuỗi 100 ngày học", icon: "👑", tier: "platinum", check: (c) => c.stats.longestStreak >= 100 },
  { id: "xp-1000", title: "1.000 XP", description: "Đạt 1.000 XP", icon: "💎", tier: "silver", check: (c) => c.xp >= 1000 },
  { id: "xp-10000", title: "10.000 XP", description: "Đạt 10.000 XP", icon: "🌟", tier: "platinum", check: (c) => c.xp >= 10000 },
  { id: "level-10", title: "Cấp 10", description: "Đạt cấp độ 10", icon: "🎖️", tier: "gold", check: (c) => c.level >= 10 },
  { id: "reader", title: "Người đọc", description: "Đọc xong 3 bài đọc", icon: "📰", tier: "bronze", check: (c) => c.stats.readingDone >= 3 },
  { id: "listener", title: "Đôi tai vàng", description: "Hoàn thành 3 bài nghe", icon: "🎧", tier: "bronze", check: (c) => c.stats.listeningDone >= 3 },
  { id: "exam-first", title: "Sĩ tử", description: "Làm bài thi thử đầu tiên", icon: "📝", tier: "bronze", check: (c) => c.examsTaken >= 1 },
  { id: "exam-pass", title: "Đỗ thi thử", description: "Đỗ một bài thi thử JLPT", icon: "🎓", tier: "gold", check: (c) => c.examsPassed >= 1 },
  { id: "reviews-500", title: "Ôn tập chăm chỉ", description: "500 lượt ôn tập SRS", icon: "🔁", tier: "silver", check: (c) => c.stats.totalReviews >= 500 },
  { id: "time-600", title: "10 giờ học", description: "Tổng thời gian học 10 giờ", icon: "⏱️", tier: "silver", check: (c) => c.stats.totalMinutes >= 600 },
  { id: "challenge-20", title: "Thử thách 20", description: "Đạt 20 điểm ở chế độ thử thách", icon: "🚀", tier: "silver", check: (c) => c.challengeBest >= 20 },
  { id: "note-taker", title: "Người ghi chép", description: "Tạo 5 ghi chú", icon: "🗒️", tier: "bronze", check: (c) => c.notes >= 5 },
  { id: "collector", title: "Nhà sưu tầm", description: "Thêm 20 từ vào từ điển cá nhân", icon: "🗂️", tier: "silver", check: (c) => c.dictionary >= 20 },
];

export const TIER_COLOR: Record<Achievement["tier"], string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-slate-400 to-slate-200",
  gold: "from-yellow-500 to-amber-300",
  platinum: "from-cyan-400 to-fuchsia-400",
};
