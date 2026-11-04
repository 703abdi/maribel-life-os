# Maribel OS status

## Built

- Shared Prisma record system in schema `life`: areas, horizons/goals, projects and milestones, tasks/subtasks with separate due and planned dates, people/commitments, events, notes/resources, money, experiments, reviews, and per-owner settings.
- Today, Week, Inbox, Projects plus Not now comparison, Waiting On, generic Areas, specialized School and Job views, Goals, Weekly Review, Money, Experiments, Settings, Account, and responsive desktop/sidebar plus mobile bottom navigation.
- Hardened owner auth: JWT `life_session`, session-version invalidation, bootstrap from configured admin credentials, database rate limits (5 email+IP / 20 email), trusted forwarding headers only on Vercel, same-origin POST logout, and password changes.
- Daily protected cron for idempotent recurring task generation and optional Gmail/outbox digest; one Vercel Hobby cron only.
- Seeded walkthrough sample data, clean initial migration, helper/unit coverage, docs, and clean `.env.example`.

## Deferred / known limits

- No sharing or multi-user roles; this is intentionally one-owner.
- No external calendar synchronization, file uploads, push notifications, or calendar drag-and-drop.
- Events support weekly recurrence metadata; the current Week query displays stored events rather than expanding an unbounded recurrence series.
- Forms focus on core capture and management. Full editing for every record type is deliberately compact and can be expanded after real-life usage identifies the needed fields.
