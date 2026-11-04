import Link from "next/link";
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
  project?: { id: string; title: string } | null;
  category?: { name: string } | null;
  waitingOnPerson?: { name: string } | null;
  followUpDate?: Date | null;
};
export function Capture({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action={quickCapture}
      className={`flex gap-2 ${compact ? "" : "rounded-xl border bg-white p-3 shadow-sm"}`}
    >
      <input
        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        name="text"
        placeholder="Capture a task, idea, note, or paste a link…"
        required
      />
      <select
        className="rounded-lg border px-2 text-xs"
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
}: {
  task: Task;
  showPlan?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 py-2 last:border-0">
      <form action={toggleTask}>
        <input type="hidden" name="id" value={task.id} />
        <button
          title="Toggle complete"
          className={`grid h-5 w-5 place-items-center rounded border ${task.status === "DONE" ? "border-teal-600 bg-teal-600 text-white" : "border-slate-400"}`}
        >
          {task.status === "DONE" ? "✓" : ""}
        </button>
      </form>
      <span
        className={`min-w-0 flex-1 text-sm ${task.status === "DONE" ? "text-slate-400 line-through" : "text-slate-800"}`}
      >
        {task.title}
      </span>
      {task.project && (
        <Link
          className="text-xs text-indigo-700"
          href={`/projects/${task.project.id}`}
        >
          {task.project.title}
        </Link>
      )}
      {task.category && <Badge>{task.category.name}</Badge>}
      {task.dueDate && <Badge tone="amber">due {fmtDay(task.dueDate)}</Badge>}
      {task.plannedDate && (
        <Badge tone="indigo">plan {fmtDay(task.plannedDate)}</Badge>
      )}
      {task.status === "WAITING" && (
        <Badge tone="teal">
          waiting{task.waitingOnPerson ? ": " + task.waitingOnPerson.name : ""}
        </Badge>
      )}
      {showPlan && (
        <form action={planTask}>
          <input type="hidden" name="id" value={task.id} />
          <input
            className="rounded border p-1 text-xs"
            name="plannedDate"
            type="date"
            defaultValue={task.plannedDate?.toISOString().slice(0, 10) ?? ""}
          />
          <button className="ml-1 text-xs text-indigo-700">Plan</button>
        </form>
      )}
    </div>
  );
}
export function TopThree({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-1">
      {tasks.length ? (
        tasks.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-lg bg-indigo-50 p-2"
          >
            <TaskRow task={t} />
            <form action={setTopPriority}>
              <input name="id" type="hidden" value={t.id} />
              <input name="on" type="hidden" value="false" />
              <button className="text-xs text-indigo-700">Unpick</button>
            </form>
          </div>
        ))
      ) : (
        <Empty>Pick up to three open tasks below to focus today.</Empty>
      )}
    </div>
  );
}
export function PickPriority({ task }: { task: Task }) {
  return (
    <form action={setTopPriority}>
      <input name="id" type="hidden" value={task.id} />
      <input name="on" type="hidden" value="true" />
      <button className="text-xs font-medium text-indigo-700">Top 3</button>
    </form>
  );
}
