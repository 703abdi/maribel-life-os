# Maribel OS

Maribel OS is a private, single-owner life dashboard for directing school, work, projects, people, commitments, and personal direction from one shared set of records.

Tasks are created once and can appear in Today, Week, Inbox, Waiting On, a project, School, Job, Learning, and Calendar views. A task keeps its due date separate from its planned work date, along with an estimate, effort, steps, dependencies, and optional waiting/follow-up details.

## Local setup

1. Install dependencies with npm install.
2. Copy the variables in .env.example into your local environment. Do not commit an environment file.
3. Create the dedicated life schema through npm run db:deploy.
4. Seed an owner and clearly marked example records with npm run db:seed.
5. Start the app with npm run dev, then sign in with ADMIN_EMAIL and ADMIN_PASSWORD.

The first successful login can bootstrap the sole owner only when both configured owner credentials match. Passwords are bcrypt-hashed. The life_session HTTP-only cookie contains a signed JWT and becomes invalid when the session version changes.

## Supabase and Vercel Hobby deployment

Create a Supabase project, then set a pooled connection URL as DATABASE_URL and a direct database URL as DIRECT_URL. Both should target the life schema. The runtime URL helper adds schema=life and enables the transaction-pooler parameter for Supabase port 6543; the seed uses this same helper.

In Vercel, set DATABASE_URL, DIRECT_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, and CRON_SECRET. Deploy with the normal Vercel build command. The build runs Prisma generation, then deploys the migration over the direct connection. Vercel Hobby uses the one daily cron declared in vercel.json: /api/cron/daily at 11:00 UTC. Requests need an Authorization bearer token matching CRON_SECRET.

## Sample data and first run

The seed creates generic records prefixed Sample: and marks every one with isSample=true. In Settings, type CLEAR SAMPLE DATA to remove only those marked records. Your own records and settings are not removed.

Finish the first-run checklist by setting categories, classes, job schedule, timezone/capacity, prioritization, and reminder habits. The dashboard then uses daily and weekly capacity settings to flag overloaded days.

## Commands

- npm run dev — development server
- npm run build — generate Prisma client and create a production build
- npm run lint — lint source
- npm run typecheck — TypeScript checks
- npm test — Vitest unit tests
- npm run format / npm run format:check — Prettier formatting
- npm run db:deploy — apply the fresh life migration
- npm run db:seed — seed generic sample data
