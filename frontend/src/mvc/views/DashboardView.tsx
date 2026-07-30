import Link from "next/link";

import type { AdoptionApplication, Pet } from "@/mvc/models/adminModel";
import { AdminShell } from "@/mvc/views/AdminShell";

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

export function DashboardView({
  stats,
  pets,
  applications,
}: DashboardViewProps) {
  return (
    <AdminShell>
      <div className="w-full space-y-5">
        <section className="border-b border-slate-200 pb-5">
          <p className="font-mono  font-extrabold tracking-wide text-blue-600">
            STEP 1. ADOPTION MATCHING
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
            보호 동물 목록 및 입양 심사
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            동물 프로필과 접수된 입양 신청자를 검토하고 매칭 및 책임계약을
            진행하세요.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="전체 보호 동물" value={stats.totalPets} unit="마리" />
          <StatCard
            label="입양 가능"
            value={stats.waitingPets}
            unit="마리"
            tone="blue"
          />
          <StatCard
            label="1차 심사 통과"
            value={stats.applications}
            unit="건"
            tone="orange"
          />
          <StatCard
            label="CLM 확인 대기"
            value={stats.urgentRisks}
            unit="건"
            tone="red"
            action={{ label: "바로가기", href: "/risk" }}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-3 2xl:gap-6">
          {pets.map((pet, index) => (
            <PetCard
              key={pet.id}
              pet={pet}
              recommended={index === 0}
              application={pet.status === "matching" ? applications[0] : undefined}
            />
          ))}
        </section>
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  unit,
  tone = "slate",
  action,
}: {
  label: string;
  value: number;
  unit: string;
  tone?: "slate" | "blue" | "orange" | "red";
  action?: { label: string; href: string };
}) {
  const color = {
    slate: "text-slate-950",
    blue: "text-blue-600",
    orange: "text-orange-500",
    red: "text-red-600",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-foreground p-4">
      <div className="flex items-start justify-between gap-3">
        <p className={`text-xs font-bold ${color}`}>{label}</p>
        {action && (
          <Link
            href={action.href}
            className="shrink-0 text-xs font-bold text-red-600 underline underline-offset-2 hover:text-red-700"
          >
            {action.label}
          </Link>
        )}
      </div>
      <p className={`mt-2 text-3xl font-bold leading-none ${color}`}>
        {value}
        <span className="ml-1 text-xs font-normal text-slate-500">{unit}</span>
      </p>
    </div>
  );
}

function PetCard({
  pet,
  recommended = false,
  application,
}: {
  pet: Pet;
  recommended?: boolean;
  application?: AdoptionApplication;
}) {
  const href = pet.status === "adopted" ? "/risk" : "/manage";

  const statusBadge = {
    matching: {
      label: "매칭 대기중",
      className: "bg-orange-500 text-white",
    },
    available: {
      label: "입양 가능",
      className: "bg-emerald-600 text-white",
    },
    adopted: {
      label: "입양 완료",
      className: "bg-slate-700 text-white",
    },
  }[pet.status];

  const noteStyle = {
    matching: "border-orange-300 bg-orange-50 text-orange-700",
    available: "border-slate-200 bg-slate-100 text-slate-600",
    adopted: "border-red-300 bg-red-50 text-red-600",
  }[pet.status];

  return (
    <Link
      href={href}
      className={[
        "group relative flex min-h-[340px] flex-col rounded-2xl",
        "bg-foreground p-3 shadow-sm transition 2xl:p-4",
        recommended
          ? "border-2 border-blue-600 ring-2 ring-blue-100"
          : "border border-slate-200 hover:border-blue-400",
      ].join(" ")}
    >
      {recommended && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
          추천 표준 계약
        </span>
      )}

      {/* 이미지 높이를 170px로 제한 */}
      <div className="relative h-[170px] shrink-0 overflow-hidden rounded-xl bg-slate-200">
        <div
          aria-label={pet.name}
          role="img"
          className="h-full w-full bg-cover bg-center transition duration-300 group-hover:scale-105"
          style={{
            backgroundImage: `url(${pet.imageUrl})`,
          }}
        />

        <div className="absolute bottom-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded bg-black/75 px-2 py-1 text-[10px] font-semibold text-white">
            ID: #{pet.id}
          </span>
        </div>

        <div className="absolute bottom-2 right-2">
          <span
            className={`rounded px-2 py-1 text-[10px] font-bold ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* 이름 */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <h2 className="min-w-0 text-lg font-extrabold leading-tight text-slate-950">
          {pet.name} ({pet.englishName})
        </h2>

        <span className="shrink-0 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
          {pet.age} · {pet.breed}
        </span>
      </div>

      {/* 상태 설명 */}
      <div
        className={`mt-2 rounded-lg border px-3 py-2 text-xs leading-5 ${noteStyle}`}
      >
        {pet.status === "available"
          ? pet.traits.map((trait) => `#${trait}`).join(", ")
          : pet.note}
      </div>

      {/* 하단 */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
        {pet.status === "matching" && (
          <>
            <p className="min-w-0 text-slate-500">
              1차 심사 통과:{" "}
              <strong className="text-slate-900">
                {application?.applicant ?? "검토 대기"}
              </strong>
            </p>

            <span className="shrink-0 font-bold text-blue-600">
              상세 및 심사
            </span>
          </>
        )}

        {pet.status === "available" && (
          <>
            <p className="text-slate-500">
              계약 상태:{" "}
              <strong className="text-emerald-600">
                신청 가능
              </strong>
            </p>

            <span className="shrink-0 font-semibold text-slate-400">
              상세 보기
            </span>
          </>
        )}

        {pet.status === "adopted" && (
          <>
            <p className="text-slate-500">
              입양 후 사후관리 진행 중
            </p>

            <span className="shrink-0 font-bold text-blue-600">
              CLM 관리로 이동
            </span>
          </>
        )}
      </div>
    </Link>
  );
}