# UX Redesign — from "dashboard with modules" to "guided learning journey"

Scope: information architecture, navigation, layout, visual hierarchy and motivation.
No new learning features and no new content. Every existing page and tool is still reachable; most of them are now one level deeper.

---

## 1. UX audit (before)

### 1.1 Navigation problems

| # | Finding | Evidence | Severity |
|---|---|---|---|
| N1 | **23 top-level destinations** in the sidebar across 5 groups (Tổng quan, Kiến thức, Luyện tập, Chuyên ngành, Cá nhân). A new learner has to choose before they have learned anything. | `components/layout/nav.ts` | High |
| N2 | **Four entry points answer the same question "what do I study now?"**: Dashboard, Học hôm nay, Lộ trình học and each Stage page. They show different numbers for the same progress. | `/`, `/today`, `/roadmap`, `/stage/[id]` | High |
| N3 | **Mobile and desktop disagree.** Mobile bottom bar is Home / Today / Review / Quiz; desktop has no notion of primary tabs. Everything else on mobile is in a 23-item hamburger drawer. | `MOBILE_NAV` vs `NAV_SECTIONS` | High |
| N4 | **Content-type navigation** (Vocabulary, Grammar, Kanji, Reading, Listening) puts the burden of sequencing on the learner, while the engine already sequences it in the daily plan. | sidebar group "Kiến thức" | Medium |
| N5 | **No way back** from deep pages (stage → kana course → lesson). The learner relies on the sidebar, which doesn't show where they are in the hierarchy. | all nested routes | Medium |
| N6 | Hiragana and Katakana appear **twice**: as sidebar items and as roadmap stages. | | Low |

### 1.2 Information overload

| # | Finding | Where |
|---|---|---|
| O1 | Dashboard shows **8 stat tiles, 2 goal cards, 4 charts and a 12-row readiness list**, about 30 numbers on the first screen. | `/` |
| O2 | The hero mixes three different progress systems in one sentence: stage readiness %, effort level, level title. | `/` hero |
| O3 | Today's plan hero shows 5 chips (mode, phase, focus, minutes, due, new budget, retention, blocks done) **before** the Start button. | `/today` |
| O4 | "Phân bổ thời gian" ratio bars (plan vs recommendation) are engine internals and don't help the learner act. | `/today` |
| O5 | Today has **5 tabs** (Today, Week, Month, Gates, Principles). Three of them are reference material. | `/today` |
| O6 | Review page leads with a forecast chart and SRS state distribution; the manual session builder (5 modes × 5 kinds × limit × toggle) is always visible. | `/review` |
| O7 | Roadmap cards print up to 6 "Đã gặp" counters each, ×12 stages. | `/roadmap` |
| O8 | Stage page has **9 tabs** that wrap onto 2–3 lines on mobile. | `/stage/[id]` |

### 1.3 Visual hierarchy

| # | Finding |
|---|---|
| V1 | Every element is a bordered card with the same weight, so the primary action isn't visually dominant. |
| V2 | The body text is mostly `text-sm` (14 px) and the meta text is 11–12 px, which is small for a learning app used on phones. |
| V3 | Three competing hero gradients (emerald on dashboard, indigo/violet on Today, stage colors on roadmap). |
| V4 | Eight accent colors on dashboard stat tiles (amber, orange, sky, violet, pink, rose, teal, primary) carry no meaning. |
| V5 | Header pills (streak, XP today/goal, level) repeat on every page and compete with the page title. |

### 1.4 Redundant components

- The `StatCard` grid (dashboard) duplicates achievements and stats.
- The stage readiness list appears 3 times: dashboard, Today › Gates and the roadmap.
- The XP and level card appears on the dashboard hero, the Achievements page and the header pill.
- Session-complete screens are implemented 3 different ways (`SessionSummary`, the QuizRunner result and the LearnSession done screen).

### 1.5 Metrics that distract beginners

These are useful for advanced learners and for diagnosis, but noisy for someone learning kana:
SRS state distribution, 7-day review forecast, retention %, new-card budget, phase ratios, 30-day minutes area chart, 18-week heatmap, cards mastered, kanji mastered/learned/total, monthly milestones and the "principles" table.

### 1.6 Pages that can be merged or folded

