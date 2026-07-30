"use client";

import { useState } from "react";

import type { Contract, TimelineEvent } from "@/mvc/models/adminModel";
import { getRiskDashboardModalViewModel } from "@/mvc/controllers/adminController";
import { AdminShell } from "@/mvc/views/AdminShell";
import { RiskDashboardModal } from "@/mvc/views/RiskDashboardModal";

type RiskViewProps = {
  contracts: Contract[];
  applicantPhone: string;
  timelineEvents: TimelineEvent[];
};

type ExtendedContract = Contract & {
  petType?: string;
  adoptionDate?: string;
  lastCertificationDate?: string;
};

type RiskTone = "urgent" | "caution" | "observe" | "normal";

const fallbackRows = [
  {
    adoptionDate: "2026.06.10",
    lastCertificationDate: "2026.07.25 (D+45)",
    petType: "푸들",
  },
  {
    adoptionDate: "2026.07.01",
    lastCertificationDate: "2026.07.26 (D+25)",
    petType: "고양이",
  },
  {
    adoptionDate: "2026.05.15",
    lastCertificationDate: "2026.07.15 (12일 지연)",
    petType: "리트리버",
  },
  {
    adoptionDate: "2026.07.28",
    lastCertificationDate: "2026.07.28 (D+3차)",
    petType: "믹스견",
  },
];

export function RiskView({
  applicantPhone,
  contracts,
}: RiskViewProps) {
  const [selectedContract, setSelectedContract] =
    useState<Contract | null>(null);

  const riskDashboardModalViewModel =
    getRiskDashboardModalViewModel(selectedContract?.id ?? null);

  const completedCount = contracts.filter((contract) =>
    isCompletedStatus(contract.status),
  ).length;

  const urgentCount = contracts.filter(
    (contract, index) =>
      getRiskTone(contract, index) === "urgent",
  ).length;

  const cautionCount = contracts.filter(
    (contract, index) =>
      getRiskTone(contract, index) === "caution",
  ).length;

  const observeCount = contracts.filter(
    (contract, index) =>
      getRiskTone(contract, index) === "observe",
  ).length;

  const normalCount = contracts.filter(
    (contract, index) =>
      getRiskTone(contract, index) === "normal",
  ).length;

  return (
    <AdminShell>
      <div className="mx-auto w-full space-y-5">
        {/* 페이지 제목 */}
        <section className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            입양 관리
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            입양자가 제출한 사후 보고를 검토하고 필요한 관리 조치를
            승인합니다.
          </p>
        </section>

        {/* 상태 필터 */}
        <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <StatusFilter
              label="전체"
              count={contracts.length}
              tone="all"
              active
            />

            <StatusFilter
              label="승인완료"
              count={completedCount}
              tone="completed"
            />

            <StatusFilter
              label="긴급"
              count={urgentCount}
              tone="urgent"
            />

            <StatusFilter
              label="주의"
              count={cautionCount}
              tone="caution"
            />

            <StatusFilter
              label="관찰"
              count={observeCount}
              tone="observe"
            />

            <StatusFilter
              label="정상"
              count={normalCount}
              tone="normal"
            />
          </div>

          <p className="shrink-0 px-2 text-xs font-medium text-slate-500">
            정기 알림 스케줄:{" "}
            <strong className="text-emerald-600">
              자동 가동중
            </strong>
          </p>
        </section>

        {/* 테이블 */}
        <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="w-full overflow-x-auto xl:overflow-x-hidden">
            <table className="w-full min-w-[960px] table-fixed border-collapse xl:min-w-0">
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "11%" }} />
              </colgroup>

              <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                <tr>
                  <th className="px-2 py-5 text-left">
                    입양자
                  </th>

                  <th className="px-2 py-5 text-left">
                    반려동물
                  </th>

                  <th className="px-2 py-5 text-left">
                    입양날짜
                  </th>

                  <th className="px-2 py-5 text-left">
                    마지막 인증일
                  </th>

                  <th className="px-2 py-5 text-center">
                    위험 등급
                  </th>

                  <th className="px-2 py-5 text-center">
                    승인 상태
                  </th>

                  <th className="px-2 py-5 text-center">
                    <span className="block text-sm">
                      대시보드
                    </span>

                    <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                      카드 및 미래 타임라인
                    </span>
                  </th>

                  <th className="px-2 py-5 text-center">
                    연락처
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {contracts.map((contract, index) => (
                  <ContractRow
                    key={contract.id}
                    applicantPhone={applicantPhone}
                    contract={contract}
                    index={index}
                    onOpenDashboard={() =>
                      setSelectedContract(contract)
                    }
                  />
                ))}

                {contracts.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-20 text-center text-sm text-slate-500"
                    >
                      사후관리 중인 입양 계약이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <RiskDashboardModal
        applicantPhone={applicantPhone}
        contract={riskDashboardModalViewModel.contract}
        dashboardData={riskDashboardModalViewModel.dashboardData}
        upcomingTimeline={riskDashboardModalViewModel.upcomingTimeline}
        certificationCards={riskDashboardModalViewModel.certificationCards}
        onClose={() => setSelectedContract(null)}
      />
    </AdminShell>
  );
}

