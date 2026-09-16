# Two-way collaboration

## Contribution to Pocket Board

- Repository: https://github.com/suyashbwj/pocket-board
- Branch: `feature/message-word-count`
- Pull request: https://github.com/suyashbwj/pocket-board/pull/3
- Commit: `e20c2b2f2a78e91011ba1c1b8d528f85eb2ddf2b`

The contribution adds a reusable whitespace-separated `countWords` helper and displays the live word count beside the existing character count. The `maxLength={280}` input and post request are unchanged. The pull request is intentionally left open for Suyash to review.

Verified before opening the PR:

```text
npm run test:word-count                 3 passed
npx tsc --noEmit                       passed
EXPO_PUBLIC_API_URL=... expo export    passed
GET /health on hosted API              200 / Postgres
```

The Vercel preview check on PR #3 is **Blocked**, not a build failure. The Vercel project did not authorize a deployment for the collaborator-authored commit; the local Expo export passed. A physical-device test by the contributor remains pending.

## Reverse contribution requested from Suyash

Issue: https://github.com/sanshubhkukutla7-max/tiny-tasks-mas/issues/1

Issue title: **Add a remaining-task count above the task list**

Expected behavior:

- Show the number of incomplete tasks above the list.
- Exclude completed tasks.
- Update immediately after adding a task or toggling its completion state.
- Preserve existing add, toggle, refresh, loading, and error behavior.

Reproducible setup:

```sh
git clone https://github.com/sanshubhkukutla7-max/tiny-tasks-mas.git
cd tiny-tasks-mas
npm ci
printf 'EXPO_PUBLIC_API_URL=https://tiny-tasks-mas.vercel.app\n' > .env.local
npx expo start --go
```

Suyash should create a branch, test the count after adding and toggling, commit under his own identity, push, and open a pull request. The Tiny Tasks owner must then review, pull, build, and test that contribution on a physical phone.

Do not claim the reverse exchange is complete until those human actions and their evidence exist.
