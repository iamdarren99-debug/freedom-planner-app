# Freedom Planner

Phase 0 base app for a personal goal-planning and scheduling system built with:

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- AsyncStorage

The current app is intentionally simple and stable. It gives you a clean dark-theme shell with:

- bottom tab navigation
- dashboard
- goals list and goal detail
- planner
- journal
- progress
- settings

## Run the app

Install packages:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

## Folder structure

```text
app/
  _layout.tsx
  index.tsx
  goals/
    index.tsx
    [id].tsx
  planner/
    index.tsx
  journal/
    index.tsx
  progress/
    index.tsx
  settings/
    index.tsx

src/
  components/
    ui/
    cards/
    forms/
  constants/
  data/
  hooks/
  store/
  types/
  utils/
```

## Notes

- The state layer is local-first so the app works before any backend exists.
- Seed data is included so the base screens are useful right away.
- The structure is meant to be extended in later phases without rewriting the foundation.
