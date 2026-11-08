# Daily Command Center 1.0

Android-first, offline personal workspace built with Expo SDK 54, React Native, TypeScript, Expo Router and expo-sqlite. No account or backend is required.

## Setup

Use Node.js 22.13+ (Node 24 recommended for the test runner) and npm.

```sh
npm ci
npm start
```

Scan the QR code with an Expo Go version that supports SDK 54, or run `npm run android` with an Android emulator/device attached. For an installed standalone app, use the APK instructions below. The native Android app is the supported target; web is not configured.

## Features

- Today: completion percentage, today's schedule, open overdue and unscheduled tasks, next five task/goal deadlines, quick add.
- Tasks: create, edit, delete with confirmation, toggle completion, priority, optional scheduled date, search and active/done/all filters. Tap a task title to edit.
- Notes: create, edit, delete and search both title and content. Tap a card to edit.
- Goals: optional deadlines, editable/deletable milestones, milestone completion and calculated progress. Tap a milestone title to edit. Deleting a goal also deletes its milestones.
- Dark interface, bottom tabs with fade navigation, shared UI components, loading, empty, retry and save error states.

Dates use local calendar days in `YYYY-MM-DD` format and are validated, including leap years. Blank dates are allowed. Goal progress is completed milestones / total milestones; a goal without milestones is 0%. Completed goals are excluded from upcoming deadlines.

## Storage and structure

`app/` contains the four Expo Router tabs. `src/store.tsx` initializes the SQLite schema and provides shared live data; writes use bound SQL parameters and reload shared state. `src/model.ts` contains date and progress rules. Shared UI, editor and task components live under `src/`. Tests live under `tests/`.

Data is written to `daily-command-center.db` in the app's private storage and survives process termination and reopening. It is local to this installation. Clearing app data or uninstalling removes it; there is no cloud backup or export in v1. There are no seeded or simulated records. Schema version is 1; future schema changes require migrations.

## Checks

```sh
npm run typecheck
npm test
npm run format:check
npx expo install --check
npx expo export --platform android
```

Tests cover calendar validation, dashboard selection, progress, actual SQLite schema CRUD, reopening a database file and goal-to-milestone cascading deletion. The storage test uses Node's SQLite engine and the actual app schema; it does not exercise Expo's native bridge.

### Android acceptance test

1. Launch with no data and verify all four empty states and navigation.
2. Create tasks with low/high priorities, today's date, an overdue date and a future date; check dashboard inclusion and filters. Try an impossible date and blank title.
3. Edit a task, complete/uncomplete it, search, cancel deletion, then confirm deletion.
4. Create and edit notes; search by body text; cancel an editor and verify no changes were saved.
5. Create a goal with a deadline, add/edit milestones, complete half and check progress. Delete a milestone and a goal, confirming the prompts.
6. Force-stop and reopen the app, then reboot the device. Verify task completion, notes, deadlines and milestones remain.
7. Repeat CRUD in airplane mode. Check keyboard visibility, large font settings and Android back navigation in editors.

## Generate an Android APK

An Expo account, Internet access and Android signing credentials are required for EAS cloud builds. No Expo project ID or signing secrets are committed.

```sh
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

The first configuration links your Expo project and may add `extra.eas.projectId` to app.json; commit that nonsecret project metadata. Allow EAS to generate/manage the Android keystore if you do not already have one. `eas.json` defines an internal-distribution `preview` profile with `android.buildType: apk`. After the build succeeds, download the APK from the EAS build URL and install it on Android. The production profile creates an AAB instead.

## Validation performed in the implementation environment

- TypeScript: passed.
- Automated logic and SQLite persistence tests: passed.
- Expo package compatibility: passed.
- Android Metro/Hermes bundle export: passed (this is not an APK).
- Formatting: checked with Prettier.

No Android emulator/ADB or Expo cloud credentials were available in this workspace. Native device acceptance tests and an EAS cloud build remain to be run. No APK has been built or claimed. The app does not provide reminders, notifications, sync or authentication.