| Before | After |
|---|---|
| Dashboard + "Next step" card | **Home** (single "continue" action) |
| Roadmap + readiness lists | **Learn** (visual path) |
| SRS page + weak-item discovery (spread over Today/Quiz) | **Review** (action list) |
| Dashboard charts + Achievements + Planner + Notes + Settings | **Profile** (only analytics page plus a menu) |
| Today › Week / Month / Gates / Principles tabs | One collapsed "Kế hoạch dài hạn" section under the daily path |

### 1.7 Elements to hide or simplify

- Header: only the **streak** stays (the motivational signal). Today's XP moves to Home and the level to Profile.
- The theme toggle moves to the Profile menu on mobile and the sidebar footer on desktop.
- Today: the ratio chart is hidden for beginners and collapsed for everyone else; the mode, phase and retention chips are folded into one line.
- Review: the manual session builder is behind "Tùy chỉnh phiên ôn".
- Profile: advanced charts are behind "Thống kê nâng cao" for learners below N4.

---

## 2. New information architecture

```
🏠 Home ─────────── "What should I learn next?"
│   └── Today's guided session (/today) — opened from Continue
│
📚 Learn ────────── visual roadmap (/learn)
│   ├── Absolute Beginner ── Hiragana ── Katakana        (Khởi đầu)
│   ├── N5 ── N4 ── N3 ── N2 ── N1                       (JLPT)
│   ├── Business ── IT ── BrSE                           (Chuyên ngành)
│   ├── Native Mastery                                   (Đỉnh cao)
│   │     each node → /stage/[id] → kana course, module, native…
│   └── Free practice library (collapsed for beginners)
│         Vocabulary · Grammar · Kanji · Reading · Listening · Quiz · JLPT mock exams
│
🔁 Review ───────── action list (/review)
│   ├── Reviews due now           (one click)
│   ├── Weak vocabulary           (one click)
│   ├── Weak grammar              (one click)
│   ├── Weak kanji                (one click)
│   ├── Missed questions (14 d)   (one click)
│   ├── Leech repair              (one click)
│   └── Custom session (collapsed)
│
👤 Profile ──────── the only analytics page (/profile)
    ├── Level, XP, streak, study time, accuracy
    ├── Achievements preview → /achievements
    ├── Weekly XP chart · monthly minutes · heatmap · SRS states · forecast
    └── Menu: Plan & calendar (/planner) · Notes & dictionary (/notes)
              · PDF report (/report) · Settings & data (/settings) · Theme
```

`/roadmap` redirects to `/learn` so old bookmarks keep working.

## 3. Navigation structure

| Tab | Route | Also active on |
|---|---|---|
| 🏠 Trang chủ | `/` | `/today` |
| 📚 Học | `/learn/` | `/stage`, `/kana`, `/vocabulary`, `/grammar`, `/kanji`, `/reading`, `/listening`, `/quiz`, `/exams`, `/modules`, `/native`, `/roadmap` |
| 🔁 Ôn tập | `/review/` | — |
| 👤 Hồ sơ | `/profile/` | `/achievements`, `/planner`, `/notes`, `/settings` |

- **Mobile (< 1024 px):** a 4-item bottom tab bar (64 px plus the safe area) and a slim top bar. The top bar shows a back link to the parent tab on nested pages, or the brand on tab roots. The streak chip is on the right.
- **Desktop:** a 240 px rail with the brand, 4 large tab items and a theme toggle in the footer. The same top bar shows the back link and streak.
- Both are generated from one `TABS` definition (`components/layout/nav.ts`), so they can't drift apart again.

## 4. User flows

**F1 — Daily learning (primary, 1 tap from launch)**
Home → **Tiếp tục học** → `/today?start=1` opens the next block directly → the block finishes → the continue bar shows **Tiếp tục** → next block → … → the last block shows the "plan complete" celebration → back to Home, which now shows the done state.

**F2 — Reviews (1 tap)**
Home "N thẻ cần ôn" → `/review?start=1` starts the due session → session summary with confetti → any queued celebrations (level-up, goal or streak) play after the session ends, never during it.

**F3 — Fix weaknesses (2 taps)**
Review tab → tap "Từ vựng hay sai" → a focused session of only those cards → summary.

**F4 — Where am I / what's next (1 tap)**
Learn tab → auto-scrolls to the current node, whose panel is already open → **Tiếp tục học**. Locked nodes explain what unlocks them and still allow "Xem trước".

