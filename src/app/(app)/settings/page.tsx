import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  clearSampleData,
  createArea,
  updateArea,
  updateSettings,
} from "@/modules/actions";
import {
  Card,
  Page,
  PageHeader,
  btn,
  input,
  label,
  select,
} from "@/components/ui";
export default async function Settings() {
  const u = await requireUser();
  const [settings, areas, classCount, jobScheduleCount] = await Promise.all([
    prisma.settings.upsert({
      where: { userId: u.id },
      create: { userId: u.id },
      update: {},
    }),
    prisma.category.findMany({
      where: { userId: u.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.project.count({ where: { userId: u.id, kind: "CLASS" } }),
    prisma.calendarEvent.count({ where: { userId: u.id, kind: "SHIFT" } }),
  ]);
  const detected = {
    areas: areas.length >= 7,
    classes: classCount > 0,
    job: jobScheduleCount > 0,
  };
  return (
    <Page>
      <PageHeader
        title="Settings"
        sub="Personalize the system, then let it quietly support your week."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Dashboard preferences">
          <form action={updateSettings} className="grid gap-3">
            <label className={label}>
              Timezone
              <input
                className={input}
                name="timezone"
                defaultValue={settings.timezone}
              />
            </label>
            <label className={label}>
              Week starts
              <select
                className={select}
                name="weekStartsOn"
                defaultValue={settings.weekStartsOn}
              >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
              </select>
            </label>
            <label className={label}>
              Prioritization method
              <select
                className={select}
                name="prioritizationMethod"
                defaultValue={settings.prioritizationMethod}
              >
                <option value="TOP3">Top 3 today</option>
                <option value="EISENHOWER">Eisenhower</option>
                <option value="ABCDE">ABCDE</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={label}>
                Daily capacity hours
                <input
                  className={input}
                  name="dailyCapacityHours"
                  type="number"
                  step=".5"
                  defaultValue={settings.dailyCapacityHours}
                />
              </label>
              <label className={label}>
                Weekly available hours
                <input
                  className={input}
                  name="weeklyAvailableHours"
                  type="number"
                  step=".5"
                  defaultValue={settings.weeklyAvailableHours}
                />
              </label>
            </div>
            <fieldset className="rounded border p-3">
              <legend className="px-1 text-xs font-semibold">
                First-run setup checklist
              </legend>
              {[
                [
                  "setupAreasDone",
                  "Name categories / areas",
                  settings.setupAreasDone || detected.areas,
                ],
                [
                  "setupClassesDone",
                  "Add classes",
                  settings.setupClassesDone || detected.classes,
                ],
                [
                  "setupJobDone",
                  "Add job & schedule",
                  settings.setupJobDone || detected.job,
                ],
                [
                  "setupTimezoneDone",
                  "Set timezone & capacity",
                  settings.setupTimezoneDone,
                ],
                [
                  "setupPrioritiesDone",
                  "Choose prioritization method",
                  settings.setupPrioritiesDone,
                ],
                [
                  "setupRemindersDone",
                  "Set reminders",
                  settings.setupRemindersDone,
                ],
              ].map(([k, t, checked]) => (
                <label className="block text-sm" key={String(k)}>
                  <input
                    className="mr-2"
                    name={String(k)}
                    type="checkbox"
                    defaultChecked={Boolean(checked)}
                  />
                  {String(t)}
                </label>
              ))}
            </fieldset>
            <button className={btn.primary}>Save preferences</button>
          </form>
        </Card>
        <Card title="Areas">
          <div className="space-y-2">
            {areas.map((a) => (
              <form
                action={updateArea}
                key={a.id}
                className="grid grid-cols-[1fr_5rem_4rem_auto] items-end gap-2"
              >
                <input name="id" type="hidden" value={a.id} />
                <label className={label}>
                  Name
                  <input className={input} name="name" defaultValue={a.name} />
                </label>
                <label className={label}>
                  Color
                  <input
                    className={input}
                    name="color"
                    type="color"
                    defaultValue={a.color}
                  />
                </label>
                <label className={label}>
                  Order
                  <input
                    className={input}
                    name="sortOrder"
                    type="number"
                    defaultValue={a.sortOrder}
                  />
                </label>
                <label className="text-xs">
                  <input
                    name="archived"
                    type="checkbox"
                    defaultChecked={a.archived}
                  />{" "}
                  Archive
                </label>
                <button className={btn.secondary}>Save</button>
              </form>
            ))}
          </div>
          <form action={createArea} className="mt-4 grid grid-cols-2 gap-2">
            <input
              className={input}
              name="name"
              placeholder="New area"
              required
            />
            <select className={select} name="kind">
              <option>GENERAL</option>
              <option>SCHOOL</option>
              <option>JOB</option>
              <option>PERSONAL</option>
              <option>PEOPLE</option>
              <option>BUSINESS</option>
              <option>LEARNING</option>
            </select>
            <input name="color" type="color" defaultValue="#4f46e5" />
            <button className={btn.primary}>Add area</button>
          </form>
        </Card>
        <Card title="Clear sample data" className="lg:col-span-2">
          <p className="text-sm text-slate-600">
            This permanently deletes only records marked Sample: sample areas,
            people, goals, projects and milestones, tasks, events, notes,
            commitments, money items, experiments, and weekly reviews. Your real
            records and settings stay.
          </p>
          <form action={clearSampleData} className="mt-3 flex flex-wrap gap-2">
            <input
              className={input}
              name="confirmation"
              placeholder="Type CLEAR SAMPLE DATA"
              required
            />
            <button className={btn.danger}>Clear sample data</button>
          </form>
        </Card>
      </div>
    </Page>
  );
}
