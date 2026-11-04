import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createExperiment } from "@/modules/actions";
import {
  Card,
  Empty,
  Page,
  PageHeader,
  btn,
  input,
  select,
} from "@/components/ui";
export default async function Experiments() {
  const u = await requireUser(),
    [items, projects] = await Promise.all([
      prisma.experiment.findMany({
        where: { userId: u.id },
        include: { project: true },
        orderBy: { deadline: "asc" },
      }),
      prisma.project.findMany({
        where: { userId: u.id, status: "ACTIVE" },
        orderBy: { title: "asc" },
      }),
    ]);
  return (
    <Page>
      <PageHeader
        title="Experiments"
        sub="Small bets with a hypothesis, budget, deadline, and success measure."
      />
      <Card title="Add experiment">
        <form action={createExperiment} className="grid gap-2 md:grid-cols-3">
          <input
            className={input}
            name="hypothesis"
            placeholder="If we…, then…"
            required
          />
          <input
            className={input}
            name="budgetCents"
            type="number"
            min="0"
            placeholder="Budget in cents"
          />
          <input className={input} name="deadline" type="date" />
          <input
            className={input}
            name="successMeasure"
            placeholder="Success measure"
          />
          <select className={select} name="projectId">
            <option value="">Project (optional)</option>
            {projects.map((p) => (
              <option value={p.id} key={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <button className={btn.primary}>Add</button>
        </form>
      </Card>
      <Card title="Experiment log" className="mt-4">
        {items.length ? (
          items.map((e) => (
            <div className="border-b py-3 text-sm" key={e.id}>
              <p className="font-medium">{e.hypothesis}</p>
              <p className="text-slate-500">
                {e.project?.title} · ${(e.budgetCents / 100).toFixed(2)} ·{" "}
                {e.status}
              </p>
              <p className="text-xs">
                Measure: {e.successMeasure || "Not set"}
              </p>
              {e.result && <p className="text-xs">Result: {e.result}</p>}
            </div>
          ))
        ) : (
          <Empty>Run a small, measurable experiment.</Empty>
        )}
      </Card>
    </Page>
  );
}
