import { quickCapture } from "@/modules/actions";
import { btn } from "@/components/ui";

export function QuickAddBar() {
  return (
    <form
      action={quickCapture}
      className="flex gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3"
    >
      <input
        className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-600"
        name="text"
        placeholder="Capture a task, note, idea, or link…"
        required
      />
      <select
        className="rounded-lg border border-[var(--border)] bg-[#0d1017] px-2 text-xs text-slate-200"
        name="type"
        defaultValue="task"
      >
        <option value="task">Task</option>
        <option value="note">Note</option>
        <option value="idea">Idea</option>
      </select>
      <button className={btn.primary}>Add</button>
    </form>
  );
}
