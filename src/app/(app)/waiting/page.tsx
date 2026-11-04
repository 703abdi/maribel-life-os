import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskRow } from "@/components/LifeWidgets";
import { Badge, Card, Empty, Page, PageHeader } from "@/components/ui";
export default async function Waiting() {
  const u = await requireUser(),
    now = new Date();
  const [tasks, commitments] = await Promise.all([
    prisma.task.findMany({
      where: { userId: u.id, status: "WAITING" },
      include: { project: true, category: true, waitingOnPerson: true },
      orderBy: { updatedAt: "asc" },
    }),
    prisma.commitment.findMany({
      where: { userId: u.id, status: "OPEN" },
      include: { person: true },
      orderBy: { dueDate: "asc" },
    }),
  ]);
  const w = {
    tasks: tasks.filter((task) => task.status === "WAITING"),
    commitments: commitments.filter(
      (commitment) => commitment.direction === "THEY_PROMISED",
    ),
  };
  const groups = new Map<
    string,
    { name: string; tasks: typeof w.tasks; commitments: typeof w.commitments }
  >();
  for (const task of w.tasks) {
    const key = task.waitingOnPerson?.id || "unassigned";
    const group = groups.get(key) || {
      name: task.waitingOnPerson?.name || "No person set",
      tasks: [],
      commitments: [],
    };
    group.tasks.push(task);
    groups.set(key, group);
  }
  for (const commitment of w.commitments) {
    const key = commitment.person?.id || "unassigned";
    const group = groups.get(key) || {
      name: commitment.person?.name || "No person set",
      tasks: [],
      commitments: [],
    };
    group.commitments.push(commitment);
    groups.set(key, group);
  }
  return (
    <Page>
      <PageHeader
        title="Waiting on"
        sub="Follow up on what other people said they would do."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Grouped by person">
          {groups.size ? (
            [...groups.entries()].map(([id, group]) => (
              <div
                className="border-b border-[var(--border)] py-3 last:border-0"
                key={id}
              >
                <p className="font-semibold text-white">{group.name}</p>
                {group.commitments.map((commitment) => (
                  <p
                    className="mt-2 text-sm text-slate-300"
                    key={commitment.id}
                  >
                    {commitment.description}{" "}
                    {commitment.followUpDate && (
                      <Badge
                        tone={commitment.followUpDate < now ? "red" : "amber"}
                      >
                        follow up {commitment.followUpDate.toLocaleDateString()}
                      </Badge>
                    )}
                  </p>
                ))}
                {group.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            ))
          ) : (
            <Empty>Nothing waiting on someone else.</Empty>
          )}
        </Card>
        <Card title="What I said I would do" className="lg:col-span-2">
          {commitments.filter((c) => c.direction === "I_PROMISED").length ? (
            commitments
              .filter((c) => c.direction === "I_PROMISED")
              .map((c) => (
                <p key={c.id} className="border-b py-2 text-sm">
                  {c.description}{" "}
                  {c.dueDate && (
                    <Badge tone={c.dueDate < now ? "red" : "slate"}>
                      due {c.dueDate.toLocaleDateString()}
                    </Badge>
                  )}
                </p>
              ))
          ) : (
            <Empty>No open promises.</Empty>
          )}
        </Card>
      </div>
    </Page>
  );
}
