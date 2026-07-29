import type { Contract } from "@/mvc/models/adminModel";

type RiskDashboardModalProps = {
  applicantPhone: string;
  contract: Contract | null;
  onClose: () => void;
};

export function RiskDashboardModal({
  applicantPhone,
  contract,
  onClose,
}: RiskDashboardModalProps) {
  if (!contract) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="risk-dashboard-title"
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              CLM Dashboard
            </p>
            <h2
              id="risk-dashboard-title"
              className="mt-1 text-xl font-extrabold text-slate-950"
            >
              {contract.petName} 사후관리 대시보드
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              입양자 {contract.adopterName} · {applicantPhone}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="모달 닫기"
          >
            X
          </button>
        </header>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <MetricCard label="계약 상태" value={contract.status} />
          <MetricCard label="서명일" value={contract.signedAt} />
          <MetricCard label="다음 확인" value={contract.nextCheck} />
        </div>

        <section className="border-t border-slate-200 px-6 py-5">
          <h3 className="text-sm font-extrabold text-slate-950">
            미래 타임라인
          </h3>
          <div className="mt-4 space-y-3">
            <TimelineItem
              date="D+7"
              title="생활 사진 인증"
              description="입양자가 생활 사진과 적응 메모를 제출합니다."
            />
            <TimelineItem
              date="D+30"
              title="건강 및 환경 점검"
              description="건강검진 여부와 주거 환경 유지 상태를 확인합니다."
            />
            <TimelineItem
              date="D+90"
              title="행동 교정 특약 완료 확인"
              description="특약 이행 기록을 검토하고 CLM 상태를 갱신합니다."
            />
          </div>
        </section>

        <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            닫기
          </button>
        </footer>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-extrabold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function TimelineItem({
  date,
  title,
  description,
}: {
  date: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[80px_1fr]">
      <span className="font-mono text-xs font-bold text-blue-600">{date}</span>
      <div>
        <p className="text-sm font-bold text-slate-950">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
