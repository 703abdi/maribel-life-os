# Maribel OS

Maribel OS is a private, single-user dashboard for directing life: one shared set of tasks, projects, goals, events, commitments, notes, money items, and experiments viewed through Today, Week, School, Job, and focused planning screens.

## Local development

1. Copy `.env.example` to `.env` and fill in a local PostgreSQL `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
2. Run `npm install`.
3. Run `npm run db:deploy`, then optionally `npm run db:seed` for clearly labeled sample records.
4. Run `npm run dev`, open `http://localhost:3000`, and sign in with the configured admin credentials. The first matching sign-in creates the owner account.

Useful checks: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## Deploy: Vercel Hobby + Supabase Free

1. Create a Supabase project and copy its connection strings. Use the pooled connection (port `6543`, with `pgbouncer=true`) as `DATABASE_URL`; use the direct connection (port `5432`) as `DIRECT_URL`.
2. Import this repository into Vercel. Add the variables from `.env.example`: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `APP_URL`, `APP_TIMEZONE`, and `CRON_SECRET`. Add `NOTIFY_TO`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` only if daily email digests are wanted.
3. Use build command `npm run vercel-build`; it generates Prisma, deploys migrations through the direct URL, then builds Next.js. Run `npm run db:seed` locally or from a controlled one-off environment if you want the sample walkthrough.
4. Sign in for the first time, then use the setup checklist in Settings to set areas, classes, job schedule, timezone/capacity, priorities, and reminders.

Vercel Hobby permits one daily cron here: `/api/cron/daily` at `0 11 * * *`. It generates any due recurring task instances and can email a digest. Hobby is intended for non-commercial personal use, which fits this private dashboard.

## Sample data

The seed creates records prefixed `Sample:` and marks them `isSample=true`. Settings has a protected **Clear sample data** operation: type `CLEAR SAMPLE DATA` to delete only sample areas, projects, milestones, tasks, events, notes, people, commitments, money items, experiments, goals, and reviews. Real records and settings remain.
