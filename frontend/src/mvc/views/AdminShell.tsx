"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStepOne =
    pathname === "/main" ||
    pathname.startsWith("/manage") ||
    pathname.startsWith("/contracts") ||
    pathname.startsWith("/modusign");
  const isStepTwo = pathname.startsWith("/risk");

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-foreground">
        <div className="mx-auto flex min-h-16 w-full max-w-[1400px] items-center justify-between gap-5 px-5 lg:px-8">
          <Link href="/main" className="flex min-w-0 items-center gap-3">

            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-base font-black tracking-tight text-slate-950">
                🐾포에버웨이
              </span>
              <span className="h-4 w-px shrink-0 bg-slate-300" />
              <span className="hidden truncate text-[11px] font-medium text-slate-500 sm:block">
                입양 매칭 & CLM 사후관리 통합 시스템
              </span>
            </div>
          </Link>

          <nav className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm lg:flex">
            <StepNavigationItem
              href="/main"
              label="1. 보호 동물 현황 & 입양 매칭"
              active={isStepOne}
            />
            <StepNavigationItem
              href="/risk"
              label="2. 입양관리"
              active={isStepTwo}
              badge="승인대기"
            />
          </nav>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-semibold text-emerald-700 md:flex">
            보호소 신청자 연동중
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1150px] px-5 py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function StepNavigationItem({
  href,
  label,
  active,
  badge,
}: {
  href: string;
  label: string;
  active: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5",
        "text-[11px] font-bold transition-colors",
        active
          ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
          : "text-slate-700 hover:bg-white hover:text-blue-700",
      ].join(" ")}
    >
      <span className="whitespace-nowrap">{label}</span>
      {badge && (
        <span className="whitespace-nowrap rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-blue-600">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
