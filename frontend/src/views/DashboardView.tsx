import Link from "next/link";

import type { AdoptionApplication, Pet } from "@/models/adminModel";
import { AdminShell, PageHeader } from "@/views/AdminShell";

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
      <div className="space-y-6">
        <PageHeader
          eyebrow="Dashboard Home"
          title="보호 동물 현황 및 입양 심사"
          description="입양 신청, 계약 진행, 사후관리 리스크를 한 화면에서 확인합니다."
        />

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="전체 보호 동물" value={stats.totalPets} unit="마리" />
          <StatCard
            label="입양 대기/심사"
            value={stats.waitingPets}
            unit="마리"
            tone="blue"
          />
          <StatCard
            label="온라인 신청 접수"
            value={stats.applications}
            unit="건"
            tone="orange"
          />
          <StatCard
            label="CLM 위험 알림"
            value={stats.urgentRisks}
            unit="건"
            tone="red"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">최근 입양 신청</h2>
            <Link
              href="/manage"
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              심사 화면으로 이동
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl border border-blue-500/50 bg-slate-950 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">
                      {application.applicant}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {application.phone} · {application.email}
                    </p>
                  </div>
                  <span className="rounded bg-blue-600 px-2 py-1 text-xs font-bold">
                    {application.score}
                  </span>
                </div>
                <p className="mt-3 text-sm text-green-300">
                  AI 분석: {application.aiSummary}
                </p>
              </div>
            ))}
          </div>
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
}: {
  label: string;
  value: number;
  unit: string;
  tone?: "slate" | "blue" | "orange" | "red";
}) {
  const color = {
    slate: "text-white",
    blue: "text-blue-400",
    orange: "text-orange-400",
    red: "text-red-400",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${color}`}>
        {value} <span className="text-xs font-normal text-slate-500">{unit}</span>
      </p>
    </div>
  );
}

function PetCard({ pet }: { pet: Pet }) {
  const href = pet.status === "risk" ? "/risk" : "/manage";
  const badge =
    pet.status === "risk"
      ? "리스크 알림"
      : pet.status === "review"
        ? "추천 시연 개체"
        : "대기중";

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500"
    >
      <div className="relative h-44 overflow-hidden rounded-xl bg-slate-950">
        <div
          aria-label={pet.name}
          className="h-full w-full bg-cover bg-center opacity-90 transition group-hover:scale-105"
          role="img"
          style={{ backgroundImage: `url(${pet.imageUrl})` }}
        />
        <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs font-bold">
          #{pet.id}
        </span>
        <span className="absolute right-2 top-2 rounded bg-blue-600 px-2 py-1 text-[10px] font-bold">
          {badge}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            {pet.name} ({pet.englishName})
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {pet.age} · {pet.breed}
          </p>
        </div>
        <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">
          신청 {pet.applications}건
        </span>
      </div>
      <p className="mt-3 rounded-lg border border-orange-500/30 bg-orange-950/40 p-3 text-xs leading-5 text-orange-200">
        {pet.note}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {pet.traits.map((trait) => (
          <span
            key={trait}
            className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300"
          >
            {trait}
          </span>
        ))}
      </div>
    </Link>
  );
}
