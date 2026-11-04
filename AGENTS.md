# Maribel OS contributor guide

Maribel OS is a single-owner personal life dashboard. All screens use the same shared Categories, Goals, Projects, Tasks, Calendar Events, Notes, People, Commitments, Money Items, and Experiments. Do not make screen-specific duplicate records.

Use the dedicated Postgres schema life. Never commit environment files. Keep one OWNER account, session-version invalidation, and the single daily Vercel cron.

This project uses a recent Next.js release. Read the relevant guide in node_modules/next/dist/docs before changing framework conventions.
