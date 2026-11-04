import type { Project, Task } from "@prisma/client";
import { addDays, startOfDay } from "@/lib/dates";

export type Recurrence = {
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "EVERY_N_DAYS";
  recurrenceEvery?: number | null;
  recurrenceWeekdays?: number[];
};
export function nextRecurrenceDate(from: Date, rule: Recurrence): Date | null {
  if (rule.recurrence === "NONE") return null;
  if (rule.recurrence === "DAILY") return addDays(from, 1);
  if (rule.recurrence === "EVERY_N_DAYS")
    return addDays(from, Math.max(1, rule.recurrenceEvery ?? 1));
  if (rule.recurrence === "MONTHLY") {
    const d = new Date(from);
    d.setUTCMonth(d.getUTCMonth() + 1);
    return d;
  }
  const wants = rule.recurrenceWeekdays?.length
    ? rule.recurrenceWeekdays
    : [new Date(from).getUTCDay()];
  let d = addDays(from, 1);
  for (let i = 0; i < 7; i++, d = addDays(d, 1))
    if (wants.includes(d.getUTCDay())) return d;
  return d;
}
export function projectHasNoNextStep(
  project: Pick<Project, "status">,
  tasks: Pick<Task, "status" | "parentTaskId">[],
) {
  return (
    project.status === "ACTIVE" &&
    !tasks.some(
      (t) => !t.parentTaskId && ["TODO", "DOING", "WAITING"].includes(t.status),
    )
  );
}
export function ideaScore(
  p: Pick<
    Project,
    "valueScore" | "effortScore" | "costScore" | "interestScore" | "timingScore"
  >,
) {
  return (
    (p.valueScore ?? 0) +
    (p.interestScore ?? 0) +
    (p.timingScore ?? 0) -
    (p.effortScore ?? 0) -
    (p.costScore ?? 0)
  );
}
export function capacityLoad(
  tasks: Pick<Task, "estimateMinutes">[],
  eventHours: number,
) {
  return tasks.reduce((n, t) => n + t.estimateMinutes, 0) / 60 + eventHours;
}
export function todayTaskBuckets<
  T extends Pick<Task, "id" | "status" | "dueDate" | "plannedDate">,
>(tasks: T[], date = new Date()) {
  const today = startOfDay(date),
    tomorrow = addDays(today, 1);
  const open = tasks.filter((t) => !["DONE", "CANCELED"].includes(t.status));
  const overdue = open.filter((t) => t.dueDate && t.dueDate < today);
  const due = open.filter(
    (t) => t.dueDate && t.dueDate >= today && t.dueDate < tomorrow,
  );
  const used = new Set([...overdue, ...due].map((t) => t.id));
  const planned = open.filter(
    (t) =>
      !used.has(t.id) &&
      t.plannedDate &&
      t.plannedDate >= today &&
      t.plannedDate < tomorrow,
  );
  return { overdue, due, planned };
}
export function waitingItems<
  T extends { status: string },
  C extends { direction: string; status: string },
>(tasks: T[], commitments: C[]) {
  return {
    tasks: tasks.filter((t) => t.status === "WAITING"),
    commitments: commitments.filter(
      (c) => c.direction === "THEY_PROMISED" && c.status === "OPEN",
    ),
  };
}
