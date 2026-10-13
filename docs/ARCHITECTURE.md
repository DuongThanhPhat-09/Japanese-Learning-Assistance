# Architecture

## Principles

1. **Offline-first, no backend.** All content is bundled as typed TypeScript modules. All learner data is a single persisted Zustand store. `next.config.ts` uses `output: "export"`, so every route is a static HTML file.
2. **Pure logic in `src/lib`, UI in `src/components` and `src/app`.** Scheduling, scoring, quiz/exam generation, romaji conversion, furigana parsing, stats and CSV handling are pure functions with unit tests. Components only wire them to the store.
3. **Content as data.** Adding vocabulary, grammar, kanji, articles or dialogs never requires UI changes. Stages derive their content from content levels (`Stage.levels`, plus `Stage.extra` previews for the early stages).

## Data flow

```
src/data/*  (static, typed content)
      │
      ▼
src/lib/*   (pure: quiz.ts, exam.ts, srs.ts, stats.ts, romaji.ts, ruby.ts …)
      │
      ▼
components / pages ──actions──▶ store/useAppStore.ts ──persist──▶ localStorage["nihongo-path"]
      ▲                                   │
      └──────────── selectors ────────────┘
```

- **Hydration:** the static HTML only contains the app shell. `AppShell` waits for the persisted store to rehydrate (`useHydrated`) before rendering pages, which avoids SSR/client mismatches.
- **Background services** (`hooks/useBackground.ts`): a study-time ticker (counts 30-second ticks while the tab is visible and the learner was active in the last 2 minutes), an achievement watcher (debounced store subscription), and a progress watcher for level-ups, the first XP of the day (streak) and the daily goal. Watchers push to `store/useCelebrations.ts`, an in-memory queue. `CelebrationHost` plays it only while no focus session (review, quiz, lesson; see `useFocusSession`) is on screen. XP that moves the total without moving today's XP (backup import, demo data) is not celebrated.
- **Navigation** (`components/layout/nav.ts`): four tabs (Home, Learn, Review, Profile). Every other route belongs to one tab (`tabFor`) and gets a back link to it. UX rationale: [UX_REDESIGN.md](UX_REDESIGN.md).

## Study engine (`lib/engine.ts`)

The engine is the decision layer on top of SRS. `buildDailyPlan` reads cards, completions, comprehension scores, per-item answer stats (`itemStats`), activity counters and exam results, and returns ordered study blocks. The plan is cached in the store once per day (`plan`, `planDone`). Gates (`stageGates`) define stage readiness everywhere in the UI. Rationale and every threshold: [LEARNING_DESIGN.md](LEARNING_DESIGN.md).

Feedback paths into the store:

| Path | Effect |
|---|---|
| `recordResults(refs)` | Every quiz, exam, drill and comprehension answer updates `itemStats`. A wrong answer on a deck card sets `due = now`. |
| `introduceCards` | Teach-test sessions schedule new cards by first-try result. |
| `finishComprehension` | Stores the score and completes the matching plan block. |
| `bumpCounter` | Day counters (`srsPass`, `srsFail`, `learned`, `recall`, `shadow`, `reading`, `listening`, `quiz`, `roleplay`, `planDone`, `mock`) feed retention and weekly tasks. |

Persisted data is version 2. `merge` in the persist config fills new fields and nested profile settings for v1 data.

## SRS model (`lib/srs.ts`)

| Field | Meaning |
|---|---|
| `step` | Index into `REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 120]` days; `-1` = new or relearning |
| `state` | Derived from `step` and `reps`: `new` (never reviewed) → `learning` (step ≤ 1) → `review` (2–5) → `mastered` (6) |

| Grade | Effect |
|---|---|
| Again | step = -1, due in 10 min, lapse +1 |
| Hard | Repeat the current interval |
| Good | step + 1 |
| Easy | step + 2 |

Card ids are `${kind}:${itemId}`, where kind is `vocab | kanji | grammar | kana | custom`. `lib/cards.ts` resolves a card into its front and back faces.

## Content ids

| Content | Id format |
|---|---|
| Vocabulary | `${level}:${kanji}` (e.g. `N5:食べる`) |
| Kana | `h:あ` / `k:ア` |
| Grammar | `${level}-${nn}`, assigned by order in the level file. **Append** new points; don't reorder, or saved progress will point at the wrong items |
| Kanji | the character itself |
| Articles, dialogs | explicit `id` |

## Adding content

| Content | How |
|---|---|
| Vocabulary | Add a tuple `[kanji, kana, meaningVi, pos, example, exampleVi]` to a group in `src/data/vocab/<level>.ts`. Romaji is generated automatically. |
| Grammar | Append a `GrammarDef` to `src/data/grammar/<level>.ts`. If you add `quiz`, make sure only one option is grammatical. |
| Kanji | Append a `KanjiTuple` in `src/data/kanji/`. |
| Reading | Add an `Article` to `src/data/reading.ts`. Use `{漢字|かんじ}` ruby markup for whole words, since tapping a ruby word opens the vocabulary popup. |
| Listening | Add a `ListeningExercise` to `src/data/listening.ts` and optionally drop `<id>.mp3` into `public/audio/listening/`. |
| Module topics | Edit `src/data/modules/*.ts`. `vocabTag` links a topic to vocabulary tags of the same level. |

Run `npm test` afterwards: `tests/content.test.ts` validates ids, kana tables, translations, quiz answers, furigana markup and stage coverage.

## Quiz and exam generation

- `buildQuiz({ source, types, count, seed })` spreads `count` across the selected types. Passing a seed makes it deterministic (used by the daily challenge).
- `buildMockExam(level, seed)` samples each JLPT section from the content database. `gradeExam` computes section scores and applies the pass rule (overall ≥ pass mark and ≥ 1/3 per section). `weaknessReport` and `recommendedTopics` turn wrong answers into study advice and deep links.

## PDF export

`/report` is a print-optimised page (`@media print` hides the controls). Using the browser's **Save as PDF** keeps the dependency count low and renders Japanese and Vietnamese text with system fonts. Bundling a CJK font into a JS PDF library would add many megabytes.
