# Learning design: from feature buffet to learning system

This document explains how NihongoPath decides **what a learner should do next**. The diagnosis behind it is in sections 1–2, the prescribed workflow in sections 3–6, and the adaptive engine that implements it in section 7. No content was added for this redesign; every change re-uses existing vocabulary, grammar, kanji, articles and dialogs more effectively.

Code: [`src/lib/engine.ts`](../src/lib/engine.ts) (pure, tested in [`tests/engine.test.ts`](../tests/engine.test.ts)) · UI: `/today` (Học hôm nay).

---

## 1. Why learners fail between N5 and N3

N5 is reachable with willpower and flashcards. N3 is where those habits stop working. The "intermediate plateau" has predictable causes:

| # | Cause | What it looks like | Root mechanism |
|---|---|---|---|
| 1 | **Review avalanche** | Learner adds 30–50 cards a day for two weeks, then faces 300+ reviews a day and quits | Each new card generates about 6 reviews a day at steady state. New-card intake is never tied to review capacity. |
| 2 | **Recognition ≠ recall** | Understands 1,500 words on cards but can't produce a simple sentence | Flashcards train JP → meaning only. Production (meaning → JP) is a separate memory route and was never practised. |
| 3 | **Grammar collecting** | Has "done" 120 grammar points, can't choose between ために and ように | Grammar was read and ticked off, never retrieved in context. N3 is full of near-synonym patterns that need discrimination practice. |
| 4 | **Kanji debt** | Leaned on furigana at N5/N4, so reading collapses at N3 when the kanji load roughly doubles | Kanji were postponed instead of learned alongside vocabulary. Vietnamese learners also leave the Hán Việt advantage unused. |
| 5 | **Input starvation** | Studies *about* Japanese for a year, reads 5 pages *of* Japanese | N3+ reading and listening speed comes from volume of comprehensible input, which grammar study cannot replace. |
| 6 | **Listening shock** | Fine with textbook audio, lost at natural speed | No regular listening or shadowing, and no re-listening for automaticity. |
| 7 | **Mute learner** | Passes N3 reading and freezes in a meeting | Zero speaking output. For Business and BrSE goals this is fatal: the job is spoken. |
| 8 | **Self-deception metrics** | "80% of N4 done!" with 40% actual retention | Progress counts items *seen*. Self-grading inflated by rewards. No external check such as a mock exam. |
| 9 | **Inconsistent rhythm** | Five 3-hour weekends instead of daily 30 minutes | Spacing needs daily presence. Cramming without sleep consolidation doesn't stick. |
| 10 | **Leeches** | The same 30 words failed for months | Repetition can't fix a bad encoding. The word needs a new memory hook. |

## 2. Weaknesses of the platform before this redesign

An honest audit of v1 (feature-complete, learning-naïve):

