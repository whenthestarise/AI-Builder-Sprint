import Link from "next/link";

const navItems = [
  { href: "/main", label: "대시보드" },
  { href: "/manage", label: "입양관리" },
  { href: "/risk", label: "리스크" },
  { href: "/contracts", label: "계약서" },
  { href: "/modusign", label: "모두싸인 API" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/main" className="flex items-center gap-3">
            <span className="rounded bg-blue-600 px-2.5 py-1 text-xs font-extrabold tracking-wider text-white">
              B2G/B2B ADMIN
            </span>
            <span className="font-bold text-white">Forever Way CLM</span>
          </Link>
          <nav className="flex flex-wrap rounded-xl border border-slate-700 bg-slate-900 p-1 text-xs font-bold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-4 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 text-xs text-slate-400 md:flex">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            임시 데이터/실제 API 분리
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-800 pb-5">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-400">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-2xl font-extrabold text-white">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}
