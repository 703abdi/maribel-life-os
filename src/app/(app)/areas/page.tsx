import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Empty, Page, PageHeader } from "@/components/ui";
export default async function Areas() {
  const u = await requireUser(),
    areas = await prisma.category.findMany({
      where: { userId: u.id, archived: false },
      include: {
        _count: {
          select: { projects: true, tasks: true, events: true, notes: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  return (
    <Page>
      <PageHeader
        title="Areas"
        sub="The categories your one shared record system is organized around."
      />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {areas.length ? (
          areas.map((a) => (
            <Link href={`/areas/${a.id}`} key={a.id}>
              <Card>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: a.color }}
                  />
                  <b>{a.name}</b>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {a._count.projects} projects · {a._count.tasks} tasks ·{" "}
                  {a._count.events} events
                </p>
              </Card>
            </Link>
          ))
        ) : (
          <Empty>Create areas in Settings.</Empty>
        )}
      </div>
    </Page>
  );
}
