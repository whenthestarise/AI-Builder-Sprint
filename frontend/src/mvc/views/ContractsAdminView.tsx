import Link from "next/link";

import type {
  AdoptionApplication,
  Contract,
  Pet,
} from "@/mvc/models/adminModel";
import { AdminShell } from "@/mvc/views/AdminShell";

export function ContractsAdminView({
  contract,
  pet,
  applicant,
  dataLabels,
}: {
  contract: Contract;
  pet: Pet;
  applicant: AdoptionApplication;
  dataLabels: Array<{ label: string; value: string }>;
}) {
  const primaryTrait = pet.traits[0] ?? "행동 특성 확인 필요";

  return (
    <AdminShell>
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <Link href="/main" className="text-slate-500 hover:text-slate-900">
              보호 동물 목록
            </Link>
            <span className="text-slate-300">&gt;</span>
            <Link href="/manage" className="text-slate-500 hover:text-slate-900">
              동물 상세 ({pet.name})
            </Link>
            <span className="text-slate-300">&gt;</span>
            <span className="text-blue-600">계약서 검토 및 AI 특약 설정</span>
          </div>
          <Link
            href="/manage"
            className="shrink-0 rounded-lg border border-slate-300 bg-foreground px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            이전 단계로
          </Link>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-foreground p-6 shadow-sm 2xl:p-7">
          <div className="grid gap-7 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 2xl:gap-9">

  <aside>
  <h1 className="border-b border-slate-200 pb-3 text-lg font-extrabold text-slate-950">
    체결 대상 정보
  </h1>

  <div className="mt-4 space-y-4">
    <InfoGroup>
      <InfoRow
        label="입양 동물"
        value={`${pet.name} (${pet.age}, ${pet.breed})`}
      />

      <InfoRow
        label="동물 특성"
        value={
          <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600">
            {primaryTrait}
          </span>
        }
      />
    </InfoGroup>

    <InfoGroup>
      <InfoRow
        label="입양 신청자"
        value={applicant.applicant}
      />

      <InfoRow
        label="주거 환경"
        value={applicant.home}
      />
    </InfoGroup>

    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-sm font-bold text-slate-900">
        🤖 Upstage AI 조율 가이드
      </h2>

      <p className="mt-3 text-xs leading-6 text-slate-600">
        동물의 {primaryTrait} 특성과 신청자의 {applicant.home} 환경을
        조합하여 분쟁을 예방하고 책임감을 높이는 맞춤형 특약이 우측에
        자동 생성되었습니다.
      </p>
    </section>
  </div>
</aside>

            <main>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <h2 className="text-lg font-extrabold text-slate-950">
                  입양 계약서 검토 및 특약 설정
                </h2>
                <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 font-mono text-[11px] font-semibold text-blue-700">
                  MVC Mock #{contract.id}
                </span>
              </header>

              <div className="mt-5 space-y-4">
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    기본 조항 요약
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    <li>평생 책임 사육 및 임의 양도, 매매, 유기 금지</li>
                    <li>질병 발생 시 적절한 치료와 정기 건강검진 이행</li>
                  </ul>
                </section>

                <section className="rounded-xl border-2 border-blue-500 bg-blue-50/40 p-5">
                  <span className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
                    [{primaryTrait}] 맞춤 추가 조항
                  </span>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-foreground p-4">
                    <p className="text-sm leading-7 text-slate-800">
                      입양자 <strong>{applicant.applicant}</strong>는{" "}
                      <strong>{pet.name}</strong>의 {primaryTrait} 완화를 위해
                      입양 후 3개월간 주 1회 행동 교정 훈련 상황을 공유한다.
                    </p>
                  </div>
                </section>

                

                <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      기본 조항 및 AI 맞춤 특약을 확인했습니다.
                    </span>
                  </label>
                  <div className="mt-5 flex justify-center">
                    <Link
                      href="/risk"
                      className="flex h-12 w-full max-w-sm items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                    >
                      카카오톡 알림톡 서명 발송
                    </Link>
                  </div>
                </section>
              </div>
            </main>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function InfoGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 last:border-b-0">
      <dt className="shrink-0 text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-bold text-slate-900">{value}</dd>
    </div>
  );
}
