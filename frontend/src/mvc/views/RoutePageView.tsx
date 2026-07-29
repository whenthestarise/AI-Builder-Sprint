import Link from "next/link";

type RoutePage = {
  title: string;
  href: string;
  description: string;
};

const routes: RoutePage[] = [
  {
    title: "Main",
    href: "/main",
    description: "서비스의 핵심 현황을 한눈에 확인하는 메인 화면입니다.",
  },
  {
    title: "관리",
    href: "/manage",
    description: "운영 데이터와 설정을 관리하는 화면입니다.",
  },
  {
    title: "리스크",
    href: "/risk",
    description: "위험 요소와 점검 항목을 추적하는 화면입니다.",
  },
  {
    title: "계약서",
    href: "/contracts",
    description: "계약 문서와 검토 상태를 확인하는 화면입니다.",
  },
];

type RoutePageViewProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function RoutePageView({
  title,
  description,
  children,
}: RoutePageViewProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
      <nav className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-blue-300 hover:text-blue-700"
          >
            {route.title}
          </Link>
        ))}
      </nav>

      <section className="flex flex-1 flex-col justify-center gap-6 py-16">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase text-blue-600">
            App Route
          </p>
          <h1 className="text-4xl font-bold text-zinc-950">{title}</h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600">
            {description}
          </p>
        </div>

        {children}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-lg border border-zinc-200 bg-foreground p-5 transition hover:border-blue-300 hover:shadow-sm"
            >
              <h2 className="text-lg font-semibold text-zinc-950">
                {route.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {route.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
