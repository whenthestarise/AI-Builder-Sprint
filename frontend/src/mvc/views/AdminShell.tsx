"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ==============================
 * 타입
 * ============================== */

type NavigationIconType =
  | "dashboard"
  | "adoption"
  | "report"
  | "settings"
  | "user";

interface NavigationItem {
  href: string;
  label: string;
  description: string;
  icon: NavigationIconType;
  activePaths: string[];
}

/* ==============================
 * 사이드바 메뉴
 * ============================== */

const navigationItems: NavigationItem[] = [
  {
    href: "/main",
    label: "대시보드 홈",
    description: "보호 동물 현황 & 입양 매칭",
    icon: "dashboard",
    activePaths: ["/main", "/manage", "/contracts"],
  },
  {
    href: "/risk",
    label: "입양 관리",
    description: "안부 검토 & 승인",
    icon: "adoption",
    activePaths: ["/risk"],
  },
  {
    href: "/reports",
    label: "통계 리포트",
    description: "입양 현황 분석",
    icon: "report",
    activePaths: ["/reports"],
  },
  {
    href: "/settings",
    label: "환경 설정",
    description: "계정 및 시스템",
    icon: "settings",
    activePaths: ["/settings"],
  },
];

/* ==============================
 * 관리자 전체 레이아웃
 * ============================== */

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isNavigationActive = (activePaths: string[]) => {
    return activePaths.some((path) => {
      if (path === "/main") {
        return pathname === "/main";
      }

      return pathname.startsWith(path);
    });
  };

  return (
    <div className="min-h-screen bg-[#f3f6fa] text-slate-900">
      {/* ==============================
       * 데스크톱 사이드바
       * ============================== */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 hidden",
          "w-[210px] flex-col",
          "border-r border-slate-200 bg-white",
          "lg:flex",
        ].join(" ")}
      >
        {/*
          오른쪽 PageHeader와 같은 높이의 빈 영역입니다.
          사이드바 메뉴는 페이지 헤더 아래에서 시작합니다.
        */}
        <div className="h-[120px] shrink-0 border-b border-slate-100" />

        {/* 메뉴 */}
        <nav className="flex flex-1 flex-col gap-2 px-3 py-5">
          {navigationItems.map((item) => (
            <SidebarNavigationItem
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              icon={item.icon}
              active={isNavigationActive(item.activePaths)}
            />
          ))}
        </nav>

        {/* 관리자 프로필 */}
        <AdminProfile />
      </aside>

      {/* ==============================
       * 모바일 헤더
       * ============================== */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5 lg:hidden">
        <Link
          href="/main"
          className="flex items-center gap-2 text-base font-black tracking-tight text-slate-950"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-sm text-white">
            🐾
          </span>

          <span>포에버웨이</span>
        </Link>

        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
          관리자
        </span>
      </header>

      {/* ==============================
       * 오른쪽 콘텐츠
       *
       * 사이드바 너비만큼만 이동합니다.
       * padding-left를 넣지 않기 때문에
       * 사이드바와 헤더 사이에 빈 공간이 생기지 않습니다.
       * ============================== */}
      <div className="min-w-0 lg:ml-[210px]">
        <main className="min-h-screen min-w-0">{children}</main>
      </div>
    </div>
  );
}

/* ==============================
 * 사이드바 메뉴 아이템
 * ============================== */

function SidebarNavigationItem({
  href,
  label,
  description,
  icon,
  active,
}: {
  href: string;
  label: string;
  description: string;
  icon: NavigationIconType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex min-h-[56px] items-center gap-3 rounded-lg border px-3 py-2.5",
        "transition-colors duration-150",
        active
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          "transition-colors duration-150",
          active
            ? "bg-blue-500 text-white"
            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
        ].join(" ")}
      >
        <NavigationIcon icon={icon} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={[
            "block truncate text-[13px] font-extrabold",
            active ? "text-blue-600" : "text-slate-700",
          ].join(" ")}
        >
          {label}
        </span>

        <span
          className={[
            "mt-0.5 block truncate text-[10px] font-medium",
            active ? "text-blue-500" : "text-slate-400",
          ].join(" ")}
        >
          {description}
        </span>
      </span>
    </Link>
  );
}

/* ==============================
 * 관리자 프로필
 * ============================== */

function AdminProfile() {
  return (
    <div className="border-t border-slate-200 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
          <NavigationIcon icon="user" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold text-slate-900">
            이매니저
          </p>

          <p className="mt-0.5 truncate text-[9px] font-medium text-slate-400">
            부산보호센터 활동가
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==============================
 * 페이지 상단 헤더
 * ============================== */

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      {/*
        헤더 배경은 사이드바에 바로 붙습니다.
        텍스트에만 px-8 내부 여백을 적용합니다.
      */}
      <div
        className={[
          "flex min-h-[120px] flex-col justify-center gap-3",
          "px-5 py-4",
          "sm:flex-row sm:items-center sm:justify-between sm:px-7",
          "lg:px-8",
        ].join(" ")}
      >
        <div className="min-w-0">
          {eyebrow && (
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-blue-600">
              {eyebrow}
            </p>
          )}

          <h1
            className={[
              "text-xl font-black tracking-tight text-slate-950",
              "lg:text-[22px]",
              eyebrow ? "mt-2" : "",
            ].join(" ")}
          >
            {title}
          </h1>

          <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500">
            {description}
          </p>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}

/* ==============================
 * 페이지 본문
 * ============================== */

export function PageContent({ children }: { children: ReactNode }) {
  return (
    <section
      className={[
        "min-h-[calc(100vh-120px)] bg-[#f3f6fa]",
        "px-5 py-6",
        "sm:px-7",
        "lg:px-8 lg:py-7",
      ].join(" ")}
    >
      {children}
    </section>
  );
}

/* ==============================
 * 아이콘
 * ============================== */

function NavigationIcon({ icon }: { icon: NavigationIconType }) {
  const commonProps = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (icon) {
    case "dashboard":
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );

    case "adoption":
      return (
        <svg {...commonProps}>
          <path d="M12 3.5 19 6v5.2c0 4.5-2.8 7.5-7 9.3-4.2-1.8-7-4.8-7-9.3V6l7-2.5Z" />
          <path d="m9.5 12 1.6 1.6 3.7-4" />
        </svg>
      );

    case "report":
      return (
        <svg {...commonProps}>
          <path d="M5 20V10" />
          <path d="M10 20V4" />
          <path d="M15 20v-7" />
          <path d="M20 20v-4" />
        </svg>
      );

    case "settings":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
        </svg>
      );

    case "user":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 20c.6-3.4 2.8-5.5 6.5-5.5s5.9 2.1 6.5 5.5" />
        </svg>
      );

    default:
      return null;
  }
}
