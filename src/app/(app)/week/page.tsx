import { requireUser } from "@/lib/auth";
import { weekData } from "@/modules/queries";
import { addDays, fmtDay } from "@/lib/dates";
import { capacityLoad } from "@/modules/life";
import { Card, Page, PageHeader, Badge, Empty } from "@/components/ui";
import { TaskRow } from "@/components/LifeWidgets";
export default async function Week() {
  const u = await requireUser(),
    d = await weekData(u.id);
  const days = Array.from({ length: 7 }, (_, i) =>
    addDays(d.start, i, d.settings.timezone),
  );
  const plannedHours = d.tasks.reduce(
    (total, task) => total + (task.plannedDate ? task.estimateMinutes / 60 : 0),
    0,
  );
  const eventHours = d.events.reduce(
    (total, event) =>
      total + (event.end.getTime() - event.start.getTime()) / 3_600_000,
    0,
  );
  const weeklyLoad = plannedHours + eventHours;
  return (
    <Page>
      <PageHeader title="Week" sub="Deadlines, plan, and available capacity" />
      <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
        Weekly load <b className="text-white">{weeklyLoad.toFixed(1)}h</b> /{" "}
        {d.settings.weeklyAvailableHours}h available
        {weeklyLoad > d.settings.weeklyAvailableHours && (
          <Badge tone="red">Over capacity</Badge>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10),
            tasks = d.tasks.filter((t) =>
              [t.dueDate, t.plannedDate].some(
                (x) => x?.toISOString().slice(0, 10) === key,
              ),
            ),
            events = d.events.filter(
              (e) => e.start.toISOString().slice(0, 10) === key,
            ),
            commitments = d.commitments.filter((c) =>
              [c.dueDate, c.followUpDate].some(
                (x) => x?.toISOString().slice(0, 10) === key,
              ),
            ),
            hours = events.reduce(
              (n, e) => n + (e.end.getTime() - e.start.getTime()) / 3600000,
              0,
            ),
            load = capacityLoad(
              tasks.filter(
                (t) => t.plannedDate?.toISOString().slice(0, 10) === key,
              ),
              hours,
            ),
            over = load > d.settings.dailyCapacityHours;
          return (
            <Card key={key} title={fmtDay(day)}>
              <div className="mb-2 text-xs">
                Load <b>{load.toFixed(1)}h</b> / {d.settings.dailyCapacityHours}
                h {over && <Badge tone="red">Over capacity</Badge>}
              </div>
              {events.map((e) => (
                <p className="border-b py-1 text-xs" key={e.id}>
                  ◷ {e.title}
                </p>
              ))}
              {tasks.map((t) => (
                <TaskRow key={t.id} task={t} showPlan />
              ))}
              {commitments.map((c) => (
                <p className="border-b py-1 text-xs" key={c.id}>
                  Promise: {c.description}
                </p>
              ))}
              {!events.length && !tasks.length && !commitments.length && (
                <Empty>Open space.</Empty>
              )}
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
