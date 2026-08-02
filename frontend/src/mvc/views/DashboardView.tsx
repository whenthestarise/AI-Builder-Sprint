"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type {
  AdoptionApplication,
  Pet,
} from "@/mvc/models/adminModel";
import {
  AdminShell,
  PageContent,
  PageHeader,
} from "@/mvc/views/AdminShell";

type DashboardViewProps = {
  stats: {
    totalPets: number;
    waitingPets: number;
    applications: number;
    urgentRisks: number;
  };
  pets: Pet[];
  applications: AdoptionApplication[];
};

type StatTone = "slate" | "blue" | "orange" | "red";

type StatIconType =
  | "shield"
  | "clock"
  | "document"
  | "alert";

type DashboardFilter = "all" | "waiting" | "applications";

export function DashboardView({
  stats,
  pets,
  applications,
}: DashboardViewProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<DashboardFilter>("all");

  const filteredPets = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const applicationPetIds = new Set(
      applications.map((application) => String(application.petId)),
    );

    return pets.filter((pet) => {
      if (activeFilter === "waiting" && pet.status !== "available") {
        return false;
      }

      if (
        activeFilter === "applications" &&
        !applicationPetIds.has(String(pet.id))
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchableValues = [
        pet.name,
        pet.englishName,
        pet.breed,
        ...(pet.traits ?? []),
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(keyword),
      );
    });
  }, [activeFilter, applications, pets, searchKeyword]);

  return (
    <AdminShell>
      <PageHeader
        title="보호 동물 현황 및 입양 심사"
        description="외부 접수된 입양 신청자 매칭 현황을 확인하고 클릭하여 심사 및 계약을 진행하세요."
      />

      <PageContent>
        <div className="space-y-6">
          {/* 통계 카드 */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="전체 보호 동물"
              value={stats.totalPets}
              unit="마리"
              tone="slate"
              icon="shield"
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            />

            <StatCard
              label="입양 대기중"
              value={stats.waitingPets}
              unit="마리"
              tone="blue"
              icon="clock"
              active={activeFilter === "waiting"}
              onClick={() => setActiveFilter("waiting")}
            />

            <StatCard
              label="온라인 신청서 접수"
              value={stats.applications}
              unit="건"
              description="매칭 대기 중"
              tone="orange"
              icon="document"
              active={activeFilter === "applications"}
              onClick={() => setActiveFilter("applications")}
            />

            <StatCard
              label="위험 알림"
              value={stats.urgentRisks}
              unit="건"
              description="조치 요망"
              tone="red"
              icon="alert"
              href="/risk"
            />
          </section>

          {/* 검색 */}
          <section>
            <div className="relative w-full max-w-[380px]">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                <SearchIcon />
              </span>

              <input
                type="search"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="이름, 품종 검색하기"
                aria-label="보호 동물 검색"
                className={[
                  "h-11 w-full rounded-lg border border-slate-200 bg-white",
                  "pl-11 pr-4 text-sm text-slate-900 outline-none",
                  "placeholder:text-slate-400",
                  "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                ].join(" ")}
              />
            </div>
          </section>

          {/* 동물 카드 목록 */}
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPets.map((pet) => {
              const application = findApplicationByPetId(
                applications,
                pet.id,
              );

              return (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  application={application}
                />
              );
            })}
          </section>

          {filteredPets.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="text-sm font-semibold text-slate-600">
                검색 조건과 일치하는 보호 동물이 없습니다.
              </p>
            </div>
          )}
        </div>
      </PageContent>
    </AdminShell>
  );
}

/* ==============================
 * 통계 카드
 * ============================== */