**F5 — Free practice (2–3 taps)**
Learn → free practice library → Vocabulary/Grammar/… (unchanged pages, with a back link to Learn).

**F6 — Progress and settings**
Profile → stats and charts → menu → Achievements / Planner / Notes / Settings.

## 5. Wireframe descriptions

### Home (`/`)
```
┌───────────────────────────────────────┐
│ Chào buổi sáng, Minh 👋        🔥 5   │  greeting + streak (top bar)
│ "Học 10 phút mỗi ngày tốt hơn…"       │  contextual motivational line
│ Cấp 4 · 継続 · Bền bỉ  ▓▓▓▓░░ 240/400 │  XP level (beginner-friendly)
├───────────────────────────────────────┤
│ ███ HERO (brand gradient) ███████████ │
│ GIAI ĐOẠN 3 · JLPT N5                 │
│ Học 8 từ mới: 食べる、飲む…           │  next block title (large)
│ ≈ 30 phút · 2/6 phần                  │
│ ▓▓▓▓▓░░░░░░                           │  plan progress
│ [      ▶  TIẾP TỤC HỌC      ]         │  ← the one primary action
├───────────────────────────────────────┤
│ Hôm nay                               │
│ (◔ 60/100 XP)  🔥 5 ngày  🧠 12 thẻ → │  goal ring · streak · reviews (tap)
├───────────────────────────────────────┤
│ Tuần này             85 / 210 phút    │
│ T2 T3 T4 T5 T6 T7 CN                  │
│ ●  ●  ●  ◐  ○  ○  ○                   │  check circles, today ringed
└───────────────────────────────────────┘
```

### Learn (`/learn/`)
```
 Lộ trình của bạn
 Đang học: JLPT N5 · 3/12 giai đoạn hoàn thành
 ┌──────────────────────────────────┐
 │ PHẦN 1 · KHỞI ĐẦU      3/3 ✓     │  section banner (stage color)
 └──────────────────────────────────┘
            (✓)          ← done: filled, gold check
                (✓)
            (✓)
 ┌──────────────────────────────────┐
 │ PHẦN 2 · JLPT          0/5       │
 └──────────────────────────────────┘
         ┌ TIẾP TỤC ┐
           ((◉))        ← current: pulsing ring, panel open below
   ┌─────────────────────────────┐
   │ JLPT N5 · Sơ cấp 1          │
   │ Ngữ pháp cơ bản, ~800 từ…   │
   │ Sẵn sàng lên cấp ▓▓░░ 34%   │
   │ [ TIẾP TỤC HỌC ]            │
   │  Xem nội dung giai đoạn     │
   └─────────────────────────────┘
               (🔒)     ← locked: grey, lock badge
            (🔒)
 …
 ▸ Luyện tập tự do (Từ vựng · Ngữ pháp · Kanji · Đọc · Nghe · Quiz · Thi thử)
```

### Review (`/review/`)
```
 ┌─────────────────────────────┐
 │          🧠                 │
 │          12                 │  big due number
 │   thẻ đến hạn hôm nay       │
 │ [  ▶ BẮT ĐẦU ÔN (17)  ]     │  includes new cards (setting)
 └─────────────────────────────┘
 Luyện điểm yếu
  📘 Từ vựng hay sai          8  ›
  🧩 Ngữ pháp hay sai         3  ›
  漢 Kanji hay sai            0     (disabled)
  ✗  Câu sai gần đây          11 ›
  🔧 Thẻ hay quên             2  ›
 ▸ Tùy chỉnh phiên ôn
```

### Profile (`/profile/`)
```
 (P)  Minh
      Cấp 4 · 継続 · Bền bỉ · Đang học JLPT N5
      ▓▓▓▓▓░░ 240 / 400 XP
 ┌────────┬────────┬────────┬────────┐
 │🔥 5    │⚡ 1.240│⏱ 6h20 │🎯 87%  │
 └────────┴────────┴────────┴────────┘
 Thành tích 7/30          Xem tất cả ›
  🌱 あ 📗 🔥 …
 XP 7 ngày qua   [bar chart]
 ▸ Thống kê nâng cao (beginners) / shown (N4+)
    Phút học 30 ngày · Lịch hoạt động · Trạng thái thẻ · Dự báo ôn · Kiến thức
 ┌──────────────────────────────┐
 │ 📅 Kế hoạch & lịch học     › │
 │ 📝 Ghi chú & từ điển       › │
 │ 📄 Báo cáo PDF             › │
 │ ⚙️ Cài đặt & dữ liệu       › │
 │ 🌙 Giao diện tối      [◯ ] │
 └──────────────────────────────┘
```

