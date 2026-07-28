import Link from "next/link";

import type { AdoptionApplication, Contract, Pet } from "@/models/adminModel";
import { AdminShell, PageHeader } from "@/views/AdminShell";

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
  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="AI Contract Draft"
          title="표준 입양 계약서 조율"
          description="모두싸인 직전 계약 조율 화면을 임시 데이터로 재구성했습니다."
        />
        <section className="grid gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  AI 맞춤 책임 입양 계약서
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  특약 생성 결과와 모두싸인 입력 라벨 매핑 미리보기
                </p>
              </div>
              <span className="rounded bg-blue-600 px-3 py-1 text-xs font-bold">
                MOCK API
              </span>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-bold text-blue-400">계약 기본 정보</p>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <Info label="계약 ID" value={contract.id} />
                  <Info label="동물" value={`${pet.name} (${pet.englishName})`} />
                  <Info label="입양자" value={applicant.applicant} />
                  <Info label="서명 방식" value="카카오톡 알림톡" />
                </dl>
              </div>
              <div className="rounded-xl border border-orange-500/40 bg-orange-950/30 p-4">
                <p className="text-xs font-bold text-orange-300">AI 생성 특약</p>
                <p className="mt-2 text-sm leading-7 text-orange-100">
                  입양자 {applicant.applicant}는 입양 동물 {pet.name}의 분리불안
                  완화를 위해 최소 3개월간 보호소가 제공하는 행동 교정 지침을
                  성실히 이행하며, 주거지 내 안전문 설치 및 실외 배변 루틴을
                  유지해야 합니다.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-blue-400">
                    모두싸인 데이터 라벨
                  </p>
                  <span className="text-xs text-slate-500">
                    임시 데이터
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {dataLabels.map((item) => (
                    <div
                      key={item.label}
                      className="grid gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm sm:grid-cols-[140px_1fr]"
                    >
                      <span className="font-mono text-blue-300">
                        {item.label}
                      </span>
                      <span className="text-slate-200">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-5">
            <h2 className="text-xl font-extrabold text-white">전자서명 시연</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              실제 API 호출 없이 서명 요청, 서명 완료, CLM 저장 흐름을 화면으로
              보여줍니다.
            </p>
            <div className="mt-5 rounded-xl border border-blue-500/40 bg-blue-950/30 p-4">
              <p className="text-sm font-bold text-blue-200">
                카카오톡 서명 요청 준비 완료
              </p>
              <p className="mt-2 text-xs text-slate-300">
                수신자: {applicant.applicant} · {applicant.phone}
              </p>
            </div>
            <Link
              href="/risk"
              className="mt-5 flex h-12 items-center justify-center rounded-xl bg-green-600 text-sm font-bold text-white hover:bg-green-500"
            >
              서명 완료 처리 후 CLM 보기
            </Link>
          </aside>
        </section>
      </div>
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-white">{value}</dd>
    </div>
  );
}
