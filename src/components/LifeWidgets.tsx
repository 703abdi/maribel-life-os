import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, Empty, btn } from "@/components/ui";
import {
  quickCapture,
  setTopPriority,
  toggleTask,
  planTask,
} from "@/modules/actions";
import { fmtDay } from "@/lib/dates";
type Task = {
  id: string;
  title: string;
  status: string;
  priority: number;
  dueDate: Date | null;
  plannedDate: Date | null;
  topPriorityOn: Date | null;
  estimateMinutes: number;
  project?: { id: string; title: string } | null;
  category?: { name: string; color?: string } | null;
  waitingOnPerson?: { name: string } | null;
  followUpDate?: Date | null;
};
export function Capture({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action={quickCapture}
      className={`flex gap-2 ${compact ? "" : "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm"}`}
    >
      <input
        className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[#0d1017] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
        name="text"
        placeholder="Capture a task, idea, note, or paste a link…"
        required
      />
      <select
        className="rounded-lg border border-[var(--border)] bg-[#0d1017] px-2 text-xs text-[var(--foreground)]"
        name="type"
        defaultValue="task"
      >
        <option value="task">Task</option>
        <option value="idea">Idea</option>
        <option value="note">Note</option>
      </select>
      <button className={btn.primary}>Add</button>
    </form>
  );
}
export function TaskRow({
  task,
  showPlan = false,
  action,
}: {
  task: Task;
  showPlan?: boolean;
  action?: ReactNode;
}) {
  const complete = task.status === "DONE";
  return (
    <div className="border-b border-[var(--border)] py-3 last:border-0">
      <div className="flex items-start gap-3">
        <form action={toggleTask} className="pt-0.5">
          <input type="hidden" name="id" value={task.id} />
          <button
            aria-label={
              complete ? "Mark task incomplete" : "Mark task complete"
            }
            title={complete ? "Mark incomplete" : "Mark complete"}
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-xs transition-colors ${complete ? "border-emerald-400 bg-emerald-400 text-[#0b0d12]" : "border-[var(--muted)] hover:border-violet-300"}`}
          >
            {complete ? "✓" : ""}
          </button>
        </form>
        <div className="min-w-0 flex-1">
          <p
            className={`break-words text-sm font-semibold ${complete ? "text-[var(--muted)] line-through" : "text-[var(--foreground)]"}`}
          >
            {task.title}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {task.category && <Badge>{task.category.name}</Badge>}
            {task.project && (
              <Link
                className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[11px] font-semibold text-violet-200 hover:bg-violet-500/25"
                href={`/projects/${task.project.id}`}
              >
                {task.project.title}
              </Link>
            )}
            {task.dueDate && (
              <Badge tone="amber">Due {fmtDay(task.dueDate)}</Badge>
            )}
            {task.plannedDate && (
              <Badge tone="indigo">Plan {fmtDay(task.plannedDate)}</Badge>
            )}
            <Badge tone="slate">{task.estimateMinutes} min</Badge>
            {task.status === "WAITING" && (
              <Badge tone="teal">
                Waiting
                {task.waitingOnPerson ? ": " + task.waitingOnPerson.name : ""}
              </Badge>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {showPlan && (
        <form
          action={planTask}
          className="ml-8 mt-2 flex flex-wrap items-end gap-2"
        >
          <input type="hidden" name="id" value={task.id} />
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--muted)]">
            Plan date
            <input
              aria-label="Plan date"
              className="h-8 rounded-lg border border-[var(--border)] bg-[#0d1017] px-2 text-xs text-[var(--foreground)]"
              name="plannedDate"
              type="date"
              defaultValue={task.plannedDate?.toISOString().slice(0, 10) ?? ""}
            />
          </label>
          <button className="rounded-lg border border-[var(--border)] bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-violet-200 hover:bg-white/10">
            Plan
          </button>
        </form>
      )}
    </div>
  );
}
export function TopThree({
  tasks,
  candidates,
}: {
  tasks: Task[];
  candidates: Task[];
}) {
  return (
    <div className="space-y-3">
      {tasks.length ? (
        tasks.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-[var(--border)] px-3"
          >
            <TaskRow
              task={t}
              action={
                <form action={setTopPriority}>
                  <input name="id" type="hidden" value={t.id} />
                  <input name="on" type="hidden" value="false" />
                  <button className="text-xs font-medium text-violet-200 hover:text-white">
                    Unpick
                  </button>
                </form>
              }
            />
          </div>
        ))
      ) : (
        <Empty>Choose up to three open tasks to focus on today.</Empty>
      )}
      <details className="rounded-xl border border-[var(--border)] bg-black/10 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
          Choose today&apos;s top 3
        </summary>
        <div className="mt-3 space-y-2">
          {candidates.length ? (
            candidates.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-[var(--border)] px-3"
              >
                <TaskRow task={task} action={<PickPriority task={task} />} />
              </div>
            ))
          ) : (
            <Empty>
              All available tasks are already in today&apos;s Top 3.
            </Empty>
          )}
        </div>
      </details>
    </div>
  );
}
export function PickPriority({ task }: { task: Task }) {
  return (
    <form action={setTopPriority}>
      <input name="id" type="hidden" value={task.id} />
      <input name="on" type="hidden" value="true" />
      <button className="rounded-lg border border-violet-400/40 bg-violet-500/15 px-2 py-1 text-xs font-semibold text-violet-100 hover:bg-violet-500/25">
        Top 3
      </button>
    </form>
  );
}
