import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskRow } from "@/components/LifeWidgets";
import { QuickAddBar } from "@/components/tasks/QuickAddBar";
import { Card, Empty, Page, PageHeader, btn, select } from "@/components/ui";
import { triageNote } from "@/modules/actions";
export default async function Inbox() {
  const u = await requireUser();
  const [tasks, notes, areas, projects] = await Promise.all([
    prisma.task.findMany({
      where: { userId: u.id, status: "INBOX" },
      include: { category: true, project: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.note.findMany({
      where: {
        userId: u.id,
        triagedAt: null,
        categoryId: null,
        projectId: null,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { userId: u.id, archived: false },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.project.findMany({
      where: { userId: u.id, status: "ACTIVE" },
      orderBy: { title: "asc" },
    }),
  ]);
  return (
    <Page>
      <PageHeader
        title="Inbox"
        sub="Capture first. Decide the right home when you are ready."
      />
      <QuickAddBar />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title={`Untriaged tasks (${tasks.length})`}>
          {tasks.length ? (
            tasks.map((t) => <TaskRow key={t.id} task={t} />)
          ) : (
            <Empty>Task inbox is clear.</Empty>
          )}
        </Card>
        <Card title={`Notes, ideas & links (${notes.length})`}>
          {notes.length ? (
            notes.map((n) => (
              <form
                action={triageNote}
                key={n.id}
                className="border-b py-3 last:border-0"
              >
                <input name="id" type="hidden" value={n.id} />
                <p className="text-sm font-medium">{n.title}</p>
                {n.url && (
                  <a className="text-xs text-indigo-700" href={n.url}>
                    {n.url}
                  </a>
                )}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select className={select} name="categoryId">
                    <option value="">Category…</option>
                    {areas.map((a) => (
                      <option value={a.id} key={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <select className={select} name="projectId">
                    <option value="">Project…</option>
                    {projects.map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <input className={select} name="dueDate" type="date" />
                  <input className={select} name="plannedDate" type="date" />
                </div>
                <label className="mt-2 block text-xs">
                  <input className="mr-1" name="toTask" type="checkbox" />
                  Convert to task
                </label>
                <button className={`${btn.secondary} mt-2`}>Triage</button>
              </form>
            ))
          ) : (
            <Empty>Notes inbox is clear.</Empty>
          )}
        </Card>
      </div>
    </Page>
  );
}
