import { addTaskStep, toggleTaskStep } from "@/modules/actions";
import { Badge, btn, Empty, input } from "@/components/ui";

type DetailTask = {
  id: string;
  title: string;
  notes: string;
  status: string;
  estimateMinutes: number;
  dueDate: Date | null;
  plannedDate: Date | null;
  steps: { id: string; title: string; done: boolean }[];
  blockedBy: { blocker: { title: string } }[];
};

export function TaskDetailPanel({ task }: { task: DetailTask }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-violet-300">
            Task detail
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {task.title}
          </h2>
        </div>
        <Badge tone={task.status === "DONE" ? "green" : "violet"}>
          {task.status}
        </Badge>
      </div>
      {task.notes && (
        <p className="mt-3 text-sm text-slate-300">{task.notes}</p>
      )}
      <p className="mt-3 text-xs text-slate-500">
        {task.estimateMinutes} min{" "}
        {task.dueDate ? "· due " + task.dueDate.toLocaleDateString() : ""}{" "}
        {task.plannedDate
          ? "· planned " + task.plannedDate.toLocaleDateString()
          : ""}
      </p>
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-white">Steps</h3>
        {task.steps.length ? (
          task.steps.map((step) => (
            <form
              action={toggleTaskStep}
              key={step.id}
              className="mt-2 flex items-center gap-2 text-sm text-slate-300"
            >
              <input name="id" type="hidden" value={step.id} />
              <button
                className={
                  step.done
                    ? "grid h-5 w-5 place-items-center rounded border border-emerald-400 bg-emerald-400 text-xs text-black"
                    : "h-5 w-5 rounded border border-slate-500"
                }
              >
                {step.done ? "✓" : ""}
              </button>
              <span className={step.done ? "line-through text-slate-500" : ""}>
                {step.title}
              </span>
            </form>
          ))
        ) : (
          <Empty>Break this task into its first small steps.</Empty>
        )}
        <form action={addTaskStep} className="mt-3 flex gap-2">
          <input name="taskId" type="hidden" value={task.id} />
          <input
            className={input}
            name="title"
            placeholder="Add a step"
            required
          />
          <button className={btn.secondary}>Add</button>
        </form>
      </div>
      {task.blockedBy.length > 0 && (
        <p className="mt-4 text-xs text-amber-200">
          Blocked by:{" "}
          {task.blockedBy
            .map((dependency) => dependency.blocker.title)
            .join(", ")}
        </p>
      )}
    </section>
  );
}
