import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMilestone, createTask } from "@/modules/actions";
import { TaskRow } from "@/components/LifeWidgets";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import {
  Badge,
  Card,
  Empty,
  Page,
  PageHeader,
  btn,
  input,
} from "@/components/ui";
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const u = await requireUser(),
    { id } = await params;
  const p = await prisma.project.findFirst({
    where: { id, userId: u.id },
    include: {
      category: true,
      goal: true,
      milestones: { orderBy: { dueDate: "asc" } },
      tasks: {
        include: {
          project: true,
          category: true,
          steps: { orderBy: { position: "asc" } },
          blockedBy: { include: { blocker: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      notes: true,
      commitments: { include: { person: true } },
      experiments: true,
      moneyItems: true,
    },
  });
  if (!p) notFound();
  return (
    <Page>
      <PageHeader title={p.title} sub={`${p.category.name} · ${p.kind}`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Outcome & direction">
          <p className="text-sm">{p.outcome || "No outcome yet."}</p>
          <p className="mt-2 text-sm text-slate-600">
            {p.successDefinition || "No success definition yet."}
          </p>
          {p.goal && <Badge tone="indigo">Goal: {p.goal.title}</Badge>}{" "}
          {p.financialTarget && (
            <Badge tone="teal">
              Target ${(p.financialTarget / 100).toLocaleString()}
            </Badge>
          )}
        </Card>
        <Card title="Milestones">
          {p.milestones.map((m) => (
            <p key={m.id} className="border-b py-2 text-sm">
              {m.done ? "✓" : "○"} {m.title}{" "}
              {m.dueDate && (
                <span className="text-slate-500">
                  · {m.dueDate.toLocaleDateString()}
                </span>
              )}
            </p>
          ))}
          <form action={createMilestone} className="mt-3 flex gap-2">
            <input type="hidden" name="projectId" value={p.id} />
            <input
              className={input}
              name="title"
              placeholder="Milestone"
              required
            />
            <input className={input} type="date" name="dueDate" />
            <button className={btn.secondary}>Add</button>
          </form>
        </Card>
        <Card title="Tasks & subtasks">
          {p.tasks.length ? (
            p.tasks
              .filter((t) => !t.parentTaskId)
              .map((t) => <TaskRow key={t.id} task={t} />)
          ) : (
            <Empty>No next step yet.</Empty>
          )}
          <form action={createTask} className="mt-3 flex gap-2">
            <input type="hidden" name="projectId" value={p.id} />
            <input
              className={input}
              name="title"
              placeholder="Set next action"
              required
            />
            <button className={btn.primary}>Add task</button>
          </form>
        </Card>
        {p.tasks[0] && <TaskDetailPanel task={p.tasks[0]} />}
        <Card title="Notes & resources">
          {p.notes.length ? (
            p.notes.map((n) => (
              <p className="border-b py-2 text-sm" key={n.id}>
                {n.url ? (
                  <a className="text-indigo-700" href={n.url}>
                    {n.title}
                  </a>
                ) : (
                  n.title
                )}
              </p>
            ))
          ) : (
            <Empty>No linked notes or resources.</Empty>
          )}
        </Card>
        <Card title="Commitments">
          {p.commitments.length ? (
            p.commitments.map((c) => (
              <p className="border-b py-2 text-sm" key={c.id}>
                {c.description} {c.person && `· ${c.person.name}`}
              </p>
            ))
          ) : (
            <Empty>No commitments.</Empty>
          )}
        </Card>
        <Card title="Experiments & money">
          {p.experiments.map((x) => (
            <p key={x.id} className="text-sm">
              {x.hypothesis} · {x.status}
            </p>
          ))}
          {p.moneyItems.map((x) => (
            <p key={x.id} className="text-sm">
              {x.name}: ${(x.amountCents / 100).toFixed(2)}
            </p>
          ))}
          {!p.experiments.length && !p.moneyItems.length && (
            <Empty>No experiments or targets.</Empty>
          )}
        </Card>
      </div>
    </Page>
  );
}
