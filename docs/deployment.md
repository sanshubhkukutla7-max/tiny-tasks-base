# Vercel Hobby + Neon Free deployment

This is the selected and deployed production path. The live API is https://tiny-tasks-mas.vercel.app/api/tasks. It uses a Vercel Hobby project and a Neon marketplace database; no paid plan was selected.

## 1. Create the Neon database

1. Sign in to Neon and create a Free-plan project named `tiny-tasks-mas`.
2. Use the default database and copy its pooled Postgres connection string.
3. Treat that string as a password. Never paste it into source code, Expo variables, screenshots, issues, or chat messages.

The API creates the `tasks` table on its first database request.

## 2. Deploy the Vercel Function

1. Sign in to Vercel on the Hobby plan using GitHub.
2. Import the Tiny Tasks repository.
3. Leave the project root at the repository root. Vercel detects `api/tasks.ts` as `/api/tasks`.
4. Add `DATABASE_URL` in **Project Settings → Environment Variables** for Production and Preview. Paste the Neon connection string there.
5. Deploy.

Official references: [Vercel Functions](https://vercel.com/docs/functions), [Vercel environment variables](https://vercel.com/docs/environment-variables), and [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver).

## 3. Verify production before using the phone

Replace `BASE_URL` below with the Vercel deployment URL.

```sh
curl -i "$BASE_URL/api/tasks"

created=$(curl -fsS -X POST \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hosted read-write verification"}' \
  "$BASE_URL/api/tasks")

id=$(printf '%s' "$created" | jq -r '.id')

curl -fsS -X PATCH \
  -H 'Content-Type: application/json' \
  -d '{"completed":true}' \
  "$BASE_URL/api/tasks?id=$id"

curl -fsS "$BASE_URL/api/tasks"
```

Expected results: `GET` returns `200`; `POST` returns `201`; `PATCH` returns `200`; the final `GET` contains the same ID with `completed: true`.

## 4. Point Expo at production

Create `.env.local` at the repository root:

```dotenv
EXPO_PUBLIC_API_URL=https://tiny-tasks-mas.vercel.app
```

Restart Expo with `npx expo start --go`, then complete the hosted physical-phone checklist in [progress.md](progress.md).
