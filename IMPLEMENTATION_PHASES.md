# Habits Trainer — Implementation Phases

This roadmap turns the app from a simple checklist into a progressive habit coach:
**start small → build consistency → ramp toward the real goal.**

Each phase should be usable on its own before the next one begins.

---

## Phase 0 — Foundation ✅

**Goal:** Ship a clean Expo iPhone app shell.

### Scope
- Expo + TypeScript project setup
- App naming / iOS config (`app.json`)
- React Navigation stack shell
- Design tokens (`src/theme/tokens.ts`)
- Shared UI primitives (`Screen`, `Button`, `Card`)
- README with run instructions

### Done when
- App runs in Expo Go on iPhone
- Basic UI shell is ready for habit flows

### Status
Completed

---

## Phase 1 — Habit Goal Creation ✅

**Goal:** Let users define a target habit and a small starting point.

### Features
- Create habit flow:
  - Habit name (e.g. “Work out”)
  - Target goal (frequency + duration/amount)
  - Starting level (user-adjustable, smaller than target)
  - Progression pace: Gentle / Steady / Ambitious
- Persist habits locally (AsyncStorage)
- Habits list home screen
- Habit detail screen showing:
  - Target
  - Start
  - Current level (initially = start)

### Core logic
- Validate that start < target on at least one dimension
- Store habit as structured data:

```ts
type HabitGoal = {
  id: string;
  title: string;
  target: { frequencyPerWeek: number; durationMinutes: number };
  start: { frequencyPerWeek: number; durationMinutes: number };
  current: { frequencyPerWeek: number; durationMinutes: number };
  pace: 'gentle' | 'steady' | 'ambitious';
  createdAt: string;
};
```

### Done when
- User can create a habit with target + start
- Habit persists after app reload
- Current level displays correctly

### Status
Completed — see `src/screens/*`, `src/context/HabitsContext.tsx`, `src/lib/*`

---

## Phase 2 — Weekly Prescription + Logging

**Goal:** Tell the user exactly what to do *this week*, and let them log it.

### Features
- Generate current-week plan from `current` level
  - Example: “Work out 2× this week for 15 minutes”
- Today / This Week screen:
  - Remaining sessions
  - Prescribed duration
  - Primary CTA: Log session
- Logging options:
  - Completed as prescribed
  - Partial (minutes done)
  - Skipped (optional reason)
- Simple history list per habit

### Core logic
- Weekly window (e.g. Monday–Sunday)
- Session requirement = `current.frequencyPerWeek`
- Completion credit:
  - Full credit if duration >= prescribed
  - Partial credit if duration > 0 but below prescribed
  - Skip = 0 credit
- Weekly completion rate = earned credits / required sessions

### Done when
- User knows this week’s prescription
- User can log complete / partial / skip
- Weekly progress updates live

### Estimated effort
4–6 days

---

## Phase 3 — Progression Engine (the differentiator)

**Goal:** Automatically guide users upward (or hold/downshift) based on performance.

### Features
- Level ladder generation from start → target
- End-of-week evaluation:
  - Level up
  - Hold
  - Downshift
- Level-up celebration UI
- “Hold this level” manual override
- Progress path visualization (Start → Current → Target)

### Core logic (v1 rules)
- Increase **one dimension at a time** (duration first, then frequency)
- Level up if:
  - completion rate ≥ 80% for current week (steady), and
  - minimum weeks at level met (gentle: 2, steady: 1–2, ambitious: 1)
- Hold if completion rate is 50–79%
- Downshift if completion rate < 50% for 2 consecutive weeks
- Never exceed target
- Optional: max duration increase of +5 to +10 minutes per step

### Example ladder
Target `5×60`, start `2×15`:
1. 2×15
2. 2×20
3. 2×30
4. 3×30
5. 3×40
6. 4×40
7. 4×50
8. 5×50
9. 5×60

### Done when
- Completing a strong week can unlock the next level
- Struggling weeks suggest hold/downshift
- User can see the full path to their goal

### Estimated effort
5–7 days

---

## Phase 4 — Coaching Experience + Motivation

**Goal:** Make the app feel like a guide, not a tracker.

### Features
- Onboarding that explains “start small, build up”
- Weekly review ritual:
  - What went well?
  - Keep / hold / adjust?