### Session complete (shared)
A centered card with a confetti burst, large emoji, title, 2–3 stat chips (XP, accuracy, cards) and one primary button. When a celebration is queued (a level-up, the daily goal, a streak, or an achievement), its modal opens once the learner leaves the focus session.

## 6. Beginner-first rules (learner below N4, i.e. current stage order < 4)

| Surface | Beginner | N4+ |
|---|---|---|
| Home | XP level bar + motivational line | same plus no extra metrics (Home stays simple for all) |
| Today | No ratio chart and no phase/retention line | Ratio chart in "Chi tiết kế hoạch" disclosure |
| Learn | Free-practice library collapsed | Library expanded |
| Profile | Weekly XP only; advanced charts collapsed | All charts visible |

## 7. Motivation system

| Moment | Treatment |
|---|---|
| Block / quiz / review / lesson complete | `CompletionCard` with confetti, emoji, XP chip, accuracy chip |
| Whole daily plan complete | Full celebration plus a streak flame and a "come back tomorrow" message |
| First XP of the day (streak ≥ 2) | Streak modal: animated flame and day count |
| Daily XP goal reached | Goal modal: filled ring, +30 XP bonus |
| Level up | Level modal: burst ring, new title |
| Achievement unlocked | Badge modal in its tier gradient. Several unlocks at once are grouped into one modal. |

Modals are **queued while a focus session is running** (review, quiz or lesson), so they never cover a card or steal keyboard shortcuts. They play as soon as the session ends. All motion respects `prefers-reduced-motion`.

## 8. Visual system changes

- **Surfaces:** cards use `rounded-2xl`, a hairline border token (`--hairline`, about 6 % ink) and a soft two-layer shadow instead of a full-strength border.
- **Type:** page titles are 28–32 px, section titles 18 px and body text 15–16 px on redesigned screens. Meta text is no smaller than 12 px.
- **Contrast:** the light-mode primary is set to L 0.54 (white labels 4.66:1, was 3.30:1). Hero gradient text is ≥ 4.48:1. Amber XP and orange streak have bright fill tokens (`--xp`, `--streak`) for icons and bars, plus `-ink` variants for text (≥ 4.5:1 on white).
- **Color:** one brand gradient (primary green → teal) for primary heroes. Stage colors are used only on the roadmap, and the semantic colors are amber = XP, orange = streak, rose = weak/wrong.
- **Buttons:** `lg` is 56 px tall with a 3D press shadow (Duolingo tactile). Default buttons are 44 px, the minimum touch target.
- **Spacing:** sections are separated by 32 px and items inside a card by 12–16 px.
- **Tabs:** they scroll horizontally on mobile instead of wrapping onto 2–3 lines.

## 9. Component map

| Component | File | Notes |
|---|---|---|
| `TABS`, `tabFor`, `isTabRoot` | `components/layout/nav.ts` | single source for mobile and desktop nav |
| `AppShell` | `components/layout/AppShell.tsx` | rail, top bar with back link, bottom tabs, celebration host |
| `Confetti`, `CompletionCard` | `components/motivation/Celebration.tsx` | shared completion UI |
| `CelebrationHost` | `components/motivation/CelebrationHost.tsx` | queued modals (level, goal, streak, achievement) |
| `useCelebrations`, `useFocusSession` | `store/useCelebrations.ts` | non-persisted queue and focus-session counter |
| `ProgressRing` | `components/ui/primitives.tsx` | daily goal ring |
| `useLearner` | `hooks/useEngine.ts` | current stage, pro stage and `beginner` flag |
| `weakCards`, `missedCards` | `lib/weak.ts` | pure, unit-tested selectors for the Review tab |
| `stageStatus` | `lib/engine.ts` | done / current / available / locked for roadmap nodes |
| Home, Learn, Review, Profile | `app/page.tsx`, `app/learn`, `app/review`, `app/profile` | the 4 tab roots |

---

# Round 2: "I want to start learning right now"

Goal: a complete beginner who opens the app for the first time should feel invited, not measured. No new features or content were added.

