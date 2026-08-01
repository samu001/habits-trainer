# Habits Trainer

Progressive habit coaching app for iPhone, built with Expo + React Native.

Set a big habit goal, choose a small starting point, and build up little by little.

Example: want to work out **5× / week for 60 minutes**? Start at **2× / week for 15 minutes**.

## What’s implemented

### Phase 0 — Foundation
- Expo TypeScript app shell
- Design tokens and shared UI components
- React Navigation stack

### Phase 1 — Habit goal creation
- Create habit flow (name, target, start, pace)
- Local persistence with AsyncStorage
- Home list + habit detail screens
- Validation: start must be smaller than target

### Phase 2 — Weekly prescription + logging
- This-week plan generated from current level
- Log sessions as completed, partial, or skipped
- Credit-based weekly completion rate
- Session history per habit

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
npm start       # start Expo
npm run ios     # iOS
npm run typecheck
npm test
```

## Project structure

```text
App.tsx
src/
  components/       # shared UI + WeeklyPlanCard
  context/          # habits + session logs state
  lib/              # validation, dates, prescription, storage
  navigation/       # stack navigator
  screens/          # Home, CreateHabit, HabitDetail, LogSession
  theme/            # design tokens
  types/            # HabitGoal + SessionLog types
```

## Implementation roadmap

See [IMPLEMENTATION_PHASES.md](./IMPLEMENTATION_PHASES.md).

**Next up: Phase 3 — progression engine (level-up / hold / downshift).**