| Weakness | Consequence (cause # above) | Fix in v2 |
|---|---|---|
| No prescribed path. The dashboard showed stats and the learner chose from 20 pages | Decision fatigue; learners pick what's fun (new content) over what works (review) | **Học hôm nay:** an ordered daily plan from the engine |
| "Add 50 words to SRS" buttons, no backlog control (1) | Review avalanche by design | Buttons now fill a **queue**. The engine introduces new items at the rate review capacity allows. |
| Kana lesson "Hoàn thành bài" auto-graded every character as *good* (8) | Characters marked learned without a single retrieval | Viewing a lesson only queues the characters. They count as learned after the **teach → test** session and SRS. |
| Flashcards recognition-only (2) | No productive vocabulary | **Recall** block (meaning → type Japanese) and **reflex speaking** (Vietnamese → say Japanese) |
| Grammar "done" = clicking a button after reading (3) | Grammar collecting | Must attempt the exercise. The pattern then enters SRS as a **cloze card** (fill the blank in a sentence), not "pattern → meaning". Plus a grammar-drill block that prioritises inaccurate patterns. |
| Reading/listening completable without answering (5, 8) | Fake input | Completion requires answering. The score is stored, and **≥ 70%** counts towards gates. Re-reading and re-listening are scheduled. |
| Quiz/exam mistakes stayed in the quiz (8) | Weak items kept long intervals | Every quiz, exam, drill and reading answer is recorded per item. **A mistake makes the related card due today.** |
| XP: Easy = 10, Again = 2 (8) | Rewarded dishonest self-grading, which corrupts the schedule | Flat XP per review |
| XP level titles claimed proficiency ("Trung cấp" at level 10) (8) | A kana-stage learner was told they were pre-intermediate | Titles are effort-based ("Chăm chỉ", "Bền bỉ"). Proficiency is shown only through stage gates. |
| Stage progress = items started; advance at 80% started (8) | Advanced without retention | **Readiness = level-up gates** (≥ 7-day retention, comprehension scores, mock exam) |
| No speaking at all (7) | Mute learner | Shadowing with recording (MediaRecorder, offline), reflex speaking, role-play saved and compared with a model answer |
| No leech handling (10) | Endless failures | Leech repair: write a new memory hook (Hán Việt split, own sentence), then re-test immediately |
| Hán Việt shown only on kanji pages (4) | Missed the strongest shortcut Vietnamese learners have | Hán Việt breakdown on every new word and every SRS card back (derived from the kanji DB) |
| Content order = file order (5) | Words met in isolation | New words that appear in the **next unread article/dialog are taught first** (pre-teaching makes input comprehensible). Words whose kanji are already known get a boost. |

## 3. The daily workflow

Every day follows the same order. The engine fills in the content and the minutes.

```
1. Review       due SRS cards (always first — never skipped)
2. Repair       leeches, if ≥ 3 (weekly, or daily if ≥ 8)
3. Learn        new items in chunks of 5: teach → test immediately → re-teach mistakes
4. Grammar      at most ONE new pattern, only if the previous one has been reviewed
5. Output       recall (meaning → Japanese) · grammar drill · shadowing / reflex speaking
6. Input        one article and/or dialog (unread first, then weak scores, then re-reads)
7. Pro track    Business / IT / BrSE topic or role-play (25% of time, after N5)
8. Weakness     5-minute drill on the weakest section of the last mock exam (for 3 weeks)
```

Why this order: reviews are the cheapest learning (seconds per item at the moment of forgetting) and protect past investment. New material comes before tiring output tasks. Input comes last because it is the most enjoyable and the most flexible in length.

**Stop rule.** When the plan is done, the app tells the learner to stop or switch to extra reading/listening, not to add cards. Over-adding is cause #1.

### Teach → test → schedule (new items)

- Chunks of 5 (working-memory sized).
- Each item is shown with audio, the Hán Việt split, an example sentence and the stroke order (for kana/kanji), then tested immediately: typing for kana, multiple choice for words and kanji.
- Wrong answers are re-taught and re-tested before the next chunk.
- Scheduling uses the **first-try** result: correct → tomorrow; needed re-teaching → about 10 minutes (same-day relearning).

## 4. Recommended review ratios

### Time split by phase (`RATIOS` in the engine)

| Phase | Review | Learn new | Output (speak/recall) | Input (read/listen) |
|---|---|---|---|---|
| Script (Beginner, Kana) | 35% | 45% | 15% | 5%* |
| Basic (N5–N4) | 35% | 25% | 15% | 25% |
| Intermediate (N3) | 30% | 20% | 15% | 35% |
| Advanced (N2–N1) | 25% | 15% | 15% | 45% |
| Mastery (Native, after N1) | 20% | 10% | 20% | 50% |

\* Before kana is readable, comprehension input is replaced by retrieval drills.

Professional track (Business / BrSE goal): **25%** of the day once N5 is passed, taken proportionally from the other blocks. The work is output-heavy: phrases, keigo conversion, reflex speaking and role-play.

### Other ratios and thresholds

| Rule | Value | Rationale |
|---|---|---|
| Sustainable new items/day | review minutes × 60 ÷ 8 s ÷ 6 | About 6 reviews per new card per day at steady state; about 8 s per review. At 30 min/day in the N5 phase this gives **13/day**. |
| Review-debt trigger | due time > 1.5 × review budget | Above this: **0 new items** and review gets up to 70% of the day until the debt clears |
| Retention target | 80–93% (14-day SRS recall rate) | < 80% → consolidation: new items cut by 60%. > 93% with low backlog → new items +30% (the learner is under-challenged). |
| Leech threshold | 4 lapses | Re-encode instead of repeating |
| Grammar intake | ≤ 1 pattern/day, sequential, previous one reviewed | Prevents collecting; gives each pattern time to be used |
| Recognition : production | Every word that survives the 7-day interval enters recall practice; recall gets ~40% of output time | Converts passive vocabulary to active |
| Kanji : vocabulary in new items | about 30 : 70 at JLPT stages | Kanji learned alongside the words that use them |
| Minimum block | 3 minutes | Shorter fragments are merged; switching cost outweighs the benefit |

## 5. Weekly path

| Day | Plan mode | Focus |
|---|---|---|
| Mon, Tue, Fri | normal | Standard day. Speaking alternates between shadowing and reflex. |
| Wed | checkpoint | Standard day plus a 15-question mixed quiz (mistakes go to today's reviews) |
| Thu | normal | Plus a role-play when on the Business/BrSE track |
| Sat | immersion | 50% fewer new items, input time ×1.8; **mock exam every 2 weeks** once readiness is ≥ 55% |
| Sun | light | Reviews, leech repair and the weekly reflection only. No new items. |

Weekly tasks are tracked automatically: study ≥ 5/7 days; finish the daily plan ≥ 4 times; ≥ 2 readings; ≥ 2 listenings; ≥ 3 speaking sessions; ≥ 3 recall sessions; 1 checkpoint or mock; 1 role-play (pro track).

## 6. Monthly milestones and level-up requirements

### Level-up gates (`stageGates`)

A stage is passed only when **every** gate is met. "Retained" means the SRS card survived to the 7-day interval or beyond (state Review or Mastered).

| Stage | Gates |
|---|---|
| Beginner (orientation) | Read the orientation · learn 20 survival phrases through the teach-test flow |
| Hiragana / Katakana | ≥ 90% of the 46 basic characters retained · ≥ 80% of all characters retained · ≥ 90% reading/typing accuracy over ≥ 40 answers |
| N5 – N1 | Vocabulary ≥ 80% retained · kanji ≥ 70% retained · grammar ≥ 80% "usable" (cloze card retained, or ≥ 75% accuracy over ≥ 3 attempts) · every article and dialog scored ≥ 70% · **mock exam passed in the last 60 days** |
| Business | All topics + keigo completed · keigo conversion ≥ 80% over ≥ 20 answers · vocabulary ≥ 70% retained · grammar usable · role-plays done · listening scored |
| IT / BrSE | Vocabulary ≥ 70% retained · all topics completed · grammar usable · role-plays done (BrSE) · listening scored |
| Native | All articles ≥ 70% · grammar usable · vocabulary ≥ 70% retained |

"Readiness %" shown everywhere in the app is the average progress towards these gates.

### Monthly milestones (baseline 30 min/day; months scale with `30 / dailyMinutes`, clamped to 0.6×–2×)

| Month | Milestone | Track |
|---|---|---|
| 1 | Hiragana and Katakana passed | all |
| 2 | Halfway through N5 | all |
| 3 | **N5 passed** (incl. mock) | all |
| 5 | Halfway through N4 | all |
| 6 | **N4 passed** | all |
| 8 | Keigo & basic business communication / halfway through N3 | Business, BrSE / JLPT |
| 10 | **N3 passed**, through the intermediate plateau | all |
| 12 | Business Japanese passed | Business, BrSE |
| 13 | IT Japanese passed | BrSE |
| 15 | **BrSE ready** / halfway through N2 | BrSE / JLPT, Business |
| 18 | N2 passed | all |
| 24 | N1 passed | all |

Each milestone is shown as **Đạt** (met), **Đang tới hạn** (due within ~6 weeks), **Chậm tiến độ** (overdue and not met) or **Sắp tới** (upcoming).

> Honest caveat: the gates are measured against this platform's deck (827 words, 234 kanji, 95 grammar points). Passing the real JLPT needs the full official-scale inventory (roughly 800 / 1,500 / 3,700 / 6,000 / 10,000 words for N5 to N1). The *method* scales, and users can import larger word lists through the personal dictionary.

## 7. The adaptive study engine

`buildDailyPlan(input, now)` is a pure function of the learner's state:

1. **Frontier:** `mainFrontier` = the first stage (in order) whose gates are not all met. `proFrontier` = the next Business/IT/BrSE stage for that track, unlocked after N5.
2. **Phase** from the frontier picks the time ratios.
3. **Signals:**
   - due cards and their minutes
   - 14-day SRS retention from per-day `srsPass` / `srsFail` counters (a card's first review is excluded, since it is learning, not retention)
   - leeches
   - weakest section of the latest mock exam
   - weekday
4. **Mode:** review-debt › consolidation › light (Sun) › checkpoint (Wed) › immersion (Sat) › normal.
5. **New-item budget:** `min(user cap, sustainable)`, then adjusted by mode and retention.
6. **Item selection:**
   - New items: queued items → words in the next unread article/dialog → words whose kanji are retained → curriculum order; kanji about 30%, preferring kanji found in words being learned.
   - Recall: retained words with the lowest production accuracy or the oldest production attempt.
   - Grammar drill: completed patterns with the lowest accuracy.
   - Speaking: examples of recently completed grammar and pro-track phrases.
7. **Blocks** are allocated minutes. Spare time flows to input (60%) and output (40%), and fragments under 3 minutes are merged.

The plan is generated **once per day** and cached, so it doesn't reshuffle while the learner works through it. Blocks complete automatically when the matching activity happens anywhere in the app: finishing that article, completing the grammar point, submitting the mock exam, saving a role-play.

### Feedback loops

- Every answer (quiz, exam, drill, comprehension, keigo, kana test) → `itemStats[ref]`. A wrong answer on a card in the deck sets `due = now`.
- Comprehension scores → reading/listening gates and the re-read queue.
- Mock exam → weakness block for 3 weeks, and the mock gate.
- SRS outcomes → retention → new-item throttle.

### What the engine deliberately does not do

- It never adds content the learner hasn't been taught (no grammar before kana is readable, no comprehension input before the script).
- It never prescribes more than the daily budget. Finishing early is treated as success.
- It never uses XP for any decision.
