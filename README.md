# NihongoPath 日本語パス

An **offline-first Japanese learning platform for Vietnamese learners**, from absolute beginner through JLPT N1, Business Japanese, IT Japanese, BrSE (Bridge System Engineer) Japanese and native-level material.

- No backend, no cloud, no AI APIs, no paid services. All data lives in the browser (`localStorage`).
- `npm run build` produces a static `out/` folder that runs anywhere, with no network access.
- UI in Vietnamese; all explanations and translations are in Vietnamese.

Stack: **Next.js 15 (static export) · TypeScript · Tailwind CSS 4 · shadcn-style UI (Radix) · Zustand · Recharts · Vitest**.

---

## Features

| Area | What's included |
|---|---|
| **Guided navigation** | Four tabs only: **Home** answers "what should I learn next?" (one Continue button, daily goal, streak, reviews due, this week); **Learn** is a visual roadmap; **Review** lists one-click review actions; **Profile** holds every statistic and the settings menu. Learners below N4 see a simplified UI. Design rationale: [docs/UX_REDESIGN.md](docs/UX_REDESIGN.md). |
| **Adaptive study engine** | **Học hôm nay** (opened from Home's Continue button) is the guided session. Every day it generates an ordered plan from the learner's real memory state, in this order: reviews → leech repair → new items (teach → immediate test → re-teach) → one grammar point → recall / speaking → reading/listening → Business/BrSE track. New-item intake is throttled by review capacity and 14-day retention, and the plan switches mode for review debt, consolidation and the weekly rhythm. Also shows weekly tasks, monthly milestones and level-up gates. See [docs/LEARNING_DESIGN.md](docs/LEARNING_DESIGN.md). |
| **Roadmap (Learn tab)** | 12 stages (Beginner → Hiragana → Katakana → N5 → N4 → N3 → N2 → N1 → Business → IT → BrSE → Native) drawn as a winding path: completed stages get a crown, the current stage is highlighted, later stages are locked but can be previewed. Every stage page has vocabulary, grammar, kanji (or kana), listening, reading, a mixed quiz, a stage-filtered SRS review and its **level-up gates**. Progress is measured by retention (≥ 7-day memory), comprehension scores and mock exams, never by items seen. |
| **Profile & statistics** | Level/XP, streak, study time, accuracy, recent badges, a 7-day XP chart, plus (collapsed for beginners) knowledge learned, a 30-day study-minutes chart, an 18-week activity heatmap, the SRS state bar and the 7-day review forecast. |
| **SRS** | Four states (New → Learning → Review → Mastered). Intervals are 1 · 3 · 7 · 14 · 30 · 60 · 120 days, with Again/Hard/Good/Easy grading (failed cards come back in 10 minutes). The Review tab offers one-click sessions for cards due, weak vocabulary, weak grammar, weak kanji, recently missed questions and leech repair; custom sessions (due-only, new, weak, random or all, filtered by card type) are one tap away. Keyboard shortcuts are supported. |
| **Hiragana / Katakana** | Lessons by row; dakuten, yōon and extended katakana (ファ, ティ, ウェ…). Each character has a stroke count, a stroke-order animation (KanjiVG, bundled), offline pronunciation, a Vietnamese memory hint and **guided stroke tracing**: the next stroke is highlighted with its start point and direction, and every stroke is checked for shape, direction and order ("Tô theo mẫu", then "Tự viết" from memory with hints after two misses). Kanji have the same tracer. Also includes a reading test, a self-graded writing test, romaji typing (Hepburn and Kunrei accepted), word reading drills, and a katakana loanword list. |
| **Vocabulary** | 827 entries. Each has kanji, kana, romaji (auto-generated), Vietnamese meaning, part of speech, an example sentence with translation, a difficulty level and tags. Supports search across kanji, kana, romaji and meaning; filters by level, tag, part of speech, SRS status and favorites; and CSV export. |
| **Grammar** | 95 points (N5–N1, Keigo, IT-specification patterns, BrSE reporting patterns, native-level written style). Each has the pattern, meaning, formation, a Vietnamese explanation, usage notes, common mistakes, examples, a comparison with similar grammar and an exercise. |
| **Kanji** | 234 kanji (N5–N1). Each has its **Hán Việt** reading, meaning, on/kun readings, stroke count, radicals, example words, an example sentence, a memory hint, a stroke-order view and writing practice. Search by character, Hán Việt, reading, meaning or radical; filter by level and stroke count. |
| **Reading** | 16 original articles (N5–N1 plus native-level news, technical, novel, business report, debate and academic texts). Furigana toggle, tap-a-word vocabulary popup, translation toggle, reading timer with characters per minute, comprehension questions, and discussion/essay prompts. |
| **Listening** | 11 dialogs: daily life, office, meetings, business calls, news. Plays `public/audio/listening/<id>.mp3` if present; otherwise reads the dialog line by line with the OS's offline Japanese voice. Includes speed control, hide/show transcript and translation, and per-line replay. |
| **Quiz engine** | Multiple choice, fill-in-the-blank, matching, listening, kanji recognition, grammar correction and romaji typing. Scoring is XP + accuracy + a speed bonus + a perfect-score bonus. Also has a seeded **daily challenge** and a **60-second challenge mode** (combos; a wrong answer costs 3 seconds). |
| **JLPT mock exams** | N5–N1 papers generated from the content DB, covering vocabulary, kanji, grammar, reading and listening. Countdown timer with auto-submit, pass rule (overall score plus at least 1/3 per section), section analysis, a weakness report, linked review topics, an answer review and score history. |
| **Business Japanese** | Meetings, presentations, phone calls, scheduling, negotiation, email writing. Full **Keigo** section: an overview of 丁寧語・尊敬語・謙譲語, a table of 20 special verbs, golden rules and a drill. |
| **IT Japanese** | Software development, Agile, Scrum, testing, design documents, architecture, infrastructure, cloud, APIs and security. Covers vocabulary, phrases and real conversations. |
| **BrSE Japanese** | Requirement hearing, client communication, defect reports, daily, progress and risk reports, meeting facilitation, and specification explanation. Includes real conversations, copyable report/email templates, and **role-play scenarios** with a model answer that can be saved to notes. |
| **Gamification** | XP, levels with titles, 27 achievements/badges in 4 tiers, daily XP goal (+bonus), weekly minutes goal, challenge mode. Completion screens with confetti; level-up, daily-goal, streak and badge celebrations are queued during a session and play when it ends. |
| **Productivity** | 7-day study planner, monthly learning calendar, goal tracker with deadlines, notes (tags and search, auto-save), and a personal dictionary (CSV import/export; entries can be pushed into SRS). |
| **Export** | Full JSON backup and restore. CSV exports for SRS cards, the activity log, exam results, filtered vocabulary and the personal dictionary. A **PDF learning report** (print-optimised page → "Save as PDF", which renders Japanese and Vietnamese glyphs correctly). |
| **Offline** | Static export, a cache-first service worker, a web manifest, a zero-dependency local server, and an OS speech-synthesis voice. No request leaves the machine. |

There is also a **dark mode** and a mobile-first layout: a bottom tab bar on phones and a slim rail on desktop.

---

## Installation

Requirements: **Node.js 18.18+** (developed on Node 24) and npm.

```bash
npm install          # one-time, needs network
npm run dev          # development server → http://localhost:3000
```

Production build and **fully offline** run:

```bash
npm run build        # static export into ./out
npm start            # zero-dependency static server → http://localhost:3000 (PORT=xxxx to change)
```

`out/` can also be copied to any static host or opened through any local web server.

### Optional one-time downloads (while online)

| Command | Effect |
|---|---|
| `npm run fetch:strokes` | Stroke data for every kana/kanji in the app already ships in `public/strokes/` (KanjiVG, © Ulrich Apel, CC BY-SA 3.0, https://kanjivg.tagaini.net; each file keeps its licence header). Re-run after adding kanji. Behind a TLS-inspecting proxy use `node --use-system-ca scripts/fetch-kanjivg.mjs`. |
| Audio files | Put MP3s named after listening exercise ids into `public/audio/listening/` (see the README in that folder). |

### Japanese voice for pronunciation

Pronunciation uses the browser's Speech Synthesis API with a locally installed Japanese voice:

- **Windows:** Settings → Time & Language → Language & region → add *Japanese* (includes the speech pack), or Settings → Speech → Add voices.
- **macOS / iOS:** Kyoko / Otoya are built in.
- **Android:** Google Text-to-Speech, Japanese.

### Try it with demo data

Open **Hồ sơ → Cài đặt & dữ liệu → Nạp dữ liệu demo** to load a realistic 45-day learner profile (streak, SRS cards in every state, exams, notes, goals).

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Static export to `out/` |
| `npm start` | Serve `out/` offline (`scripts/serve.mjs`) |
| `npm test` | Vitest unit tests (98 tests) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run fetch:strokes` | Download KanjiVG stroke data for newly added characters |

---

## Project structure

```
├── public/
│   ├── audio/listening/        # optional MP3s (placeholders documented)
│   ├── strokes/                # KanjiVG stroke SVGs (CC BY-SA 3.0), used by stroke order + tracing
│   ├── sw.js                   # cache-first service worker
│   ├── manifest.webmanifest
│   └── icon.svg
├── scripts/
│   ├── serve.mjs               # offline static server for out/
│   └── fetch-kanjivg.mjs       # one-time stroke-order download
├── src/
│   ├── app/                    # Next.js App Router pages (all static)
│   │   ├── page.tsx            # Home tab: continue learning, today, this week
│   │   ├── learn/              # Learn tab: visual 12-stage roadmap + free-practice library
│   │   ├── review/             # Review tab: due reviews, weak spots, custom sessions
│   │   ├── profile/            # Profile tab: statistics, badges, charts, settings menu
│   │   ├── today/              # Guided daily session; week, milestones, gates, principles folded below
│   │   ├── roadmap/            # Redirects to /learn (old links)
│   │   ├── stage/[id]/         # Stage hub (vocab, grammar, kanji, listening, reading, quiz, review, progress)
│   │   ├── kana/[script]/      # Hiragana / Katakana course
│   │   ├── vocabulary/  grammar/  kanji/  reading/  listening/
│   │   ├── quiz/               # Custom quiz, daily challenge, 60s challenge
│   │   ├── exams/  exams/[level]/   # JLPT mock exams
│   │   ├── modules/[id]/       # Business (Keigo) · IT · BrSE
│   │   ├── native/             # Native-level section
│   │   ├── achievements/  planner/  notes/  settings/
│   │   └── report/             # Printable PDF learning report
│   ├── components/
│   │   ├── ui/                 # shadcn-style primitives (button, card, tabs, dialog, switch, progress…)
│   │   ├── layout/             # AppShell (desktop rail, mobile tab bar, top bar), 4-tab navigation config
│   │   ├── motivation/         # Confetti, CompletionCard, CelebrationHost (queued celebration modals)
│   │   ├── learning/           # QuizRunner, ReviewSession, JapaneseText (furigana + popups),
│   │   │                       # ArticleReader, ListeningPlayer, Writing (stroke order + canvas), VocabCard…
│   │   └── charts/             # Recharts wrappers, SRS state bar, activity heatmap
│   ├── data/                   # All learning content (typed, versioned in git)
│   │   ├── kana.ts  stages.ts  achievements.ts  reading.ts  listening.ts
│   │   ├── vocab/              # per-level vocabulary in compact tuple format
│   │   ├── grammar/            # per-level grammar definitions
│   │   ├── kanji/              # per-level kanji tuples
│   │   └── modules/            # business (incl. keigo table), it, brse
│   ├── hooks/                  # useHydrated, useStats, useEngine (plan, learner stage), background services
│   ├── lib/                    # Pure, unit-tested logic
│   │   ├── engine.ts           # adaptive study engine: daily plan, gates, weekly tasks, milestones
│   │   ├── srs.ts              # scheduler, sessions, forecast
│   │   ├── xp.ts               # XP, levels, quiz scoring
│   │   ├── quiz.ts             # question generators for the 7 quiz types
│   │   ├── exam.ts             # mock exam builder, grading, weakness report
│   │   ├── romaji.ts           # kana ⇄ romaji (Hepburn/Kunrei), lenient matching
│   │   ├── ruby.ts             # {漢字|かんじ} furigana markup
│   │   ├── stats.ts            # learner stats, stage content & progress
│   │   ├── weak.ts             # weak and recently-missed cards for the Review tab
│   │   ├── export.ts           # CSV/JSON helpers
│   │   ├── speech.ts  date.ts  cards.ts  demo.ts  utils.ts
│   ├── store/useAppStore.ts    # Zustand store persisted to localStorage
│   ├── store/useCelebrations.ts # in-memory celebration queue + focus-session counter
│   └── types/index.ts          # Domain types
├── tests/                      # Vitest: SRS, XP, romaji, ruby/CSV/dates, quiz/exam, content integrity, demo/stats
└── docs/ARCHITECTURE.md
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design decisions and how to add content, and [docs/LEARNING_DESIGN.md](docs/LEARNING_DESIGN.md) for the learning-science rationale: why learners stall between N5 and N3, the daily, weekly and monthly paths, review ratios, level-up requirements and the engine algorithm.

---

## Content inventory (current)

| Content | Count |
|---|---|
| Kana | 104 hiragana + 126 katakana (incl. 22 extended) |
| Vocabulary | 827 (intro 43 · kana 80 · N5 182 · N4 110 · N3 85 · N2 65 · N1 60 · Business 60 · IT 78 · BrSE 42 · Native 22) |
| Grammar | 95 (N5 22 · N4 18 · N3 15 · N2 12 · N1 10 · Keigo 5 · IT 4 · BrSE 5 · Native 4) |
| Kanji | 234 (N5 102 · N4 50 · N3 35 · N2 25 · N1 22) |
| Reading | 16 articles · Listening: 11 dialogs · Business/IT/BrSE: 24 topics |

The full JLPT inventory is roughly 10,000 words and 2,000 kanji, so the shipped content is a curated, hand-checked core rather than complete coverage. It can be extended in two ways:

1. **Without code:** import CSV word lists (thousands of rows at once) into the *Personal dictionary* and push them into SRS.
2. **In the codebase:** append rows to the typed files in `src/data/`. The content-integrity tests catch duplicate ids, malformed furigana, missing translations and invalid quiz answers.

---

## Development roadmap

1. **Content expansion (highest value):** complete JLPT N5/N4 vocabulary and kanji lists, then N3–N1. Add more graded reading passages and listening scripts per level.
2. **Recorded audio:** record or license native-speaker MP3s for every dialog, word and example.
3. **IndexedDB storage adapter:** swap `createJSONStorage(() => localStorage)` for an IndexedDB adapter once user data approaches the ~5 MB localStorage limit (large CSV imports).
4. ~~**Handwriting recognition:** compare canvas strokes with KanjiVG paths (stroke count, direction and order scoring).~~ Done: guided stroke tracing (`components/learning/StrokeTracer.tsx`, `lib/strokes.ts`).
5. **Pitch-accent data** for vocabulary, with visual accent marks.
6. **E2E tests** (Playwright) for quiz, review and exam flows.

## Future enhancements

- Sentence mining from reading articles into SRS with one tap.
- Shadowing mode: record your voice with MediaRecorder and compare it with the reference (offline).
- Custom decks and shared deck packs (JSON) between learners.
- An adaptive exam generator that weights questions toward weak topics from previous results.
- Optional device-to-device sync over a local network or by file, still with no cloud.
- Desktop and mobile packaging (Tauri / Capacitor) for an installable offline app.
- An i18n layer so the same content can serve English or other learners.
