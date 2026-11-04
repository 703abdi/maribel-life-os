# Read this first: setup brief for Maribel's Claude

You are helping Maribel set up and personalize **Maribel OS**, her private personal life dashboard. Abdi built it for her. It is already working: lint, typecheck, tests, and the production build all pass. Your job is to **deploy it, personalize it with her, and teach her how to use it**, not to rebuild it. Do not change app code unless something is actually broken, and explain any fix before you make it.

Also read `AGENTS.md` (architecture rules), `README.md` (setup and deploy), `STATUS.md` (what's built and its known limits), and `.env.example`.

## Who it's for and why

Maribel is a student juggling school, a job, personal responsibilities, commitments to a friend, business ideas, and learning projects. She wants a place to _direct her life_, where her schedule and tasks support bigger decisions: what she's building toward, what she can realistically take on, and what deserves her attention.

Her brief, in her words:

> I want a personal dashboard that brings together my school, tasks, job, personal responsibilities, commitments to my friend, business endeavors, and learning projects. When I open it, I want to understand what needs my attention today, what is coming up, what I have committed to, and the next action for each active project. I need one quick place to capture tasks, ideas, notes, and links. Each item should connect to the relevant area or project and appear in the appropriate daily or weekly view without duplicate entry. The dashboard should support deadlines, planned work dates, recurring tasks, priorities, project milestones, and a "waiting on" list. Notes and resources should stay connected to the work they support. Please build the first version around a simple daily workflow and weekly review. Before implementation, help me confirm the categories, integrations, reminder preferences, privacy settings, and information to import. I want to test it using real examples from each area of my life.

The principles she asked for, which the app already follows. Keep them intact:

- **Store each item once, show it everywhere it belongs.** Goals, projects, tasks, people, notes, money, and time are shared records. An assignment appears under its class, in her task list, and on Today without being entered three times.
- **Due date is not the planned work date.** "Due Friday" and "working on it Wednesday" are separate fields.
- **Three planning horizons:** _Today_ (what needs attention and what fits), _This season_ (semester or quarter goals), and _My direction_ (the 1-year and 5-year life she's working toward).
- **Capacity:** school, work, and personal load combine, so overloaded weeks show up before they happen.
- **Decision support:** "What am I forgetting?", "What should I focus on this week?", "If I take this on, what gets postponed?", "Which projects have no next step?", "Am I spending time on what I say matters?"

## What's in the app

Today (top 3 priorities, due and planned tasks, events, overdue commitments) · Week (deadlines, work hours, commitments, capacity warnings) · Inbox (quick capture, then triage) · Waiting On (grouped by person, with follow-up dates) · Projects (goal, tasks, notes and links, next action, flags for projects with no next step) · School · Job · Learning · Goals / Direction · Weekly Review · Calendar · People · Money · Experiments · Settings (with a first-run checklist and "clear sample data").

There is also a quick-capture bar and a command palette. The app is mobile-friendly with bottom navigation. It's single-owner: only Maribel's login can get in.

## Step 1: Deploy (follow README.md)

1. `npm install`.
2. Help her create a free Supabase project. DATABASE_URL is the pooled string (port 6543, `?pgbouncer=true&schema=life`). DIRECT_URL is the direct string (port 5432, `?schema=life`).
3. Generate AUTH_SECRET and CRON_SECRET for her (long, random, and different from each other). Ask her for the login email and password she wants (ADMIN_EMAIL, ADMIN_PASSWORD).
4. Put these in a local `.env`. **Never commit it, and never paste secrets into chat or into files that get committed.**
5. Run `npm run db:deploy`, `npm run db:seed`, and `npm run dev`. Have her log in at localhost:3000.
6. Deploy to Vercel on the free Hobby plan, either by importing her copy of the repo or with the Vercel CLI. Set all six env vars in Vercel. Confirm she can log in on the live URL and on her phone. Have her add it to her phone's home screen.
7. Note: free Supabase projects pause after about a week with no activity. If the site stops loading, she should open the Supabase dashboard and restore the project. The daily cron runs at 11:00 UTC.

## Step 2: Interview her and personalize it (the important part)

Ask these one or two at a time, conversationally, and enter her answers into the app (Settings, then each area) as you go:

1. **Areas:** What are your real categories? Use her own names for school, job, personal, the friend she has commitments to, business, and learning.
2. **School:** Which classes is she taking this semester, and what are the upcoming assignments, exams, and due dates? When does the semester end?
3. **Job:** What's the job or role? What's her usual shift schedule, and what are her recurring deliverables or follow-ups?
4. **Schedule and capacity:** What's her timezone and her typical school and work hours? How many focused hours does she realistically have on a weekday and on a weekend day?
5. **Commitments:** What has she promised anyone, by when? Who is she waiting on, and for what?
6. **Business:** What business ideas or projects does she have? For each, what does success look like and what's the very next step? Is there a spending limit or a decision date?
7. **Learning:** What is she learning, and what will she make with it (a project, certification, or portfolio piece)?
8. **Direction:** What does she want to accomplish this semester? In a year? In five years? Link her projects to those goals.
9. **Prioritizing:** Should urgency, importance, effort, or a hand-picked daily top 3 decide what appears first?
10. **Recurring:** What responsibilities repeat (bills, appointments, paperwork, chores)?
11. **Reminders:** Which things deserve a reminder, and how far ahead?
12. **Tools and privacy:** Where does she keep her calendar, tasks, and notes today (Google Calendar, Notes, Canvas, etc.)? What should be imported now? (v1 has no live sync; enter or import key items by hand.) Does anyone else ever need to see anything? (v1 is private to her.) Is she allowed to put work info in a personal app?
13. **Devices:** Will she mostly use her phone or her laptop? Any layout or accessibility preferences?

Then have her enter **one real example from each area** and check that each item shows up correctly on Today, Week, its project or area page, and Waiting On if it applies. Once her real data is in, clear the sample data in Settings by typing `CLEAR SAMPLE DATA`. That deletes only records marked as samples.

## Step 3: Teach her the routine

- **Daily (5 min):** Open Today, pick the top 3, and capture anything new into the Inbox.
- **Weekly (20 min, e.g. Sunday):** Run the Weekly Review. Triage the Inbox, check Waiting On, give every project a next step, check next week's capacity, and write a short reflection.
- **Each season:** Revisit the semester goals and the 1-year and 5-year direction.

## Rules

- Don't rebuild or redesign. Small fixes only, and only for real bugs. Run `npm run lint && npm run typecheck && npm test && npm run build` after any change.
- Keep one owner account and the schema `life`. Keep the single daily cron (Vercel Hobby only allows daily).
- Never commit `.env` or any secret.
- For a feature she wants later (calendar sync, reminders by text or email, sharing with her friend), write it down in a `WISHLIST.md` and tell her to send it to Abdi. Don't build it during setup.
