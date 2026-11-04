import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectsWithHealth } from "@/modules/queries";
import { ideaScore } from "@/modules/life";
import { createProject } from "@/modules/actions";
import {
  Badge,
  Card,
  Empty,
  Page,
  PageHeader,
  btn,
  input,
  select,
} from "@/components/ui";
export default async function Projects({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const u = await requireUser(),
    sp = await searchParams,
    status = sp.status === "someday" ? "SOMEDAY" : undefined;
  const [items, areas, goals] = await Promise.all([
    projectsWithHealth(u.id, status),
    prisma.category.findMany({
      where: { userId: u.id, archived: false },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.goal.findMany({ where: { userId: u.id, status: "ACTIVE" } }),
  ]);
  if (status)
    return (
      <Page>
        <PageHeader
          title="Not now"
          sub="Ideas kept deliberately out of the active list."
          action={
            <Link className={btn.secondary} href="/projects">
              Active projects
            </Link>
          }
        />
        <Card title="Compare ideas">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)]">
                  <th>Idea</th>
                  <th>Value</th>
                  <th>Effort</th>
                  <th>Cost</th>
                  <th>Interest</th>
                  <th>Timing</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {[...items]
                  .sort((a, b) => ideaScore(b) - ideaScore(a))
                  .map((p) => (
                    <tr className="border-t" key={p.id}>
                      <td className="py-2">
                        <Link
                          href={`/projects/${p.id}`}
                          className="font-medium text-violet-200 hover:underline"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td>{p.valueScore ?? "—"}</td>
                      <td>{p.effortScore ?? "—"}</td>
                      <td>{p.costScore ?? "—"}</td>
                      <td>{p.interestScore ?? "—"}</td>
                      <td>{p.timingScore ?? "—"}</td>
                      <td>
                        <b>{ideaScore(p)}</b>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Page>
    );
  return (
    <Page>
      <PageHeader
        title="Projects"
        sub="Every active project needs one visible next step."
        action={
          <Link href="/projects?status=someday" className={btn.secondary}>
            Not now / compare
          </Link>
        }
      />
      <Card title="Add project">
        <form action={createProject} className="grid gap-2 md:grid-cols-4">
          <input
            className={input}
            name="title"
            placeholder="Project title"
            required
          />
          <select className={select} name="categoryId" required>
            <option value="">Category…</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select className={select} name="goalId">
            <option value="">Goal…</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <select className={select} name="kind">
            <option>GENERAL</option>
            <option>CLASS</option>
            <option>BUSINESS</option>
            <option>LEARNING</option>
            <option>JOB</option>
            <option>PERSONAL</option>
          </select>
          <input className={input} name="outcome" placeholder="Outcome" />
          <button className={btn.primary}>Create</button>
        </form>
      </Card>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.length ? (
          items.map((p) => (
            <Card key={p.id}>
              <div className="flex justify-between gap-2">
                <div>
                  <Link
                    className="font-semibold text-violet-200 hover:underline"
                    href={`/projects/${p.id}`}
                  >
                    {p.title}
                  </Link>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {p.category.name} · {p.kind}
                  </p>
                </div>
                {p.noNextStep && <Badge tone="red">No next step</Badge>}
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">
                {p.outcome || "No outcome written yet."}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {p.tasks.filter((t) => t.status === "DONE").length}/
                {p.tasks.length} tasks done
              </p>
            </Card>
          ))
        ) : (
          <Empty>Add an active project to begin.</Empty>
        )}
      </div>
    </Page>
  );
}
