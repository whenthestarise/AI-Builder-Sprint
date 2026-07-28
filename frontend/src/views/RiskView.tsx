import type { Contract, TimelineEvent } from "@/models/adminModel";
import { AdminShell, PageHeader } from "@/views/AdminShell";

export function RiskView({
  contracts,
  timelineEvents,
}: {
  contracts: Contract[];
  timelineEvents: TimelineEvent[];
}) {
  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="CLM Risk Dashboard"
          title="입양 사후관리 및 계약 리스크"
          description="D+7, D+30 인증과 위험 알림을 임시 데이터로 보여줍니다."
        />
        <section className="grid gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white">계약/사후관리 목록</h2>
              <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold">
                긴급 1건
              </span>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs text-slate-400">
                  <tr>
                    <th className="p-3">계약</th>
                    <th className="p-3">입양자</th>
                    <th className="p-3">상태</th>
                    <th className="p-3">다음 조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="bg-slate-900">
                      <td className="p-3">
                        <p className="font-semibold text-white">
                          {contract.petName}
                        </p>
                        <p className="text-xs text-slate-500">{contract.id}</p>
                      </td>
                      <td className="p-3 text-slate-300">
                        {contract.adopterName}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            contract.risk === "urgent"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {contract.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {contract.nextCheck}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-5">
            <h2 className="font-bold text-white">CLM 타임라인</h2>
            <div className="mt-4 space-y-4">
              {timelineEvents.map((event) => (
                <div
                  key={event.id}
                  className={`rounded-xl border p-4 ${
                    event.tone === "urgent"
                      ? "border-red-500/50 bg-red-950/30"
                      : "border-slate-800 bg-slate-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-white">{event.title}</h3>
                    <span className="text-xs text-slate-500">{event.date}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
