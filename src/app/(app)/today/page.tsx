import Link from "next/link";
import type { Category, Project, Task } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { todayData } from "@/modules/queries";
import { TaskRow, TopThree } from "@/components/LifeWidgets";
import { QuickAddBar } from "@/components/tasks/QuickAddBar";
import { Badge, Card, Empty, Page, PageHeader } from "@/components/ui";
import { fmtDay, fmtTime } from "@/lib/dates";
import { setupChecklist } from "@/lib/setup-checklist";
export default async function Today() {
  const u = await requireUser(),
    d = await todayData(u.id);
  const chosen = d.tasks.filter(
    (t) => t.topPriorityOn && !["DONE", "CANCELED"].includes(t.status),
  );
  const top = chosen.slice(0, 3);
  const checklist = setupChecklist(d.settings, d.setupSignals);
  const completeSetupItems = checklist.filter((item) => item.done).length;
  const candidates = d.tasks
    .filter(
      (t) =>
        !["DONE", "CANCELED"].includes(t.status) &&
        !chosen.some((chosenTask) => chosenTask.id === t.id),
    )
    .slice(0, 8);
  return (
    <Page>
      <PageHeader title="Today" sub={fmtDay(d.today)} />
      <QuickAddBar />
      {!checklist.every((item) => item.done) && (
        <Card title="First-run setup" className="mt-4">
          <p className="text-sm text-[var(--muted)]">
            Make this dashboard yours: categories, classes, job schedule,
            timezone and capacity, priorities, reminders.
          </p>
          <ul className="mt-3 grid gap-1 text-sm text-[var(--muted)]">
            {checklist.map((item) => (
              <li key={item.key}>
                <span
                  aria-hidden="true"
                  className={
                    item.done ? "text-emerald-300" : "text-[var(--muted)]"
                  }
                >
                  {item.done ? "✓" : "○"}
                </span>{" "}
                {item.label}
              </li>
            ))}
          </ul>
          <Link
            href="/settings"
            className="mt-3 inline-block text-sm font-semibold text-violet-200 hover:text-white hover:underline"
          >
            Finish setup ({completeSetupItems}/{checklist.length})
          </Link>
        </Card>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Top 3 priorities">
          <TopThree tasks={top} candidates={candidates} />
        </Card>
        <Card title="Today's events">
          {d.events.length ? (
            d.events.map((e) => (
              <div key={e.id} className="border-b py-2 text-sm last:border-0">
                <b>{fmtTime(e.start)}</b> · {e.title}{" "}
                {e.location && (
                  <span className="text-[var(--muted)]">· {e.location}</span>
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
                  <span className="text-[var(--muted)]">· {c.person.name}</span>
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
