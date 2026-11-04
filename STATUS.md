# Status

## Built

- Cookie-JWT owner authentication with bcrypt password hashes, session-version invalidation, login rate limiting, trusted Vercel forwarding headers only, and POST same-origin logout.
- A fresh Prisma schema in the dedicated life schema, with Category, Task, TaskStep, TaskDependency, Person, CalendarEvent, Project, Goal, Note, Commitment, MoneyItem, Experiment, and WeeklyReview records.
- Dark responsive NavShell with desktop navigation, mobile bottom navigation, a quick capture bar, and a keyboard command palette.
- Today, Week, Inbox, Waiting On, Projects, School, Job, Learning, Goals/Direction, Weekly Review, Calendar, People, Settings, Money, and Experiments screens.
- Separate due/planned task dates, estimates, effort, waiting person and follow-up dates, project milestones, task steps, and dependencies.
- Capacity calculations, project next-step health, sample-only deletion guard, daily protected recurrence cron, migration helper, seed URL helper, and Vitest coverage for rate limits, dates/capacity, seed URL behavior, and the clear-sample guard.

## Sample data

The seed intentionally uses generic, clearly prefixed Sample: records. It includes example school projects, work shifts, commitments, money items, and a small experiment. It is illustrative only and can be removed from Settings.

## Known limits

- Calendar currently presents the upcoming event list rather than drag-and-drop scheduling.
- Projects show a representative task-detail panel; task editing remains form-driven.
- People and calendar creation are currently seeded/database-backed surfaces rather than dedicated creation modals.

## Based on a personal OS template

### Carried over

- Next.js App Router structure, Prisma patterns, Tailwind v4 styling approach, shared-record task architecture, dark navigation shell, quick capture, task detail patterns, command palette concept, calendar and people views, task steps/dependencies, and cookie JWT authentication.

### Not carried over

- Any external data ingestion, connector, uploader, automated suggestion, audio briefing, agent, 3D visual, analytics, or third-party personal context feature.
