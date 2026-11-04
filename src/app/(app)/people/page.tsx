import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, Empty, Page, PageHeader } from "@/components/ui";

export default async function PeoplePage() {
  const user = await requireUser();
  const people = await prisma.person.findMany({
    where: { userId: user.id },
    include: {
      commitments: { where: { status: "OPEN" } },
      waitingTasks: { where: { status: "WAITING" } },
    },
    orderBy: { name: "asc" },
  });
  return (
    <Page>
      <PageHeader
        title="People & commitments"
        sub="Keep promises visible and follow up without carrying every open loop in your head."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {people.length ? (
          people.map((person) => (
            <Card key={person.id} title={person.name}>
              <p className="text-xs text-[var(--muted)]">
                {person.relationship || "Person"}
              </p>
              {person.commitments.map((commitment) => (
                <p
                  className="mt-3 text-sm text-[var(--foreground)]"
                  key={commitment.id}
                >
                  {commitment.description}
                  <br />
                  {commitment.followUpDate && (
                    <Badge tone="amber">
                      follow up {commitment.followUpDate.toLocaleDateString()}
                    </Badge>
                  )}
                </p>
              ))}
              {person.waitingTasks.map((task) => (
                <p
                  className="mt-3 text-sm text-[var(--foreground)]"
                  key={task.id}
                >
                  Waiting: {task.title}
                </p>
              ))}
              {!person.commitments.length && !person.waitingTasks.length && (
                <Empty>No open loops with this person.</Empty>
              )}
            </Card>
          ))
        ) : (
          <Empty>Add people as commitments or waiting tasks arise.</Empty>
        )}
      </div>
    </Page>
  );
}
