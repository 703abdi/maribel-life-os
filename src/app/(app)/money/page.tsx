import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMoneyItem } from "@/modules/actions";
import {
  Card,
  Empty,
  Page,
  PageHeader,
  btn,
  input,
  select,
} from "@/components/ui";
const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n / 100,
  );
export default async function Money() {
  const u = await requireUser(),
    items = await prisma.moneyItem.findMany({
      where: { userId: u.id },
      include: { project: true },
      orderBy: { name: "asc" },
    });
  const groups = [
    ["INCOME", "Income"],
    ["BILL", "Bills"],
    ["SUBSCRIPTION", "Subscriptions"],
    ["SAVINGS_GOAL", "Savings goals"],
  ] as const;
  const monthly = items
    .filter((x) => x.kind === "SUBSCRIPTION" && x.cadence === "monthly")
    .reduce((n, x) => n + x.amountCents, 0);
  return (
    <Page>
      <PageHeader
        title="Money"
        sub={`Monthly subscriptions: ${money(monthly)}`}
      />
      <Card title="Add money item">
        <form action={createMoneyItem} className="grid gap-2 md:grid-cols-4">
          <input className={input} name="name" placeholder="Name" required />
          <input
            className={input}
            name="amountCents"
            type="number"
            min="0"
            placeholder="Amount in cents"
            required
          />
          <select className={select} name="kind">
            <option>INCOME</option>
            <option>BILL</option>
            <option>SUBSCRIPTION</option>
            <option>SAVINGS_GOAL</option>
          </select>
          <select className={select} name="cadence">
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="once">One time</option>
          </select>
          <input
            className={input}
            name="targetCents"
            type="number"
            min="0"
            placeholder="Savings target cents"
          />
          <input
            className={input}
            name="savedCents"
            type="number"
            min="0"
            placeholder="Saved cents"
          />
          <button className={btn.primary}>Add</button>
        </form>
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {groups.map(([k, label]) => (
          <Card key={k} title={label}>
            {items.filter((x) => x.kind === k).length ? (
              items
                .filter((x) => x.kind === k)
                .map((x) => (
                  <div className="border-b py-2 text-sm" key={x.id}>
                    <b>{x.name}</b> · {money(x.amountCents)}{" "}
                    <span className="text-slate-500">{x.cadence}</span>
                    {x.kind === "SAVINGS_GOAL" && (
                      <p className="text-xs text-teal-700">
                        {money(x.savedCents ?? 0)} / {money(x.targetCents ?? 0)}
                      </p>
                    )}
                  </div>
                ))
            ) : (
              <Empty>Nothing added yet.</Empty>
            )}
          </Card>
        ))}
      </div>
    </Page>
  );
}