function StatCard({
  label,
  value,
  unit,
  description,
  tone,
  icon,
  href,
  active = false,
  onClick,
}: {
  label: string;
  value: number;
  unit: string;
  description?: string;
  tone: StatTone;
  icon: StatIconType;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const style = {
    slate: {
      value: "text-slate-950",
      iconBox: "bg-slate-100 text-slate-900",
      border: "border-slate-200",
      description: "text-slate-500",
    },
    blue: {
      value: "text-blue-600",
      iconBox: "bg-blue-50 text-blue-600",
      border: "border-slate-200",
      description: "text-blue-500",
    },
    orange: {
      value: "text-orange-500",
      iconBox: "bg-amber-50 text-orange-500",
      border: "border-slate-200",
      description: "text-slate-500",
    },
    red: {
      value: "text-red-600",
      iconBox: "bg-red-50 text-red-600",
      border: "border-red-500",
      description: "text-red-600",
    },
  }[tone];

  const content = (
    <div
      className={[
        "flex min-h-[104px] items-center gap-4 rounded-xl border bg-white",
        "px-5 py-4 transition-shadow",
        active ? "border-blue-500 ring-2 ring-blue-100" : style.border,
        href ? "hover:shadow-md" : "",
        onClick ? "cursor-pointer hover:shadow-md" : "",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          style.iconBox,
        ].join(" ")}
      >
        <StatIcon icon={icon} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-600">
          {label}
        </p>

        <div className="mt-1 flex items-end gap-1">
          <strong
            className={[
              "text-[26px] font-extrabold leading-none",
              style.value,
            ].join(" ")}
          >
            {value}
          </strong>

          <span className="pb-0.5 text-xs font-medium text-slate-500">
            {unit}
          </span>
        </div>

        {description && (
          <p
            className={[
              "mt-1 text-[11px] font-medium",
              style.description,
            ].join(" ")}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );

  if (!href) {
    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          aria-pressed={active}
          className="block w-full text-left"
        >
          {content}
        </button>
      );
    }

    return content;
  }

  return (
    <Link href={href} aria-label={`${label} 페이지로 이동`}>
      {content}
    </Link>
  );
}

/* ==============================
 * 보호 동물 카드
 * ============================== */

function PetCard({
  pet,
  application,
}: {
  pet: Pet;
  application?: AdoptionApplication;
}) {
  const href = pet.status === "adopted" ? "/risk" : `/manage/${pet.id}`;

  const displayText = getPetDisplayText(pet, application);

  return (
    <article
      className={[
        "group flex min-h-[370px] flex-col overflow-hidden rounded-xl",
        "border border-slate-200 bg-white shadow-sm",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md",
      ].join(" ")}
    >
      <Link href={href} className="flex h-full flex-col">
        {/* Pet 데이터에 저장된 imageUrl 사용 */}
        <div className="relative h-[210px] shrink-0 overflow-hidden bg-slate-200">
          <div
            role="img"
            aria-label={`${pet.name} 보호 동물 사진`}
            className={[
              "h-full w-full bg-cover bg-center",
              "transition-transform duration-300",
              "group-hover:scale-[1.03]",
            ].join(" ")}
            style={{
              backgroundImage: `url("${pet.imageUrl}")`,
            }}
          />
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
          {/* 이름과 품종 */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 truncate text-xl font-extrabold tracking-tight text-slate-950">
              {pet.name}
            </h2>

            <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              {pet.age} · {pet.breed}
            </span>
          </div>

          {/* 동물별 상태 정보 */}
          <div
            className={[
              "mt-4 min-h-[42px] rounded-md border px-3 py-2",
              "text-xs font-medium leading-5",
              displayText.noticeClassName,
            ].join(" ")}
          >
            {displayText.notice}
          </div>

          {/* 하단 상태 */}
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="min-w-0 truncate text-xs text-slate-600">
              {displayText.footer}
            </p>

            <span className="shrink-0 text-xs font-bold text-blue-600">
              {displayText.action}
              <span aria-hidden="true" className="ml-1">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ==============================
 * 화면 표시 데이터 변환
 * ============================== */

function getPetDisplayText(
  pet: Pet,
  application?: AdoptionApplication,
) {
  if (pet.status === "matching") {
    return {
      notice:
        pet.note ||
        "입양 신청서 검토 및 신청자 심사가 진행 중입니다.",
      noticeClassName:
        "border-amber-300 bg-amber-50 text-amber-800",
      footer: `1차 심사 통과자: ${
        application?.applicant ?? "검토 대기"
      }`,
      action: "상세 및 심사",
    };
  }

  if (pet.status === "adopted") {
    return {
      notice:
        pet.note ||
        "입양 후 사후관리 및 정기 인증이 진행 중입니다.",
      noticeClassName:
        "border-red-200 bg-red-50 text-red-600",
      footer: "입양 후 사후관리 진행 중",
      action: "CLM 관리",
    };
  }

  return {
    notice:
      pet.note ||
      pet.traits?.map((trait) => `#${trait}`).join(", ") ||
      "현재 입양 신청이 가능한 보호 동물입니다.",
    noticeClassName:
      "border-amber-300 bg-amber-50 text-slate-600",
    footer: "신청 가능",
    action: "상세 보기",
  };
}

/* ==============================
 * 신청서와 동물 연결
 * ============================== */

function findApplicationByPetId(
  applications: AdoptionApplication[],
  petId: Pet["id"],
) {
  return applications.find(
    (application) => String(application.petId) === String(petId),
  );
}

/* ==============================
 * 아이콘
 * ============================== */

function SearchIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function StatIcon({ icon }: { icon: StatIconType }) {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (icon) {
    case "shield":
      return (
        <svg {...commonProps}>
          <path d="M12 3 19 6v5c0 4.7-2.8 7.7-7 9.5C7.8 18.7 5 15.7 5 11V6l7-3Z" />
          <path d="M9.5 11.5h5" />
          <path d="M12 9v5" />
        </svg>
      );

    case "clock":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "document":
      return (
        <svg {...commonProps}>
          <rect x="6" y="4" width="12" height="16" rx="2" />
          <path d="M9 4.5V3h6v1.5" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
      );

    case "alert":
      return (
        <svg {...commonProps}>
          <path d="M12 4v2" />
          <path d="M5.6 6.6 7 8" />
          <path d="M18.4 6.6 17 8" />
          <path d="M4 13h2" />
          <path d="M18 13h2" />
          <path d="M8 16h8" />
          <path d="M9 16v-4a3 3 0 0 1 6 0v4" />
          <path d="M7 20h10" />
        </svg>
      );

    default:
      return null;
  }
}
