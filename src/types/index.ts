/** Content levels. JLPT levels plus the kana/intro stages and professional tracks. */
export type Level =
  | "intro"
  | "kana"
  | "N5"
  | "N4"
  | "N3"
  | "N2"
  | "N1"
  | "business"
  | "it"
  | "brse"
  | "native";

export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type StageId =
  | "beginner"
  | "hiragana"
  | "katakana"
  | "n5"
  | "n4"
  | "n3"
  | "n2"
  | "n1"
  | "business"
  | "it"
  | "brse"
  | "native";

export interface Stage {
  id: StageId;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  /** Content levels whose items belong to this stage. */
  levels: Level[];
  /** Kana script taught in this stage, if any. */
  kana?: "hiragana" | "katakana";
  /** Extra items borrowed from other levels (previews for the early stages). */
  extra?: { grammar?: string[]; listening?: string[]; articles?: string[] };
  goals: string[];
}

// ---------------------------------------------------------------- Kana

export type KanaGroup = "basic" | "dakuten" | "yoon" | "extended";

export interface Kana {
  id: string; // e.g. "h:ka"
  script: "hiragana" | "katakana";
  char: string;
  romaji: string;
  group: KanaGroup;
  row: string;
  strokes?: number;
  hint?: string;
}

// ---------------------------------------------------------------- Vocabulary

export interface Vocab {
  id: string;
  level: Level;
  kanji: string; // may equal kana for kana-only words
  kana: string;
  romaji: string;
  meaning: string; // Vietnamese
  pos: string;
  example: string;
  exampleVi: string;
  difficulty: Difficulty;
  tags: string[];
}

// ---------------------------------------------------------------- Grammar

export interface GrammarExample {
  jp: string;
  vi: string;
}

export interface GrammarQuiz {
  /** Sentence with "＿＿" marking the blank. */
  q: string;
  answer: string;
  distractors: string[];
}

export interface Grammar {
  id: string;
  level: Level;
  pattern: string;
  meaning: string;
  formation: string;
  explanation: string;
  notes: string[];
  mistakes: string[];
  examples: GrammarExample[];
  compare?: { pattern: string; note: string }[];
  quiz?: GrammarQuiz;
}

// ---------------------------------------------------------------- Kanji

export interface Kanji {
  char: string;
  level: JlptLevel;
  hanViet: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  strokes: number;
  radicals: string[];
  examples: { word: string; reading: string; meaning: string }[];
  sentence: { jp: string; vi: string };
  hint: string;
}

// ---------------------------------------------------------------- Reading

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number; // index into options
  explanation?: string;
}

export type ArticleCategory =
  | "daily"
  | "story"
  | "news"
  | "essay"
  | "technical"
  | "novel"
  | "business-report"
  | "debate"
  | "academic";

export interface Article {
  id: string;
  level: Level;
  category: ArticleCategory;
  title: string;
  titleVi: string;
  /** Paragraphs using `{漢字|かんじ}` ruby markup. */
  paragraphs: string[];
  translation: string[];
  glossary: { word: string; reading: string; meaning: string }[];
  questions: QuizQuestion[];
  /** For debate / discussion items. */
  discussion?: string[];
}

// ---------------------------------------------------------------- Listening

export type ListeningCategory = "daily" | "dialog" | "office" | "meeting" | "business-call" | "news";

export interface DialogLine {
  speaker: string;
  jp: string; // ruby markup allowed
  vi: string;
}

export interface ListeningExercise {
  id: string;
  level: Level;
  category: ListeningCategory;
  title: string;
  titleVi: string;
  situation: string;
  /** Path to a local audio file under /public. Falls back to speech synthesis if missing. */
  audio: string;
  lines: DialogLine[];
  questions: QuizQuestion[];
}

// ---------------------------------------------------------------- Professional modules

export interface Phrase {
  jp: string;
  reading?: string;
  vi: string;
  note?: string;
}

export interface Conversation {
  title: string;
  lines: DialogLine[];
}

export interface RolePlay {
  title: string;
  situation: string;
  yourRole: string;
  goal: string;
  hints: string[];
  modelAnswer: string;
}

export interface ModuleTopic {
  id: string;
  title: string;
  titleJp: string;
  summary: string;
  phrases: Phrase[];
  conversations: Conversation[];
  /** e.g. an email or report template */
  templates?: { title: string; body: string; vi?: string }[];
  roleplays?: RolePlay[];
  /** vocab ids or inline vocabulary tags to pull from the vocabulary DB */
  vocabTag?: string;
}

export interface ProModule {
  id: "business" | "it" | "brse";
  title: string;
  description: string;
  topics: ModuleTopic[];
}

export interface KeigoVerb {
  plain: string;
  meaning: string;
  teineigo: string;
  sonkeigo: string;
  kenjougo: string;
}

// ---------------------------------------------------------------- Exams

export type ExamSection = "vocabulary" | "kanji" | "grammar" | "reading" | "listening";

export interface ExamQuestion extends QuizQuestion {
  section: ExamSection;
  /** Reference used for "recommended review": e.g. "grammar:n5-01", "kanji:日", "vocab:N5:食べる" */
  ref?: string;
  passage?: string;
  audioLines?: DialogLine[];
}

export interface MockExam {
  level: JlptLevel;
  minutes: number;
  passMark: number; // percentage
  questions: ExamQuestion[];
}

// ---------------------------------------------------------------- SRS

export type CardState = "new" | "learning" | "review" | "mastered";
export type Grade = "again" | "hard" | "good" | "easy";
export type CardKind = "vocab" | "kanji" | "grammar" | "kana" | "custom";

export interface SrsCard {
  id: string; // `${kind}:${itemId}`
  kind: CardKind;
  itemId: string;
  state: CardState;
  /** Index into REVIEW_INTERVALS of the interval most recently scheduled; -1 when new. */
  step: number;
  due: number; // epoch ms
  reps: number;
  lapses: number;
  lastReviewed?: number;
  createdAt: number;
}

// ---------------------------------------------------------------- Productivity

export interface PlannerTask {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: "vocabulary" | "grammar" | "kanji" | "reading" | "listening" | "review" | "exam" | "other";
  minutes: number;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DictEntry {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  example?: string;
  tags: string[];
  createdAt: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  xp: number;
  minutes: number;
  reviews: number;
  correct: number;
  answered: number;
  lessons: number;
  /** Fine-grained event counters used by the study engine (srsPass, srsFail, learned, recall, shadow, reading, listening, quiz, roleplay, planDone, mock). */
  counters?: Record<string, number>;
}

/** Per-item answer history from quizzes, exams and drills, keyed by ref (e.g. "grammar:n5-01", "recall:vocab:N5:食べる"). */
export interface ItemStat {
  ok: number;
  bad: number;
  last: number;
}

/** Which professional goal runs in parallel with JLPT study. */
export type Track = "jlpt" | "business" | "brse";

export interface ExamResult {
  id: string;
  level: JlptLevel;
  date: number;
  score: number; // percentage
  passed: boolean;
  seconds: number;
  sections: Record<ExamSection, { correct: number; total: number }>;
  wrongRefs: string[];
}
