import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { runtimeDatabaseUrl } from "../src/lib/database-url";

const prisma = new PrismaClient(
  runtimeDatabaseUrl() ? { datasourceUrl: runtimeDatabaseUrl() } : undefined,
);
const dayMs = 86_400_000;
const now = new Date();
const onDay = (offset: number, hour = 12) =>
  new Date(Date.now() + offset * dayMs + hour * 3_600_000);

async function main() {
  const email = (
    process.env.ADMIN_EMAIL || "maribel@example.com"
  ).toLowerCase();
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Maribel",
      passwordHash: await bcrypt.hash(
        process.env.ADMIN_PASSWORD || "change-this-password",
        12,
      ),
    },
  });

  const defaults = [
    ["School", "SCHOOL", "#8b5cf6"],
    ["Tasks", "GENERAL", "#64748b"],
    ["Job", "JOB", "#34d399"],
    ["Personal", "PERSONAL", "#f472b6"],
    ["People/Commitments", "PEOPLE", "#f59e0b"],
    ["Business", "BUSINESS", "#a78bfa"],
    ["Learning", "LEARNING", "#60a5fa"],
  ] as const;
  const categories: Record<string, string> = {};
  for (const [sortOrder, [name, kind, color]] of defaults.entries()) {
    const category = await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: { kind, color, sortOrder },
      create: { userId: user.id, name, kind, color, sortOrder },
    });
    categories[name] = category.id;
  }
  await prisma.settings.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });
  if (await prisma.task.count({ where: { userId: user.id, isSample: true } }))
    return;

  const season = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Sample: Finish the term with confidence",
      horizon: "SEASON",
      seasonLabel: "This term",
      categoryId: categories.School,
      successDefinition: "Complete classes with a calm, sustainable plan.",
      isSample: true,
    },
  });
  const year = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Sample: Build a steady year",
      horizon: "ONE_YEAR",
      successDefinition: "Grow skills, savings, and community.",
      isSample: true,
    },
  });
  await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Sample: A meaningful direction",
      horizon: "FIVE_YEAR",
      successDefinition:
        "Create a life with learning, meaningful work, and strong relationships.",
      isSample: true,
    },
  });

  const biology = await prisma.project.create({
    data: {
      userId: user.id,
      title: "Sample: Biology 101",
      categoryId: categories.School,
      goalId: season.id,
      kind: "CLASS",
      courseCode: "BIO 101",
      instructor: "Sample Instructor",
      scheduleText: "Tue / Thu 10:00 AM",
      term: "Current term",
      outcome: "Build a strong foundation in biology.",
      isSample: true,
    },
  });
  const writing = await prisma.project.create({
    data: {
      userId: user.id,
      title: "Sample: College writing",
      categoryId: categories.School,
      goalId: season.id,
      kind: "CLASS",
      courseCode: "ENG 102",
      instructor: "Sample Instructor",
      scheduleText: "Mon / Wed 1:00 PM",
      term: "Current term",
      isSample: true,
    },
  });
  const job = await prisma.project.create({
    data: {
      userId: user.id,
      title: "Sample: Part-time job",
      categoryId: categories.Job,
      kind: "JOB",
      outcome: "Be reliable and learn the operation.",
      isSample: true,
    },
  });
  const business = await prisma.project.create({
    data: {
      userId: user.id,
      title: "Sample: Tutoring experiment",
      categoryId: categories.Business,
      goalId: year.id,
      kind: "BUSINESS",
      outcome: "Validate a useful focused tutoring offer.",
      successDefinition: "Three paid sessions and a repeatable offer.",
      financialTarget: 50000,
      isSample: true,
    },
  });
  const learning = await prisma.project.create({
    data: {
      userId: user.id,
      title: "Sample: Conversational language practice",
      categoryId: categories.Learning,
      goalId: year.id,
      kind: "LEARNING",
      outcome: "Hold a 15-minute conversation.",
      isSample: true,
    },
  });
  await prisma.project.create({
    data: {
      userId: user.id,
      title: "Sample: Photo journal idea",
      categoryId: categories.Personal,
      status: "SOMEDAY",
      kind: "PERSONAL",
      valueScore: 4,
      effortScore: 2,
      costScore: 1,
      interestScore: 5,
      timingScore: 3,
      isSample: true,
    },
  });
  await prisma.project.create({
    data: {
      userId: user.id,
      title: "Sample: Organize old photos",
      categoryId: categories.Personal,
      kind: "PERSONAL",
      outcome: "An active project intentionally missing a next step.",
      isSample: true,
    },
  });

  await prisma.milestone.createMany({
    data: [
      {
        projectId: business.id,
        title: "Sample: Talk to five potential students",
        dueDate: onDay(10),
        isSample: true,
      },
      {
        projectId: business.id,
        title: "Sample: Run a first session",
        dueDate: onDay(18),
        isSample: true,
      },
    ],
  });
  const read = await prisma.task.create({
    data: {
      userId: user.id,
      title: "Sample: Read chapter four",
      projectId: biology.id,
      categoryId: categories.School,
      kind: "ASSIGNMENT",
      dueDate: onDay(2),
      plannedDate: onDay(1),
      estimateMinutes: 60,
      status: "TODO",
      isSample: true,
    },
  });
  const cards = await prisma.task.create({
    data: {
      userId: user.id,
      title: "Sample: Review flashcards",
      projectId: biology.id,
      categoryId: categories.School,
      kind: "STUDY",
      plannedDate: onDay(0),
      estimateMinutes: 30,
      status: "TODO",
      isSample: true,
    },
  });
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: "Sample: Biology midterm",
        projectId: biology.id,
        categoryId: categories.School,
        kind: "EXAM",
        dueDate: onDay(9),
        estimateMinutes: 120,
        status: "TODO",
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Draft writing outline",
        projectId: writing.id,
        categoryId: categories.School,
        kind: "ASSIGNMENT",
        dueDate: onDay(4),
        estimateMinutes: 45,
        status: "TODO",
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Close inventory",
        projectId: job.id,
        categoryId: categories.Job,
        kind: "SHIFT_DELIVERABLE",
        dueDate: onDay(1),
        estimateMinutes: 25,
        status: "TODO",
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Make a phone call",
        categoryId: categories.Personal,
        kind: "PAPERWORK",
        dueDate: onDay(-2),
        estimateMinutes: 20,
        status: "TODO",
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Plan Sunday",
        categoryId: categories.Personal,
        plannedDate: onDay(0),
        recurrence: "WEEKLY",
        recurrenceWeekdays: [0],
        estimateMinutes: 20,
        status: "TODO",
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Research tutoring demand",
        projectId: business.id,
        categoryId: categories.Business,
        estimateMinutes: 45,
        status: "TODO",
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Practice a dialogue",
        projectId: learning.id,
        categoryId: categories.Learning,
        kind: "PRACTICE",
        plannedDate: onDay(1),
        estimateMinutes: 30,
        status: "TODO",
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Sort class handouts",
        categoryId: categories.School,
        status: "INBOX",
        isSample: true,
      },
    ],
  });
  await prisma.taskStep.createMany({
    data: [
      {
        taskId: read.id,
        title: "Sample: Skim the chapter headings",
        position: 1,
      },
      {
        taskId: read.id,
        title: "Sample: Answer review questions",
        position: 2,
      },
    ],
  });
  await prisma.taskDependency.create({
    data: { blockerId: read.id, blockedId: cards.id },
  });

  const contact = await prisma.person.create({
    data: {
      userId: user.id,
      name: "Sample: Contact",
      relationship: "Friend",
      contact: "sample@example.com",
      isSample: true,
    },
  });
  await prisma.task.create({
    data: {
      userId: user.id,
      title: "Sample: Wait for a reply",
      categoryId: categories.People,
      status: "WAITING",
      waitingOnPersonId: contact.id,
      followUpDate: onDay(2),
      kind: "FOLLOW_UP",
      isSample: true,
    },
  });
  await prisma.calendarEvent.createMany({
    data: [
      {
        userId: user.id,
        title: "Sample: Biology lecture",
        projectId: biology.id,
        categoryId: categories.School,
        kind: "CLASS",
        start: onDay(1, 10),
        end: onDay(1, 11),
        recurrenceWeekly: true,
        recurrenceWeekdays: [2, 4],
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Work shift",
        projectId: job.id,
        categoryId: categories.Job,
        kind: "SHIFT",
        start: onDay(2, 16),
        end: onDay(2, 21),
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Appointment",
        categoryId: categories.Personal,
        kind: "APPOINTMENT",
        start: onDay(5, 9),
        end: onDay(5, 10),
        isSample: true,
      },
    ],
  });
  await prisma.commitment.createMany({
    data: [
      {
        userId: user.id,
        personId: contact.id,
        direction: "THEY_PROMISED",
        description: "Sample: Send the event information",
        followUpDate: onDay(-1),
        isSample: true,
      },
      {
        userId: user.id,
        personId: contact.id,
        direction: "I_PROMISED",
        description: "Sample: Return a book",
        dueDate: onDay(3),
        isSample: true,
      },
    ],
  });
  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        title: "Sample: Biology study guide",
        kind: "RESOURCE",
        url: "https://example.com/study-guide",
        projectId: biology.id,
        categoryId: categories.School,
        triagedAt: now,
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Tutoring notes",
        body: "Ask students where they get stuck.",
        projectId: business.id,
        categoryId: categories.Business,
        kind: "NOTE",
        triagedAt: now,
        isSample: true,
      },
      {
        userId: user.id,
        title: "Sample: Try a morning walk",
        kind: "IDEA",
        isSample: true,
      },
    ],
  });
  await prisma.moneyItem.createMany({
    data: [
      {
        userId: user.id,
        kind: "INCOME",
        name: "Sample: Paycheck",
        amountCents: 65000,
        cadence: "biweekly",
        isSample: true,
      },
      {
        userId: user.id,
        kind: "BILL",
        name: "Sample: Phone bill",
        amountCents: 5500,
        cadence: "monthly",
        dueDay: 12,
        isSample: true,
      },
      {
        userId: user.id,
        kind: "SAVINGS_GOAL",
        name: "Sample: Emergency fund",
        targetCents: 100000,
        savedCents: 25000,
        cadence: "once",
        isSample: true,
      },
    ],
  });
  await prisma.experiment.create({
    data: {
      userId: user.id,
      projectId: business.id,
      hypothesis: "Sample: Students will pay for a focused homework session.",
      budgetCents: 3000,
      startDate: now,
      deadline: onDay(21),
      successMeasure: "Three paid bookings",
      status: "PLANNED",
      isSample: true,
    },
  });
}

main().finally(() => prisma.$disconnect());
