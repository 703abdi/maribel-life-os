import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Empty, Page, PageHeader } from "@/components/ui";
import { TaskRow } from "@/components/LifeWidgets";

export default async function LearningPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { userId: user.id, kind: "LEARNING" },
    include: {
      tasks: {
        include: { category: true, project: true },
        orderBy: { plannedDate: "asc" },
      },
      notes: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <Page>
      <PageHeader
        title="Learning"
        sub="Skills, practice, and resources that compound over time."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {projects.length ? (
          projects.map((project) => (
            <Card key={project.id} title={project.title}>
              <p className="text-sm text-slate-300">
                {project.outcome ||
                  "Set the outcome you want this learning project to produce."}
              </p>
              <div className="mt-3">
                {project.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Resources · {project.notes.length}
              </p>
            </Card>
          ))
        ) : (
          <Empty>Create a Learning project to give a skill a home.</Empty>
        )}
      </div>
    </Page>
  );
}
