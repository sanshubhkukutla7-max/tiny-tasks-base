# Assignment progress and evidence

Last updated: September 16, 2026.

## Completed

- Installed GitHub CLI and authenticated as `sanshubhkukutla7-max` with `repo`, `workflow`, `read:org`, and `gist` scopes.
- Configured repository-local Git identity as `sanshubhkukutla7-max <329792722+sanshubhkukutla7-max@users.noreply.github.com>`.
- Created an Expo SDK 57 / React Native / TypeScript app.
- Implemented task input, Add, list, completion toggle, Refresh, loading/error/empty states, and empty-task rejection.
- Implemented shared REST request validation and a Vercel Function backed by Neon Postgres.
- Kept `DATABASE_URL` server-only; `.env.local` and local data are ignored by Git.
- Added a file-backed local REST API for account-free development and restart-persistence testing.
- Accepted Pocket Board collaborator access, created `feature/message-word-count`, committed under the contributor identity, pushed, and opened PR #3 without merging it.
- Renamed the supplied repository to `tiny-tasks-mas`, changed it to private, and sent `suyashbwj` a write-access invitation.
- Created Vercel project `shubshubh/tiny-tasks-mas`, accepted the Neon marketplace terms, connected the free Neon resource, and deployed https://tiny-tasks-mas.vercel.app.
- Verified live Neon behavior with `GET 200`, `POST 201`, `PATCH 200`, a separate readback of the same completed task, and `OPTIONS 204` with CORS headers.
- Created reverse-exchange issue #1 for `suyashbwj` with expected behavior, setup commands, and the hosted API URL.
- Prepared exact reverse-exchange requirements for Suyash.

## Actual commands and outcomes

```text
npm run check
  PASS — TypeScript emitted no errors.

npm test
  PASS — 1 file, 4 API tests.

npm run export:web
  PASS — Expo web bundle exported to dist/.

Local REST checks
  GET     /api/tasks                  200
  POST    /api/tasks                  201; returned saved task
  PATCH   /api/tasks?id=...           200; completed=true
  POST blank title                    400
  Stop/start API, then GET            saved task returned; persistence verified

Pocket Board
  npm run test:word-count             PASS — 3 tests
  npx tsc --noEmit                    PASS
  Expo web export with hosted URL     PASS
  GET hosted /health                  200; storage=Postgres

Tiny Tasks production
  GET     /api/tasks                  200; initial []
  POST    /api/tasks                  201; id 951c65ae-a702-40f0-8c05-b93e4b495a06
  PATCH   /api/tasks?id=...           200; completed=true
  separate GET readback               same id and completed state verified
  OPTIONS /api/tasks                  204; allow-origin=*; GET/POST/PATCH/OPTIONS
```

## Pending and must not be overstated

- `suyashbwj` must accept the pending write-access invitation to Tiny Tasks.
- Run the starter/sample and Tiny Tasks in Expo Go on the account owner's physical phone, interact with them, and add real screenshots.
- Test the hosted state on the physical phone: add, toggle, Refresh, force-close/reopen, and confirm persistence.
- Test Pocket Board PR #3 on the contributor's physical phone.
- Have Suyash implement his Tiny Tasks branch/PR; then fetch, build, and test it on the owner phone.
- Add both students' brief reflection and real collaboration/debugging notes.

## Screenshot inventory

No physical Tiny Tasks screenshot has been claimed. A mobile-sized browser preview may be added as UI evidence but must remain labeled **web preview**, because it does not satisfy the physical-device requirement.

The supplied screenshot of Pocket Board PR #3 shows Vercel status **Blocked**. GitHub reports the same blocked deployment check while the local word-count tests, TypeScript check, and Expo export pass. This is recorded as a deployment-authorization limitation, not a successful preview and not a code-test failure.

## Debugging notes

1. Direct GitHub API access initially interrupted CLI login; repeating the official device flow with the GitHub CLI OAuth client completed authentication and private-repository scope.
2. Pocket Board initially returned 403 until the collaborator invitation was accepted and the CLI token included `repo` scope.
3. A first Node `.ts` test file polluted the mobile TypeScript check with Node-only types. Moving the Node test harness to `.mjs` kept the reusable helper in TypeScript and restored a clean app check.
4. Pocket Board's first lint invocation tried to install a new lint configuration and exposed unrelated starter warnings. The incidental configuration was removed; the PR stays limited to the word-count feature.
5. Local Tiny Tasks API tests use an ignored file backend; production is deliberately separate and uses Neon.
6. An automated mobile-sized web screenshot was attempted, but the Playwright Chromium download timed out repeatedly. No screenshot was fabricated; real physical-phone screenshots remain pending.

This document distinguishes automated/local evidence, hosted evidence, and physical-device evidence. Missing human actions remain marked pending.