function ContractRow({
  applicantPhone,
  contract,
  index,
  onOpenDashboard,
}: {
  applicantPhone: string;
  contract: Contract;
  index: number;
  onOpenDashboard: () => void;
}) {
  const extendedContract = contract as ExtendedContract;
  const fallback = fallbackRows[index % fallbackRows.length];

  const riskTone = getRiskTone(contract, index);
  const risk = riskStyle[riskTone];

  const approval = getApprovalStyle(
    contract.status,
    riskTone,
  );

  const adoptionDate =
    extendedContract.adoptionDate ??
    fallback.adoptionDate;

  const lastCertificationDate =
    extendedContract.lastCertificationDate ??
    fallback.lastCertificationDate;

  const petType =
    extendedContract.petType ??
    fallback.petType;

  const isDelayed =
    lastCertificationDate.includes("지연") ||
    riskTone === "urgent";

  const isNormal = riskTone === "normal";
  const isUrgent = riskTone === "urgent";

  const phoneHref = applicantPhone
    ? `tel:${normalizePhone(applicantPhone)}`
    : undefined;

  return (
    <tr
      className={[
        "transition-colors",
        getRowBackground(riskTone),
      ].join(" ")}
    >
      {/* 입양자 */}
      <td className="px-2 py-5 text-left">
        <p
          className="truncate text-sm font-extrabold text-slate-950"
          title={contract.adopterName}
        >
          {contract.adopterName}
        </p>
      </td>

      {/* 반려동물 */}
      <td className="px-2 py-5 text-left">
        <p
          className={[
            "break-keep text-sm font-extrabold leading-5",
            risk.petTextClass,
          ].join(" ")}
          title={`${contract.petName} (${petType})`}
        >
          {contract.petName}
        </p>

        <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
          {petType}

          {isNormal && (
            <span className="ml-1 text-blue-600">
              ★
            </span>
          )}
        </p>
      </td>

      {/* 입양날짜 */}
      <td className="px-2 py-5 text-left font-mono text-xs text-slate-500">
        <span className="break-keep">
          {adoptionDate}
        </span>
      </td>

      {/* 마지막 인증일 */}
      <td
        className={[
          "px-2 py-5 text-left font-mono",
          "text-xs font-semibold leading-5",
          isDelayed
            ? "text-red-600"
            : isNormal
              ? "text-emerald-700"
              : "text-slate-600",
        ].join(" ")}
      >
        <span className="break-keep">
          {lastCertificationDate}
        </span>
      </td>

      {/* 위험 등급 */}
      <td className="px-2 py-5 text-center">
        <span
          className={[
            "inline-flex items-center justify-center gap-1.5",
            "rounded-full border px-2.5 py-1.5",
            "text-xs font-bold",
            risk.badgeClass,
          ].join(" ")}
        >
          <span
            className={[
              "h-2.5 w-2.5 shrink-0 rounded-full",
              risk.dotClass,
            ].join(" ")}
          />

          {risk.label}
        </span>
      </td>

      {/* 승인 상태 */}
      <td className="px-2 py-5 text-center">
        <span
          className={[
            "inline-flex max-w-full items-center justify-center gap-1",
            "rounded-md border px-2 py-1.5",
            "break-keep text-xs font-bold leading-5",
            approval.className,
          ].join(" ")}
        >
          <span className="shrink-0" aria-hidden="true">
            {approval.icon}
          </span>

          <span>
            {approval.label}
          </span>
        </span>
      </td>

      {/* 대시보드 */}
      <td className="px-2 py-5 text-center">
        <button
          type="button"
          onClick={onOpenDashboard}
          className={[
            "mx-auto inline-flex h-10 w-full max-w-[145px]",
            "items-center justify-center gap-1.5",
            "rounded-lg px-2",
            "text-xs font-bold text-white shadow-sm",
            "transition-colors",
            isNormal
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-slate-800 hover:bg-slate-700",
          ].join(" ")}
        >
          <span aria-hidden="true">
            📋
          </span>

          <span className="break-keep">
            대시보드 열람
          </span>
        </button>
      </td>

      {/* 연락처 */}
      <td className="px-2 py-5 text-center">
        <div className="mx-auto flex w-full max-w-[105px] flex-col items-center gap-1.5">
          <p
            className="w-full truncate font-mono text-[9px] font-semibold text-slate-500"
            title={applicantPhone}
          >
            {applicantPhone || "-"}
          </p>

          {phoneHref ? (
            <a
              href={phoneHref}
              className={[
                "inline-flex h-9 w-full items-center justify-center",
                "rounded-md border px-1.5",
                "text-[11px] font-bold shadow-sm",
                "transition-colors",
                isUrgent
                  ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {isUrgent
                ? "🚨 긴급"
                : "📞 통화"}
            </a>
          ) : (
            <span className="text-xs text-slate-400">
              연락처 없음
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function getRiskTone(
  contract: Contract,
  index = 0,
): RiskTone {
  const status = (contract.status ?? "").toLowerCase();
  const nextCheck = (contract.nextCheck ?? "").toLowerCase();

  if (
    contract.risk === "urgent" ||
    status.includes("긴급") ||
    status.includes("지연") ||
    nextCheck.includes("긴급") ||
    nextCheck.includes("지연")
  ) {
    return "urgent";
  }

  if (
    status.includes("주의") ||
    status.includes("검토")
  ) {
    return "caution";
  }

  if (
    status.includes("관찰") ||
    status.includes("확인")
  ) {
    return "observe";
  }

  if (
    status.includes("정상") ||
    status.includes("승인 완료")
  ) {
    return "normal";
  }

  const fallbackTones: RiskTone[] = [
    "caution",
    "urgent",
    "observe",
    "normal",
  ];

  return fallbackTones[index % fallbackTones.length];
}

function getApprovalStyle(
  status: string,
  riskTone: RiskTone,
) {
  const normalized = (status ?? "").toLowerCase();

  if (riskTone === "urgent") {
    return {
      label: "조치후 승인완료",
      icon: "✓",
      className:
        "border-slate-200 bg-slate-200 text-slate-700",
    };
  }

  if (
    riskTone === "normal" ||
    normalized.includes("승인 완료")
  ) {
    return {
      label: "승인 완료",
      icon: "✓",
      className:
        "border-emerald-300 bg-emerald-50 text-emerald-700",
    };
  }

  if (
    normalized.includes("완료") ||
    normalized.includes("승인")
  ) {
    return {
      label: "확인후 승인완료",
      icon: "✓",
      className:
        "border-slate-200 bg-slate-200 text-slate-700",
    };
  }

  return {
    label: "검토대기 (미승인)",
    icon: "⌛",
    className:
      "border-red-300 bg-red-50 text-red-600",
  };
}

function isCompletedStatus(status: string) {
  const normalized = (status ?? "").toLowerCase();

  return (
    normalized.includes("완료") ||
    normalized.includes("승인")
  );
}

const riskStyle: Record<
  RiskTone,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    petTextClass: string;
  }
> = {
  urgent: {
    label: "긴급",
    badgeClass:
      "border-red-300 bg-red-50 text-red-700",
    dotClass:
      "bg-gradient-to-br from-red-300 to-red-600",
    petTextClass:
      "text-red-600",
  },

  caution: {
    label: "주의",
    badgeClass:
      "border-orange-300 bg-orange-50 text-orange-700",
    dotClass:
      "bg-gradient-to-br from-orange-200 to-orange-500",
    petTextClass:
      "text-orange-700",
  },

  observe: {
    label: "관찰",
    badgeClass:
      "border-yellow-300 bg-yellow-50 text-yellow-700",
    dotClass:
      "bg-gradient-to-br from-yellow-200 to-yellow-500",
    petTextClass:
      "text-amber-700",
  },

  normal: {
    label: "정상",
    badgeClass:
      "border-emerald-300 bg-emerald-50 text-emerald-700",
    dotClass:
      "bg-gradient-to-br from-emerald-200 to-emerald-500",
    petTextClass:
      "text-blue-600",
  },
};

function getRowBackground(
  riskTone: RiskTone,
) {
  if (riskTone === "urgent") {
    return "bg-red-50/60 hover:bg-red-50";
  }

  if (riskTone === "caution") {
    return "bg-orange-50/50 hover:bg-orange-50";
  }

  if (riskTone === "observe") {
    return "bg-yellow-50/50 hover:bg-yellow-50";
  }

  return "bg-emerald-50/30 hover:bg-emerald-50/50";
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function StatusFilter({
  label,
  count,
  tone,
  active = false,
}: {
  label: string;
  count: number;
  tone:
    | "all"
    | "completed"
    | "urgent"
    | "caution"
    | "observe"
    | "normal";
  active?: boolean;
}) {
  const className = active
    ? "border-slate-900 bg-slate-900 text-white"
    : {
        all:
          "border-slate-300 bg-white text-slate-700",

        completed:
          "border-orange-200 bg-orange-50 text-orange-700",

        urgent:
          "border-red-200 bg-red-50 text-red-600",

        caution:
          "border-orange-200 bg-orange-50 text-orange-700",

        observe:
          "border-yellow-300 bg-yellow-50 text-yellow-700",

        normal:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      }[tone];

  return (
    <button
      type="button"
      className={[
        "rounded-lg border px-3 py-2",
        "text-xs font-bold transition",
        "hover:brightness-95",
        className,
      ].join(" ")}
    >
      {label} ({count})
    </button>
  );
}
