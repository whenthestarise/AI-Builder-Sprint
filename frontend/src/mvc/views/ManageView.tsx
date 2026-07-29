import Link from "next/link";

import type { AdoptionApplication, Pet } from "@/mvc/models/adminModel";
import { AdminShell } from "@/mvc/views/AdminShell";

export function ManageView({
  selectedPet,
  applications,
}: {
  selectedPet: Pet;
  applications: AdoptionApplication[];
}) {
  const selectedApplication = applications[0];

  return (
    <AdminShell>
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Link href="/main" className="text-slate-500 hover:text-slate-800">
              보호 동물 목록
            </Link>
            <span className="text-slate-300">&gt;</span>
            <span className="text-blue-600">동물 상세 및 입양 신청자 검토</span>
          </div>
          <Link
            href="/main"
            className="rounded-lg border border-slate-300 bg-foreground px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            목록으로 돌아가기
          </Link>
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-12 2xl:gap-8">
          <article className="rounded-2xl border border-slate-200 bg-foreground p-5 shadow-sm 2xl:p-6 xl:col-span-5">
<div className="relative h-[clamp(200px,20vw,280px)] overflow-hidden rounded-xl bg-slate-100">
  <div
    aria-label={selectedPet.name}
    className="h-full w-full bg-cover bg-center"
    role="img"
    style={{ backgroundImage: `url(${selectedPet.imageUrl})` }}
  />

  <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
    ID: #{selectedPet.id}
  </span>
</div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
              {selectedPet.name} ({selectedPet.englishName})
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {selectedPet.age} · {selectedPet.breed} · 중성화 완료 · 8.5kg
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-foreground p-4">
              <p className="text-xs font-bold text-blue-600">
                🤖AI 매칭 특약 연동용 핵심 행동 태그
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPet.traits.map((trait, index) => (
                  <span
                    key={trait}
                    className={
                      index === 0
                        ? "rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700"
                        : "rounded-md border border-slate-200 bg-foreground px-2.5 py-1 text-xs font-medium text-slate-700"
                    }
                  >
                    {trait}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[11px] leading-5 text-slate-500">
                * 이 데이터는 다음 단계에서 Upstage Solar LLM이 분석하여 맞춤형 책임 약관을 자동 작성하는 데 사용됩니다.
              </p>
              
            </div>
            <p className="mt-4 border-t border-slate-200 px-3 pt-3 text-[10px] text-slate-400">
  구조일: 2026.05.12 | 구조장소: 부산 해운대구 | 관할: 부산 유기동물
  보호협회</p>
          </article>

          <article className="flex min-h-[clamp(600px,48vw,760px)] flex-col rounded-2xl border border-slate-200 bg-foreground p-5 shadow-sm 2xl:p-6 xl:col-span-7">
            <header className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-950">
                  📑 접수된 입양 신청자 명단 (외부 폼 연동)
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  1차 서류 심사를 통과한 희망자입니다. 선택하여 계약 및 CLM 설정을 진행하세요.  
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                대기 {applications.length}건
              </span>
            </header>

            <div className="mt-4 space-y-4">
              {applications.map((application, index) => (
                <ApplicantCard
                  key={application.id}
                  application={application}
                  index={index}
                />
              ))}
            </div>

            <div className="mt-auto border-t border-slate-200 pt-5">
              {selectedApplication ? (
                <Link
                  href="/contracts"
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700"
                >
                  {selectedApplication.applicant}님과 AI 매칭 책임계약 체결하기
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-14 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-300 text-sm font-bold text-white"
                >
                  계약을 진행할 신청자가 없습니다
                </button>
              )}
            </div>
          </article>
        </section>
      </div>
    </AdminShell>
  );
}

function ApplicantCard({
  application,
  index,
}: {
  application: AdoptionApplication;
  index: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-blue-500 bg-foreground">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {index + 1}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-950">
                {application.applicant} 신청자
              </h3>
              <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                <span>📞{application.phone}</span>
                <span>✉️{application.email}</span>
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white">
            {application.score}
          </span>
        </div>
        <dl className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-foreground p-3 text-xs">
          <Info label="주거 환경" value={application.home} />
          <Info label="양육 경험" value={application.experience} />
          <Info label="외출 시간" value={application.awayHours} />
        </dl>
      </div>
      <div className="border-t border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-xs font-semibold leading-5 text-blue-700">
          AI 매칭 진단: {application.aiSummary}
        </p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
