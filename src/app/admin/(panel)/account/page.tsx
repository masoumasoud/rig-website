import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/admin/ui";
import { AccountForm } from "./form";

export const metadata = { title: "حساب کاربری" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title="حساب کاربری" />
      <AccountForm name={user.name} email={user.email} />
    </div>
  );
}
