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

## Requirements

- Node.js 20+
- Expo Go on your iPhone, or a Mac with Xcode for the iOS Simulator

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
  components/       # shared UI
  context/          # habits state + persistence
  lib/              # validation + storage helpers
  navigation/       # stack navigator
  screens/          # Home, CreateHabit, HabitDetail
  theme/            # design tokens
  types/            # HabitGoal types
```

## Implementation roadmap

See [IMPLEMENTATION_PHASES.md](./IMPLEMENTATION_PHASES.md).

**Next up: Phase 2 — weekly prescription + logging.**
