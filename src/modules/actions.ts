"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, hashPassword, verifyPassword } from "@/lib/auth";
import { bool, int, str } from "@/lib/form-data";
import { parseYmd, startOfDay } from "@/lib/dates";
import { nextRecurrenceDate } from "@/modules/life";
import { canClearSampleData } from "@/lib/sample-data";
import type { TaskStatus } from "@prisma/client";
const refresh = () =>
  [
    "/today",
    "/week",
    "/inbox",
    "/projects",
    "/waiting",
    "/school",
    "/job",
    "/learning",
    "/calendar",
    "/people",
    "/goals",
    "/review",
    "/money",
    "/experiments",
    "/settings",
  ].forEach((path) => revalidatePath(path));
const date = (fd: FormData, k: string) => {
  const s = str(fd, k);
  return s ? parseYmd(s) : null;
};
export async function quickCapture(fd: FormData) {
  const u = await requireUser(),
    text = str(fd, "text", 500),
    type = str(fd, "type");
  if (!text) return;
  const url = /^https?:\/\//i.test(text);
  if (type === "task")
    await prisma.task.create({
      data: { userId: u.id, title: text, status: "INBOX" },
    });
  else
    await prisma.note.create({
      data: {
        userId: u.id,
        title: url ? "Saved link" : text,
        url: url ? text : null,
        kind: url ? "RESOURCE" : type === "idea" ? "IDEA" : "NOTE",
      },
    });
  refresh();
}
export async function createTask(fd: FormData) {
  const u = await requireUser();
  const title = str(fd, "title", 300);
  if (!title) return;
  await prisma.task.create({
    data: {
      userId: u.id,
      title,
      notes: str(fd, "notes"),
      categoryId: str(fd, "categoryId") || null,
      projectId: str(fd, "projectId") || null,
      status: (str(fd, "status") || "TODO") as TaskStatus,
      priority: Math.min(4, Math.max(1, int(fd, "priority", 2))),
      dueDate: date(fd, "dueDate"),
      plannedDate: date(fd, "plannedDate"),
      estimateMinutes: int(fd, "estimateMinutes", 30),
      kind: (str(fd, "kind") || "TASK") as never,
    },
  });
  refresh();
}
export async function toggleTask(fd: FormData) {
  const u = await requireUser(),
    id = str(fd, "id");
  const task = await prisma.task.findFirst({ where: { id, userId: u.id } });
  if (!task) return;
  const done = task.status !== "DONE";
  await prisma.task.update({
    where: { id },
    data: {
      status: done ? "DONE" : "TODO",
      completedAt: done ? new Date() : null,
    },
  });
  if (done && task.recurrence !== "NONE") {
    const base = task.dueDate ?? task.plannedDate ?? new Date(),
      next = nextRecurrenceDate(base, task);
    if (next)
      await prisma.task.create({
        data: {
          userId: u.id,
          title: task.title,
          notes: task.notes,
          categoryId: task.categoryId,
          projectId: task.projectId,
          status: "TODO",
          priority: task.priority,
          dueDate: task.dueDate ? next : null,
          plannedDate: task.plannedDate ? next : null,
          estimateMinutes: task.estimateMinutes,
          recurrence: task.recurrence,
          recurrenceEvery: task.recurrenceEvery,
          recurrenceWeekdays: task.recurrenceWeekdays,
          kind: task.kind,
          recurringFromId: task.recurringFromId ?? task.id,
        },
      });
  }
  refresh();
}
export async function setTopPriority(fd: FormData) {
  const u = await requireUser(),
    id = str(fd, "id"),
    on = bool(fd, "on");
  if (on) {
    const alreadyChosen = await prisma.task.count({
      where: {
        userId: u.id,
        id: { not: id },
        status: { notIn: ["DONE", "CANCELED"] },
        topPriorityOn: startOfDay(),
      },
    });
    if (alreadyChosen >= 3) return;
  }
  await prisma.task.updateMany({
    where: { id, userId: u.id },
    data: { topPriorityOn: on ? startOfDay() : null },
  });
  refresh();
}
export async function planTask(fd: FormData) {
  const u = await requireUser();
  await prisma.task.updateMany({
    where: { id: str(fd, "id"), userId: u.id },
    data: { plannedDate: date(fd, "plannedDate") },
  });
  refresh();
}
export async function addTaskStep(fd: FormData) {
  const user = await requireUser();
  const taskId = str(fd, "taskId");
  const title = str(fd, "title", 300);
  if (!title) return;
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
    select: {
      id: true,
      steps: {
        select: { position: true },
        orderBy: { position: "desc" },
        take: 1,
      },
    },
  });
  if (!task) return;
  await prisma.taskStep.create({
    data: { taskId, title, position: (task.steps[0]?.position || 0) + 1 },
  });
  refresh();
}
export async function toggleTaskStep(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, "id");
  const step = await prisma.taskStep.findFirst({
    where: { id, task: { userId: user.id } },
  });
  if (!step) return;
  await prisma.taskStep.update({
    where: { id },
    data: { done: !step.done, doneAt: step.done ? null : new Date() },
  });
  refresh();
}
export async function triageNote(fd: FormData) {
  const u = await requireUser(),
    id = str(fd, "id"),
    toTask = bool(fd, "toTask");
  const note = await prisma.note.findFirst({ where: { id, userId: u.id } });
  if (!note) return;
  if (toTask)
    await prisma.task.create({
      data: {
        userId: u.id,
        title: note.title,
        notes: note.body,
        status: "TODO",
        categoryId: str(fd, "categoryId") || null,
        projectId: str(fd, "projectId") || null,
        dueDate: date(fd, "dueDate"),
        plannedDate: date(fd, "plannedDate"),
      },
    });
  await prisma.note.update({
    where: { id },
    data: {
      triagedAt: new Date(),
      categoryId: str(fd, "categoryId") || note.categoryId,
      projectId: str(fd, "projectId") || note.projectId,
    },
  });
  refresh();
}
export async function createProject(fd: FormData) {
  const u = await requireUser(),
    title = str(fd, "title"),
    categoryId = str(fd, "categoryId");
  if (!title || !categoryId) return;
  await prisma.project.create({
    data: {
      userId: u.id,
      title,
      categoryId,
      kind: (str(fd, "kind") || "GENERAL") as never,
      status: (str(fd, "status") || "ACTIVE") as never,
      outcome: str(fd, "outcome"),
      successDefinition: str(fd, "successDefinition"),
      goalId: str(fd, "goalId") || null,
      financialTarget: int(fd, "financialTarget", 0) || null,
      valueScore: int(fd, "valueScore", 0) || null,
      effortScore: int(fd, "effortScore", 0) || null,
      costScore: int(fd, "costScore", 0) || null,
      interestScore: int(fd, "interestScore", 0) || null,
      timingScore: int(fd, "timingScore", 0) || null,
    },
  });
  refresh();
}
export async function createMilestone(fd: FormData) {
  const u = await requireUser(),
    projectId = str(fd, "projectId");
  const p = await prisma.project.findFirst({
    where: { id: projectId, userId: u.id },
  });
  if (p && str(fd, "title"))
    await prisma.milestone.create({
      data: {
        projectId,
        title: str(fd, "title"),
        dueDate: date(fd, "dueDate"),
      },
    });
  refresh();
}
export async function createReview(fd: FormData) {
  const u = await requireUser();
  await prisma.weeklyReview.upsert({
    where: { userId_weekStart: { userId: u.id, weekStart: startOfDay() } },
    create: {
      userId: u.id,
      weekStart: startOfDay(),
      wentWell: str(fd, "wentWell"),
      didntGo: str(fd, "didntGo"),
      learned: str(fd, "learned"),
      nextWeekFocus: str(fd, "nextWeekFocus"),
      completedAt: new Date(),
    },
    update: {
      wentWell: str(fd, "wentWell"),
      didntGo: str(fd, "didntGo"),
      learned: str(fd, "learned"),
      nextWeekFocus: str(fd, "nextWeekFocus"),
      completedAt: new Date(),
    },
  });
  refresh();
}
export async function createMoneyItem(fd: FormData) {
  const u = await requireUser(),
    name = str(fd, "name");
  if (!name) return;
  await prisma.moneyItem.create({
    data: {
      userId: u.id,
      name,
      kind: (str(fd, "kind") || "BILL") as never,
      amountCents: Math.max(0, int(fd, "amountCents")),
      cadence: str(fd, "cadence") || "monthly",
      targetCents: int(fd, "targetCents") || null,
      savedCents: int(fd, "savedCents") || null,
      projectId: str(fd, "projectId") || null,
    },
  });
  refresh();
}
export async function createExperiment(fd: FormData) {
  const u = await requireUser(),
    hypothesis = str(fd, "hypothesis");
  if (!hypothesis) return;
  await prisma.experiment.create({
    data: {
      userId: u.id,
      hypothesis,
      budgetCents: Math.max(0, int(fd, "budgetCents")),
      deadline: date(fd, "deadline"),
      successMeasure: str(fd, "successMeasure"),
      projectId: str(fd, "projectId") || null,
    },
  });
  refresh();
}
export async function updateSettings(fd: FormData) {
  const u = await requireUser();
  await prisma.settings.upsert({
    where: { userId: u.id },
    create: {
      userId: u.id,
      timezone: str(fd, "timezone") || "America/New_York",
      weekStartsOn: int(fd, "weekStartsOn", 1),
      prioritizationMethod: (str(fd, "prioritizationMethod") ||
        "TOP3") as never,
      dailyCapacityHours: Number(str(fd, "dailyCapacityHours") || 6),
      weeklyAvailableHours: Number(str(fd, "weeklyAvailableHours") || 30),
    },
    update: {
      timezone: str(fd, "timezone") || "America/New_York",
      weekStartsOn: int(fd, "weekStartsOn", 1),
      prioritizationMethod: (str(fd, "prioritizationMethod") ||
        "TOP3") as never,
      dailyCapacityHours: Number(str(fd, "dailyCapacityHours") || 6),
      weeklyAvailableHours: Number(str(fd, "weeklyAvailableHours") || 30),
      setupAreasDone: bool(fd, "setupAreasDone"),
      setupClassesDone: bool(fd, "setupClassesDone"),
      setupJobDone: bool(fd, "setupJobDone"),
      setupTimezoneDone: bool(fd, "setupTimezoneDone"),
      setupPrioritiesDone: bool(fd, "setupPrioritiesDone"),
      setupRemindersDone: bool(fd, "setupRemindersDone"),
    },
  });
  refresh();
}
export async function createArea(fd: FormData) {
  const u = await requireUser(),
    name = str(fd, "name");
  if (name)
    await prisma.category.create({
      data: {
        userId: u.id,
        name,
        kind: (str(fd, "kind") || "GENERAL") as never,
        color: str(fd, "color") || "#4f46e5",
        icon: str(fd, "icon") || "circle",
        sortOrder: int(fd, "sortOrder"),
      },
    });
  refresh();
}
export async function updateArea(fd: FormData) {
  const u = await requireUser();
  await prisma.category.updateMany({
    where: { id: str(fd, "id"), userId: u.id },
    data: {
      name: str(fd, "name"),
      color: str(fd, "color"),
      sortOrder: int(fd, "sortOrder"),
      archived: bool(fd, "archived"),
    },
  });
  refresh();
}
export async function clearSampleData(fd: FormData) {
  if (!canClearSampleData(str(fd, "confirmation")))
    throw new Error("Confirmation did not match.");
  const u = await requireUser();
  const where = { userId: u.id, isSample: true };
  await prisma.$transaction([
    prisma.weeklyReview.deleteMany({ where }),
    prisma.experiment.deleteMany({ where }),
    prisma.moneyItem.deleteMany({ where }),
    prisma.note.deleteMany({ where }),
    prisma.commitment.deleteMany({ where }),
    prisma.calendarEvent.deleteMany({ where }),
    prisma.task.deleteMany({ where }),
    prisma.milestone.deleteMany({ where: { isSample: true } }),
    prisma.project.deleteMany({ where }),
    prisma.goal.deleteMany({ where }),
    prisma.person.deleteMany({ where }),
    prisma.category.deleteMany({ where }),
  ]);
  refresh();
}
export async function changeOwnPassword(fd: FormData) {
  const u = await requireUser(),
    current = str(fd, "currentPassword"),
    next = str(fd, "password");
  if (next.length < 8) throw new Error("Use at least 8 characters.");
  const account = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
  if (!(await verifyPassword(current, account.passwordHash)))
    throw new Error("Current password is incorrect.");
  await prisma.user.update({
    where: { id: u.id },
    data: {
      passwordHash: await hashPassword(next),
      sessionVersion: { increment: 1 },
    },
  });
}