- Motivational copy tied to state:
  - Building
  - Crushing it
  - Needs recovery
- Better metrics than raw streaks:
  - Consistency score
  - Level progress %
  - Momentum (improving / stable / slipping)
- “Minimum viable version” suggestion for hard days
  - Example: “Can’t do 15 min? Do 5 min to keep the chain alive.”

### Core logic
- Momentum derived from last 2–4 weeks of completion rates
- Identity framing copy based on habit category
- Bad-day fallback = ~30–50% of current duration, same intention

### Done when
- Weekly review exists
- Users get contextual coaching messages
- Progress metrics feel encouraging and fair

### Estimated effort
4–6 days

---

## Phase 5 — Multi-Habit Load Management

**Goal:** Help users succeed with more than one habit without burnout.

### Features
- Limit active “building” habits (recommend max 1–3)
- Habit states: Building / Maintaining / Paused
- Total weekly load indicator
- Suggestions to sequence habits
  - “Lock in Habit A before adding Habit B”
- Archive / pause / resume habits

### Core logic
- Building habit = current < target
- Maintaining habit = current == target for N weeks
- Warn when total prescribed sessions/time crosses a threshold
- Soft gate: creating a 3rd+ building habit shows a caution

### Done when
- Users can manage multiple habits thoughtfully
- App discourages overcommitment

### Estimated effort
3–5 days

---

## Phase 6 — Reminders, Scheduling & Polish

**Goal:** Reduce friction and make daily use reliable.

### Features
- Preferred days/times per habit
- Local push notifications / reminders
- Home-screen widget-friendly summary (later native)
- Empty states, error states, loading states
- Haptics / micro-interactions on level-up and completion
- Accessibility pass (Dynamic Type, contrast, VoiceOver labels)

### Core logic
- Reminder schedule derived from weekly prescription + preferred times
- Missed-reminder does not punish user; it only nudges

### Done when
- Users get timely reminders
- App feels polished enough for TestFlight

### Estimated effort
4–6 days

---

## Phase 7 — Insights, Templates & Expansion

**Goal:** Speed up setup and deepen long-term value.

### Features
- Habit templates:
  - Fitness, reading, meditation, language, deep work
- Pre-built ladders per template
- Insights:
  - Best day of week
  - Average completion by habit
  - Time-to-target estimate
- Export / backup data
- Optional Apple Health integrations (workouts, mindfulness)
- Optional cloud sync + accounts

### Core logic
- ETA to target based on pace + recent consistency
- Template defaults still fully editable

### Done when
- New users can start in under 60 seconds via templates
- Returning users get useful insights

### Estimated effort
1–2+ weeks (depending on integrations)

---

## Suggested build order (summary)

| Phase | Focus | Outcome | Status |
|------:|-------|---------|--------|
| 0 | Foundation | Runnable iPhone app shell | ✅ Done |
| 1 | Goal creation | Target + start point saved | ✅ Done |
| 2 | Prescription + logging | Weekly plan users can execute | Next |
| 3 | Progression engine | Auto level-up / hold / downshift | Planned |
| 4 | Coaching UX | Feels supportive and guided | Planned |
| 5 | Multi-habit management | Prevents overload | Planned |
| 6 | Reminders + polish | Daily reliability | Planned |
| 7 | Templates + insights | Faster setup, long-term retention | Planned |

---

## Definition of an MVP worth sharing

**Phases 1–3 complete** is the first real product:

- Set a big goal
- Choose a small start
- Follow this week’s prescription
- Log sessions
- Automatically progress little by little

That is enough to validate the core promise before investing in reminders, templates, and integrations.

---

## Technical notes for this repo

- Framework: Expo React Native (iOS-first)
- Start with local persistence; add backend only when sync/accounts are needed
- Keep progression rules in a pure TypeScript module (easy to test)
- Prefer simple deterministic rules in v1 before any AI coaching layer

### Proposed early folder structure

```text
src/
  components/
  features/
    habits/
    logging/
    progression/
    review/
  lib/
    storage.ts
    dates.ts
  types/
  screens/
```

---

## Next implementation step

Begin **Phase 2**:
1. Generate a weekly prescription from `current` level
2. Add session logging (complete / partial / skip)
3. Show this-week progress on Home and Habit Detail
