import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, startOfWeek } from "@/lib/dates";
import { projectHasNoNextStep, todayTaskBuckets } from "@/modules/life";
export async function ensureSettings(userId: string) {
  return prisma.settings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}
export async function todayData(userId: string) {
  const today = startOfDay(),
    tomorrow = addDays(today, 1);
  const [
    tasks,
    events,
    commitments,
    settings,
    areaCount,
    classCount,
    jobScheduleCount,
  ] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      include: { project: true, category: true, waitingOnPerson: true },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    }),
    prisma.calendarEvent.findMany({
      where: { userId, start: { gte: today, lt: tomorrow } },
      include: { project: true, category: true },
      orderBy: { start: "asc" },
    }),
    prisma.commitment.findMany({
      where: {
        userId,
        direction: "I_PROMISED",
        status: "OPEN",
        OR: [
          { dueDate: { lte: tomorrow } },
          { followUpDate: { lte: tomorrow } },
        ],
      },
      include: { person: true },
      orderBy: { dueDate: "asc" },
    }),
    ensureSettings(userId),
    prisma.category.count({ where: { userId } }),
    prisma.project.count({ where: { userId, kind: "CLASS" } }),
    prisma.calendarEvent.count({ where: { userId, kind: "SHIFT" } }),
  ]);
  return {
    tasks,
    buckets: todayTaskBuckets(tasks),
    events,
    commitments,
    settings,
    setupSignals: { areaCount, classCount, jobScheduleCount },
    today,
  };
}
export async function weekData(userId: string) {
  const settings = await ensureSettings(userId);
  const start = startOfWeek(
      new Date(),
      settings.timezone,
      settings.weekStartsOn,
    ),
    end = addDays(start, 7, settings.timezone);
  const [tasks, events, commitments] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        OR: [
          { plannedDate: { gte: start, lt: end } },
          { dueDate: { gte: start, lt: end } },
        ],
        status: { notIn: ["DONE", "CANCELED"] },
      },
      include: { project: true, category: true },
    }),
    prisma.calendarEvent.findMany({
      where: { userId, start: { gte: start, lt: end } },
      include: { project: true },
      orderBy: { start: "asc" },
    }),
    prisma.commitment.findMany({
      where: {
        userId,
        status: "OPEN",
        OR: [
          { dueDate: { gte: start, lt: end } },
          { followUpDate: { gte: start, lt: end } },
        ],
      },
      include: { person: true },
    }),
  ]);
  return { settings, start, end, tasks, events, commitments };
}
export async function projectsWithHealth(
  userId: string,
  status?: "ACTIVE" | "SOMEDAY",
) {
  const projects = await prisma.project.findMany({
    where: { userId, ...(status ? { status } : {}) },
    include: { category: true, goal: true, tasks: true },
    orderBy: { updatedAt: "desc" },
  });
  return projects.map((p) => ({
    ...p,
    noNextStep: projectHasNoNextStep(p, p.tasks),
  }));
}
export async function reviewData(userId: string) {
  const now = new Date(),
    weekAgo = addDays(startOfDay(now), -7),
    twoWeeks = addDays(startOfDay(now), 14);
  const [unfinished, upcoming, commitments, inbox, projects] =
    await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          status: { notIn: ["DONE", "CANCELED"] },
          OR: [
            { dueDate: { gte: weekAgo, lte: now } },
            { plannedDate: { gte: weekAgo, lte: now } },
          ],
        },
      }),
      prisma.task.findMany({
        where: {
          userId,
          status: { notIn: ["DONE", "CANCELED"] },
          dueDate: { gte: now, lte: twoWeeks },
        },
        include: { project: true },
      }),
      prisma.commitment.findMany({
        where: {
          userId,
          status: "OPEN",
          OR: [
            { dueDate: { lte: twoWeeks } },
            { followUpDate: { lte: twoWeeks } },
          ],
        },
        include: { person: true },
      }),
      prisma.task.count({ where: { userId, status: "INBOX" } }),
      projectsWithHealth(userId, "ACTIVE"),
    ]);
  return {
    unfinished,
    upcoming,
    commitments,
    inbox,
    stalled: projects.filter(
      (p) => p.noNextStep || p.updatedAt < addDays(now, -14),
    ),
  };
}
