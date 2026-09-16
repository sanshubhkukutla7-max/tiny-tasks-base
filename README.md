# Tiny Tasks

Tiny Tasks is a deliberately small Expo/React Native app for saving tasks to a REST API, marking them complete, and refreshing the saved state. The production API is a Vercel Function backed by Neon Postgres; a file-backed local API is included for development without a cloud account.

## What it does

- Adds a non-empty task (maximum 160 characters).
- Retrieves saved tasks from the backend.
- Toggles a task between active and complete.
- Refreshes the list from the backend on demand.
- Shows loading, saving, refresh, update, empty, and error states.

## Architecture

| Part | Technology | Data location |
| --- | --- | --- |
| Mobile app | Expo SDK 57, React Native, TypeScript | UI state only |
| Local development API | Node HTTP server using the shared handler | `.local/tasks.json` (ignored by Git) |
| Hosted API | Vercel Function at `/api/tasks` | Neon Postgres |

`DATABASE_URL` is used only by the Vercel Function. The Expo app receives only the public `EXPO_PUBLIC_API_URL`; no database credential is bundled into the app.

## Development setup

Requirements: Node.js 22.13 or newer, npm, Git, and Expo Go on an iPhone or Android phone.

```sh
git clone https://github.com/sanshubhkukutla7-max/tiny-tasks-mas.git
cd tiny-tasks-mas
npm ci
```

Start the local file-backed API:

```sh
npm run api:local
```

In a second terminal, create `.env.local`:

```dotenv
# Browser-only test
EXPO_PUBLIC_API_URL=http://localhost:3001

# Physical phone: replace with the computer's LAN IP; both devices must share Wi-Fi
# EXPO_PUBLIC_API_URL=http://192.168.1.25:3001
```

Then run Expo:

```sh
npx expo start --go
```

Scan the QR code in Expo Go. After changing `.env.local`, fully reload the app. For web-only testing, press `w` in the Expo terminal.

Local data persists across local API restarts in `.local/tasks.json`. This file is for development only and is never committed.

## Hosted testing

After deployment, use the HTTPS base URL instead of the LAN URL:

```dotenv
EXPO_PUBLIC_API_URL=https://tiny-tasks-mas.vercel.app
```

Hosted verification is distinct from local verification: create a uniquely named task on the phone, toggle it, tap **Refresh**, force-close/reopen Expo Go, and confirm the same task and completion state return from Neon.

## REST API

| Method | Path | Body | Result |
| --- | --- | --- | --- |
| `GET` | `/api/tasks` | none | All tasks, newest first |
| `POST` | `/api/tasks` | `{ "title": "Submit project" }` | Created task |
| `PATCH` | `/api/tasks?id=TASK_ID` | `{ "completed": true }` | Updated task |
| `OPTIONS` | `/api/tasks` | none | CORS preflight |

Example:

```sh
curl https://tiny-tasks-mas.vercel.app/api/tasks
curl -X POST -H 'Content-Type: application/json' \
  -d '{"title":"Hosted API check"}' \
  https://tiny-tasks-mas.vercel.app/api/tasks
```

## Automated checks

```sh
npm run check
npm test
npm run export:web
```

The API tests cover blank-title rejection, trimmed creation and retrieval, completion updates, and missing-task behavior. See [progress and evidence](docs/progress.md) for recorded outcomes and the remaining physical-device work.

## Deployment and collaboration

- [Vercel + Neon deployment](docs/deployment.md)
- [Partner workflow](docs/collaboration.md)
- [Progress and evidence](docs/progress.md)
- [References](docs/references.md)
