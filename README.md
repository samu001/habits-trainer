# Habits Trainer

Progressive habit coaching app for iPhone, built with Expo + React Native.

Set a big habit goal, choose a small starting point, and build up little by little.

Example: want to work out **5× / week for 60 minutes**? Start at **2× / week for 15 minutes**.

## What’s implemented

### Phase 0 — Foundation
- Expo TypeScript app shell (SDK 54 for App Store Expo Go)
- Design tokens and shared UI components
- React Navigation stack

### Phase 1 — Habit goal creation
- Create habit flow (name, target, start, pace)
- Local persistence with AsyncStorage
- Home list + habit detail screens

### Phase 2 — Weekly prescription + logging
- This-week plan generated from current level
- Log sessions as completed, partial, or skipped
- Credit-based weekly completion rate

### Phase 3 — Progression engine
- Auto-generated level ladder from start → target
- Weekly review: level up / hold / downshift
- Manual “hold this level” override

### Phase 4 — Coaching + motivation
- Onboarding (“start small, build up”)
- Weekly reflection ritual
- Consistency, level progress, and momentum metrics
- Hard-day minimum viable fallback

### Phase 5 — Multi-habit load management
- Building / Maintaining / Paused / Archived states
- Weekly load summary + sequencing tips
- Soft caution when adding too many building habits
- Pause / resume / archive controls

## Requirements

- Node.js 20+
- Expo Go on your iPhone (**SDK 54** App Store build), or a Mac with Xcode for the iOS Simulator

> Note: This project uses **Expo SDK 54** intentionally. Newer SDKs are not currently available in the iOS App Store Expo Go.

## Getting started

```bash
npm install
npm start
```

Then scan the QR code in **Expo Go**, or run:

```bash
npm run ios
```

## Useful scripts

```bash
npm start
npm run ios
npm run typecheck
npm test
```

## Implementation roadmap

See [IMPLEMENTATION_PHASES.md](./IMPLEMENTATION_PHASES.md).

**Next up: Phase 6 — reminders, scheduling & polish.**
