import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/admin/ui";
import { pageDefs } from "./defs";

export const metadata = { title: "متن صفحات" };

export default async function PagesAdmin() {
  await requireUser();
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="متن صفحات و سئو" />
      <ul className="space-y-2">
        {Object.entries(pageDefs).map(([key, d]) => (
          <li key={key}>
            <Link href={`/admin/pages/${key}`} className="flex min-h-14 items-center justify-between rounded-xl border border-[#dcdcde] bg-white px-5 font-bold hover:border-ink">
              {d.label}
              <span className="text-ink-3">ویرایش ←</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
