import Link from "next/link";

export function PageTitle({ title, action, back }: { title: string; action?: React.ReactNode; back?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {back ? (
        <Link href={back} className="min-h-10 rounded-lg border border-[#dcdcde] bg-white px-3 py-1.5 font-bold hover:bg-[#f6f7f7]">
          → بازگشت
        </Link>
      ) : null}
      <h1 className="text-2xl">{title}</h1>
      {action ? <div className="ms-auto">{action}</div> : null}
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-[#dcdcde] bg-white p-5 shadow-sm ${className ?? ""}`}>
      {title ? <h2 className="mb-4 text-lg">{title}</h2> : null}
      {children}
    </section>
  );
}

type FieldProps = {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  hint?: string;
  dir?: "ltr" | "rtl";
  rows?: number;
  required?: boolean;
  type?: string;
  placeholder?: string;
};

export function Field({ name, label, defaultValue, hint, dir, rows, required, type = "text", placeholder }: FieldProps) {
  const common = {
    id: name,
    name,
    defaultValue: defaultValue ?? "",
    dir,
    required,
    placeholder,
    className: `input ${dir === "ltr" ? "text-left" : ""}`,
  };
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </label>
      {rows ? <textarea rows={rows} {...common} /> : <input type={type} {...common} />}
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function Check({ name, label, defaultChecked, value }: { name: string; label: string; defaultChecked?: boolean; value?: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 font-bold">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="size-5 accent-[#2271b1]" />
      {label}
    </label>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border-2 border-dashed border-[#c3c4c7] p-8 text-center text-ink-2">{children}</p>;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#dcdcde] bg-white">
      <table className="w-full text-start">
        <thead className="border-b border-[#dcdcde] bg-[#f6f7f7] text-sm text-ink-2">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-start font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f0f1]">{children}</tbody>
      </table>
    </div>
  );
}

export const faDate = (d: Date) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(d);
