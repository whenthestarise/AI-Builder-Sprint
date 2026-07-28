import Link from "next/link";

import type { AdoptionApplication, Pet } from "@/models/adminModel";
import { AdminShell, PageHeader } from "@/views/AdminShell";

export function ManageView({
  selectedPet,
  applications,
}: {
  selectedPet: Pet;
  applications: AdoptionApplication[];
}) {
  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Application Review"
          title="입양 신청자 매칭 및 심사"
          description="AI 심사 요약과 보호 동물 특성을 함께 보고 계약 단계로 이동합니다."
        />
        <section className="grid gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-5">
            <div
              aria-label={selectedPet.name}
              className="h-72 w-full rounded-xl bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${selectedPet.imageUrl})` }}
            />
            <h2 className="mt-4 text-2xl font-extrabold">
              {selectedPet.name} ({selectedPet.englishName})
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {selectedPet.age} · {selectedPet.breed} · 8.5kg
            </p>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs font-bold text-blue-400">
                AI 계약 조율용 행동 특성 데이터
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPet.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded bg-slate-800 px-2.5 py-1 text-xs"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="font-bold text-white">접수된 신청자</h2>
                <p className="mt-1 text-xs text-slate-400">
                  임시 데이터로 구성된 신청자 심사 목록입니다.
                </p>
              </div>
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                대기 {applications.length}건
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-xl border-2 border-blue-500 bg-slate-950 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white">
                        {application.applicant}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {application.phone} · {application.email}
                      </p>
                    </div>
                    <span className="rounded bg-blue-600 px-2.5 py-1 text-xs font-bold">
                      {application.score}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs">
                    <Info label="주거 환경" value={application.home} />
                    <Info label="양육 경험" value={application.experience} />
                    <Info label="외출 시간" value={application.awayHours} />
                  </dl>
                  <p className="mt-3 text-sm font-semibold text-green-300">
                    AI 매칭 분석: {application.aiSummary}
                  </p>
                  <Link
                    href="/contracts"
                    className="mt-5 flex h-12 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-500"
                  >
                    AI 책임 입양 계약 체결하기
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-200">{value}</dd>
    </div>
  );
}
