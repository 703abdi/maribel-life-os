import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskRow } from "@/components/LifeWidgets";
import { Card, Empty, Page, PageHeader, TextLink } from "@/components/ui";
export default async function AreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const u = await requireUser(),
    { id } = await params;
  const a = await prisma.category.findFirst({
    where: { id, userId: u.id },
    include: {
      projects: true,
      tasks: { include: { project: true, category: true } },
      events: true,
      notes: true,
    },
  });
  if (!a) notFound();
  return (
    <Page>
      <PageHeader
        title={a.name}
        sub="An area is one view over your shared records."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Projects">
          {a.projects.length ? (
            a.projects.map((p) => (
              <p className="border-b py-2 text-sm" key={p.id}>
                <TextLink href={`/projects/${p.id}`}>{p.title}</TextLink>
              </p>
            ))
          ) : (
            <Empty>No projects.</Empty>
          )}
        </Card>
        <Card title="Tasks">
          {a.tasks.length ? (
            a.tasks.map((t) => <TaskRow key={t.id} task={t} />)
          ) : (
            <Empty>No tasks.</Empty>
          )}
        </Card>
        <Card title="Events">
          {a.events.length ? (
            a.events.map((e) => (
              <p className="border-b py-2 text-sm" key={e.id}>
                {e.title} · {e.start.toLocaleString()}
              </p>
            ))
          ) : (
            <Empty>No events.</Empty>
          )}
        </Card>
        <Card title="Notes">
          {a.notes.length ? (
            a.notes.map((n) => (
              <p className="border-b py-2 text-sm" key={n.id}>
                {n.title}
              </p>
            ))
          ) : (
            <Empty>No notes.</Empty>
          )}
        </Card>
      </div>
    </Page>
  );
}
