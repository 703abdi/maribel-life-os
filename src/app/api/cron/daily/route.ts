import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextRecurrenceDate } from "@/modules/life";

export async function GET(request: NextRequest) {
  const token =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    request.nextUrl.searchParams.get("secret");
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const recurring = await prisma.task.findMany({
    where: {
      recurrence: { not: "NONE" },
      status: { notIn: ["DONE", "CANCELED"] },
    },
  });
  let generated = 0;
  for (const task of recurring) {
    const sourceDate = task.dueDate || task.plannedDate || task.createdAt;
    const next = nextRecurrenceDate(sourceDate, task);
    if (!next || next > new Date()) continue;
    const exists = await prisma.task.findFirst({
      where: {
        userId: task.userId,
        recurringFromId: task.recurringFromId || task.id,
        OR: [{ dueDate: next }, { plannedDate: next }],
      },
    });
    if (exists) continue;
    await prisma.task.create({
      data: {
        userId: task.userId,
        title: task.title,
        notes: task.notes,
        categoryId: task.categoryId,
        projectId: task.projectId,
        status: "TODO",
        effort: task.effort,
        priority: task.priority,
        dueDate: task.dueDate ? next : null,
        plannedDate: task.plannedDate ? next : null,
        estimateMinutes: task.estimateMinutes,
        recurrence: task.recurrence,
        recurrenceEvery: task.recurrenceEvery,
        recurrenceWeekdays: task.recurrenceWeekdays,
        kind: task.kind,
        recurringFromId: task.recurringFromId || task.id,
      },
    });
    generated++;
  }
  return NextResponse.json({ ok: true, generated });
}
