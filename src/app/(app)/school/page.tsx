import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Empty, Page, PageHeader } from "@/components/ui";
export default async function School() {
  const u = await requireUser();
  const classes = await prisma.project.findMany({
    where: { userId: u.id, kind: "CLASS" },
    include: { tasks: true, events: true, notes: true },
    orderBy: { title: "asc" },
  });
  return (
    <Page>
      <PageHeader
        title="School"
        sub="Classes, deadlines, study sessions, and course resources."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {classes.length ? (
          classes.map((c) => (
            <Card title={c.title} key={c.id}>
              <p className="text-xs text-slate-500">
                {c.courseCode || "Course"} {c.instructor && `· ${c.instructor}`}{" "}
                {c.scheduleText && `· ${c.scheduleText}`}
              </p>
              <p className="mt-3 text-sm font-medium">Assignments & exams</p>
              {c.tasks
                .filter(
                  (t) =>
                    ["ASSIGNMENT", "EXAM"].includes(t.kind) &&
                    t.status !== "DONE",
                )
                .map((t) => (
                  <p className="text-sm" key={t.id}>
                    • {t.title}
                  </p>
                )) || <Empty>None upcoming.</Empty>}
              <p className="mt-3 text-sm font-medium">Resources</p>
              {c.notes
                .filter((n) => n.kind === "RESOURCE")
                .map((n) => (
                  <p className="text-sm" key={n.id}>
                    • {n.title}
                  </p>
                ))}
            </Card>
          ))
        ) : (
          <Empty>Add class projects from Projects.</Empty>
        )}
      </div>
    </Page>
  );
}
