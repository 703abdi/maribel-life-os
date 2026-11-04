import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Empty, Page, PageHeader, Badge } from "@/components/ui";

export default async function CalendarPage() {
  const user = await requireUser();
  const events = await prisma.calendarEvent.findMany({
    where: { userId: user.id, start: { gte: new Date() } },
    include: { category: true, project: true, person: true },
    orderBy: { start: "asc" },
    take: 42,
  });
  return (
    <Page>
      <PageHeader
        title="Calendar"
        sub="Classes, shifts, plans, and time you have intentionally protected."
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {events.length ? (
          events.map((event) => (
            <Card key={event.id}>
              <p className="text-xs font-semibold text-violet-300">
                {event.start.toLocaleDateString()} ·{" "}
                {event.start.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-1 font-semibold text-white">{event.title}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {event.category && <Badge>{event.category.name}</Badge>}
                {event.project && (
                  <Badge tone="violet">{event.project.title}</Badge>
                )}
                {event.kind === "SHIFT" && <Badge tone="green">Shift</Badge>}
              </div>
              {event.location && (
                <p className="mt-2 text-xs text-slate-500">{event.location}</p>
              )}
            </Card>
          ))
        ) : (
          <Empty>
            No upcoming events yet. Add classes, shifts, or appointments as your
            schedule takes shape.
          </Empty>
        )}
      </div>
    </Page>
  );
}
