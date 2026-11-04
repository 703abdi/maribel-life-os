import { requireUser } from "@/lib/auth";
import { changeOwnPassword } from "@/modules/actions";
import { Card, Page, PageHeader, btn, input, label } from "@/components/ui";
export default async function Account() {
  const u = await requireUser();
  return (
    <Page>
      <PageHeader title="Account" sub={u.name || u.email} />
      <Card title="Change password" className="max-w-lg">
        <form action={changeOwnPassword} className="space-y-3">
          <label className={label}>
            Current password
            <input
              className={input}
              type="password"
              name="currentPassword"
              required
            />
          </label>
          <label className={label}>
            New password
            <input
              className={input}
              type="password"
              name="password"
              minLength={8}
              required
            />
          </label>
          <button className={btn.primary}>Update password</button>
        </form>
      </Card>
    </Page>
  );
}