## 10. Audit of the round-1 UI

Screens were reviewed at 390 px with an empty profile and with the 45-day demo profile.

| # | Friction | Where | Why it hurts |
|---|---|---|---|
| R1 | **A first visit shows six empty meters**: `Cấp 1 · 0/100 XP`, a `0%` goal ring, `0 ngày` streak, `Đã ôn xong` with no cards, 7 empty week dots and an empty weekly bar | Home | The very first message is "you have nothing". Empty meters measure; they don't invite. |
| R2 | **Four progress visuals on one screen**: level bar, plan bar, goal ring, weekly bar (plus week dots) | Home | Duplicate information; the eye can't tell which progress matters. |
| R3 | **Backlog anxiety**: "Ôn 262 thẻ đến hạn" as the hero title, a red `99+` badge, "262 thẻ đến hạn" | Home, Today, Review | Counts read as debt. Red badges are notification alarms. Learners avoid what feels like debt. |
| R4 | **Engine language in the hero**: "vượt khả năng ôn trong ngày… cho đến khi nợ về mức an toàn. Tỉ lệ nhớ 14 ngày: 85%" | Today | Technical and slightly scolding ("nợ" = debt). |
| R5 | **Review asks the learner to diagnose themselves** (5 weak-spot categories + a custom builder) before offering a simple "I have 5 minutes" choice | Review | Decision fatigue; the natural question is time, not taxonomy. |
| R6 | **Locked stages look dead**: grey nodes and fully grayscale section banners, with only "Hoàn thành X để mở khóa" | Learn | Locked content should create curiosity ("you'll be able to read the news"), not look disabled. |
| R7 | **The current stage doesn't show progress on the path**; overall progress is the text "1/12" | Learn | Visible progress is the strongest motivator, and it was hidden in a panel. |
| R8 | **Abrupt state changes**: panels, tabs and celebrations appear without motion continuity | everywhere | Feels like a web form rather than a game. |
| R9 | **Generic greeting** "Chào buổi chiều, Học viên" | Home | Default placeholder name reads impersonal. |
| R10 | The Today hero repeats the Home hero (same title, same bar, same button) | Home → Today | One more screen before learning starts. |
| R11 | **The very first lesson opened the beginner stage page**: 9 tabs, "Đã gặp 0/43", "sẵn sàng 0%"; its Continue button looped back to the plan | first click | The first lesson felt like a syllabus, and the loop gave no way forward. Found while testing the first-run flow. |

## 11. Round-2 decisions

| Fixes | Change |
|---|---|
| R1, R9 | **First-run welcome** on Home: no meters at all. A friendly hero, a 3-step journey teaser (あ → ア → N5) and one huge "Bắt đầu học ngay" button. The greeting drops the placeholder name. |
| R2 | Home = **welcome → current lesson (huge Continue) → today's mission → next level**. The weekly card and goal ring are gone; the daily goal lives inside the mission list, weekly charts live in Profile. |
| R3 | Reviews are expressed **in minutes** ("≈ 6 phút ôn tập"), never as a backlog count, and with no red badge. The review block is titled "Ôn lại bài đã học". |
| R4 | The engine headline and mode move into the "Chi tiết" disclosure (N4+ only). |
| R5 | Review = **four one-click buttons**: Ôn nhanh (10 thẻ), 5 phút, 15 phút, Ôn hết. When nothing is due they become free practice of learned cards. Weak spots are secondary; the custom builder stays collapsed. |
| R6 | Locked nodes keep a soft tint of their stage color and their panel shows **"Bạn sẽ làm được"** (the stage goals) plus a preview link. Section banners are dimmed, not grayscale. |
| R7 | A **journey progress card** at the top of Learn, and a **progress ring around the current node** (stage readiness). |
| R8 | **Framer Motion** for entrances (stagger), press feedback, the mobile tab indicator, panels and celebration springs; Magic-UI-style **NumberTicker** and **Shine** CTA. All motion respects `prefers-reduced-motion` (`MotionConfig reducedMotion="user"`). |
| R10 | Continue opens the next lesson directly (unchanged); the Today hero now shows only the lesson, its time and one button. |
| R11 | The orientation runs **inline as a stepped lesson** (one idea per screen, same text as before, shared with the stage page). Welcome → first lesson is one tap, and finishing it unlocks the first badge. |
