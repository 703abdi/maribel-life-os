import Link from "next/link";
import type { Category, Project, Task } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { todayData } from "@/modules/queries";
import { PickPriority, TaskRow, TopThree } from "@/components/LifeWidgets";
import { QuickAddBar } from "@/components/tasks/QuickAddBar";
import { Badge, Card, Empty, Page, PageHeader } from "@/components/ui";
import { fmtDay, fmtTime } from "@/lib/dates";
export default async function Today() {
  const u = await requireUser(),
    d = await todayData(u.id);
  const top = d.tasks
    .filter((t) => t.topPriorityOn && t.status !== "DONE")
    .slice(0, 3);
  const checklist = [
    d.settings.setupAreasDone,
    d.settings.setupClassesDone,
    d.settings.setupJobDone,
    d.settings.setupTimezoneDone,
    d.settings.setupPrioritiesDone,
    d.settings.setupRemindersDone,
  ];
  return (
    <Page>
      <PageHeader title="Today" sub={fmtDay(d.today)} />
      <QuickAddBar />
      {checklist.some((x) => !x) && (
        <Card title="First-run setup" className="mt-4">
          <p className="text-sm text-slate-600">
            Make this dashboard yours: categories, classes, job schedule,
            timezone and capacity, priorities, reminders.
          </p>
          <Link
            href="/settings"
            className="mt-2 inline-block text-sm font-medium text-indigo-700"
          >
            Finish setup ({checklist.filter(Boolean).length}/6)
          </Link>
        </Card>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Top 3 priorities">
          <TopThree tasks={top} />
          {d.tasks
            .filter(
              (t) =>
                !["DONE", "CANCELED"].includes(t.status) &&
                !top.some((x) => x.id === t.id),
            )
            .slice(0, 8)
            .map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <TaskRow task={t} />
                </div>
                <PickPriority task={t} />
              </div>
            ))}
        </Card>
        <Card title="Today's events">
          {d.events.length ? (
            d.events.map((e) => (
              <div key={e.id} className="border-b py-2 text-sm last:border-0">
                <b>{fmtTime(e.start)}</b> · {e.title}{" "}
                {e.location && (
                  <span className="text-slate-500">· {e.location}</span>
                )}
                <Badge tone="teal">{e.kind.replace("_", " ")}</Badge>
              </div>
            ))
          ) : (
            <Empty>No events today.</Empty>
          )}
        </Card>
        <Card title="Overdue">
          <TaskList tasks={d.buckets.overdue} empty="Nothing overdue." />
        </Card>
        <Card title="Due today">
          <TaskList tasks={d.buckets.due} empty="Nothing due today." />
        </Card>
        <Card title="Planned today">
          <TaskList tasks={d.buckets.planned} empty="Nothing planned today." />
        </Card>
        <Card title="Promises due soon">
          {d.commitments.length ? (
            d.commitments.map((c) => (
              <div key={c.id} className="border-b py-2 text-sm last:border-0">
                {c.description}{" "}
                {c.person && (
                  <span className="text-slate-500">· {c.person.name}</span>
                )}{" "}
                {c.dueDate && (
                  <Badge tone={c.dueDate < d.today ? "red" : "amber"}>
                    due {fmtDay(c.dueDate)}
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <Empty>No promises needing attention.</Empty>
          )}
        </Card>
      </div>
    </Page>
  );
}
type TodayTask = Task & { project: Project | null; category: Category | null };
function TaskList({ tasks, empty }: { tasks: TodayTask[]; empty: string }) {
  return tasks.length ? (
    <>
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </>
  ) : (
    <Empty>{empty}</Empty>
  );
}
