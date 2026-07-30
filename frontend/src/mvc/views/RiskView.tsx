"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  Contract,
  RiskCertificationCard,
  RiskConfig,
  RiskDashboardData,
  RiskUpcomingTimeline,
  TimelineEvent,
} from "@/mvc/models/adminModel";
import { AdminShell } from "@/mvc/views/AdminShell";
import { RiskDashboardModal } from "@/mvc/views/RiskDashboardModal";

type RiskViewProps = {
  contracts: Contract[];
  applicantPhone: string;
  timelineEvents: TimelineEvent[];
  modalViewModels?: Record<string, RiskDashboardModalViewModel>;
  riskConfig: RiskConfig;
};

type RiskDashboardModalViewModel = {
  contract: Contract | null;
  dashboardData: RiskDashboardData | null;
  upcomingTimeline: RiskUpcomingTimeline | null;
  certificationCards: RiskCertificationCard[];
};

type ExtendedContract = Contract & {
  petType?: string;
  adoptionDate?: string;
  lastCertificationDate?: string;
};

type RiskTone = "urgent" | "caution" | "observe" | "normal";

const text = {
  title: "\uC785\uC591 \uAD00\uB9AC",
  description:
    "\uC785\uC591\uC790\uAC00 \uC81C\uCD9C\uD55C \uC0AC\uD6C4 \uBCF4\uACE0\uB97C \uAC80\uD1A0\uD558\uACE0 \uD544\uC694\uD55C \uAD00\uB9AC \uC870\uCE58\uB97C \uC2B9\uC778\uD569\uB2C8\uB2E4.",
  form: "\uD3FC \uC785\uB825",
  all: "\uC804\uCCB4",
  approved: "\uC2B9\uC778\uC644\uB8CC",
  urgent: "\uAE34\uAE09",
  caution: "\uC8FC\uC758",
  observe: "\uAD00\uCC30",
  normal: "\uC815\uC0C1",
  schedule: "\uC815\uAE30 \uC54C\uB9BC \uC2A4\uCF00\uC904:",
  active: "\uC790\uB3D9 \uAC00\uB3D9\uC911",
  adopter: "\uC785\uC591\uC790",
  pet: "\uBC18\uB824\uB3D9\uBB3C",
  adoptionDate: "\uC785\uC591\uB0A0\uC9DC",
  lastCert: "\uB9C8\uC9C0\uB9C9 \uC778\uC99D\uC77C",
  riskGrade: "\uC704\uD5D8 \uB4F1\uAE09",
  approvalStatus: "\uC2B9\uC778 \uC0C1\uD0DC",
  dashboard: "\uB300\uC2DC\uBCF4\uB4DC",
  dashboardHint: "\uCE74\uB4DC \uBC0F \uBBF8\uB798 \uD0C0\uC784\uB77C\uC778",
  phone: "\uC5F0\uB77D\uCC98",
  empty: "\uC0AC\uD6C4\uAD00\uB9AC \uC911\uC778 \uC785\uC591 \uACC4\uC57D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  openDashboard: "\uB300\uC2DC\uBCF4\uB4DC \uC5F4\uB78C",
  call: "\uD1B5\uD654",
  noPhone: "\uC5F0\uB77D\uCC98 \uC5C6\uC74C",
  approveDone: "\uC2B9\uC778 \uC644\uB8CC",
  approveAfterCheck: "\uD655\uC778 \uD6C4 \uC2B9\uC778\uC644\uB8CC",
  approveAfterAction: "\uC870\uCE58 \uD6C4 \uC2B9\uC778\uC644\uB8CC",
  reviewPending: "\uAC80\uD1A0\uB300\uAE30 (\uBBF8\uC2B9\uC778)",
  certApproved: "\uC778\uC99D \uC2B9\uC778 \uC644\uB8CC",
};

export function RiskView({
  applicantPhone,
  contracts,
  modalViewModels = {},
  riskConfig,
}: RiskViewProps) {
  const [localContracts, setLocalContracts] = useState(contracts);
  const [localModalViewModels, setLocalModalViewModels] =
    useState(modalViewModels);
  const [selectedContract, setSelectedContract] =
    useState<Contract | null>(null);

  const riskDashboardModalViewModel = selectedContract
    ? localModalViewModels[selectedContract.id] ?? {
        contract: selectedContract,
        dashboardData: null,
        upcomingTimeline: null,
        certificationCards: [],
      }
    : {
        contract: null,
        dashboardData: null,
        upcomingTimeline: null,
        certificationCards: [],
      };

  const completedCount = localContracts.filter((contract) =>
    isCompletedStatus(contract.status),
  ).length;
  const urgentCount = localContracts.filter(
    (contract, index) => getRiskTone(contract, index) === "urgent",
  ).length;
  const cautionCount = localContracts.filter(
    (contract, index) => getRiskTone(contract, index) === "caution",
  ).length;
  const observeCount = localContracts.filter(
    (contract, index) => getRiskTone(contract, index) === "observe",
  ).length;
  const normalCount = localContracts.filter(
    (contract, index) => getRiskTone(contract, index) === "normal",
  ).length;

  const handleCertificationApprove = (
    contractId: string,
    certificationId: string,
    approvedStatus: string,
  ) => {
    setLocalContracts((previousContracts) =>
      previousContracts.map((contract) =>
        contract.id === contractId
          ? {
              ...contract,
              status: text.approveDone,
              nextCheck: text.certApproved,
              risk: "normal",
            }
          : contract,
      ),
    );

    setSelectedContract((contract) =>
      contract?.id === contractId
        ? {
            ...contract,
            status: text.approveDone,
            nextCheck: text.certApproved,
            risk: "normal",
          }
        : contract,
    );

    setLocalModalViewModels((previous) => {
      const current = previous[contractId];
      if (!current) {
        return previous;
      }

      const approvedContract = current.contract
        ? {
            ...current.contract,
            status: text.approveDone,
            nextCheck: text.certApproved,
            risk: "normal" as const,
          }
        : current.contract;

      return {
        ...previous,
        [contractId]: {
          ...current,
          contract: approvedContract,
          dashboardData: current.dashboardData
            ? {
                ...current.dashboardData,
                headerStatus: text.approveDone,
                headerBadgeClass:
                  "border-emerald-400 bg-emerald-500 text-white",
                headerDotClass: "bg-emerald-200",
              }
            : current.dashboardData,
          certificationCards: current.certificationCards.map((card) =>
            card.id === certificationId
              ? {
                  ...card,
                  tone: "approved",
                  status: approvedStatus,
                }
              : card,
          ),
        },
      };
    });
  };

  return (
    <AdminShell>
      <div className="mx-auto w-full space-y-5">
        <section className="border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              {text.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{text.description}</p>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <StatusFilter label={text.all} count={localContracts.length} tone="all" active />
            <StatusFilter label={text.approved} count={completedCount} tone="completed" />
            <StatusFilter label={text.urgent} count={urgentCount} tone="urgent" />
            <StatusFilter label={text.caution} count={cautionCount} tone="caution" />
            <StatusFilter label={text.observe} count={observeCount} tone="observe" />
            <StatusFilter label={text.normal} count={normalCount} tone="normal" />
          </div>
          <p className="shrink-0 px-2 text-xs font-medium text-slate-500">
            {text.schedule} <strong className="text-emerald-600">{text.active}</strong>
          </p>
        </section>

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
                  <th className="px-2 py-5 text-left">{text.adopter}</th>
                  <th className="px-2 py-5 text-left">{text.pet}</th>
                  <th className="px-2 py-5 text-left">{text.adoptionDate}</th>
                  <th className="px-2 py-5 text-left">{text.lastCert}</th>
                  <th className="px-2 py-5 text-center">{text.riskGrade}</th>
                  <th className="px-2 py-5 text-center">{text.approvalStatus}</th>
                  <th className="px-2 py-5 text-center">
                    <span className="block text-sm">{text.dashboard}</span>
                    <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                      {text.dashboardHint}
                    </span>
                  </th>
                  <th className="px-2 py-5 text-center">{text.phone}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {localContracts.map((contract, index) => (
                  <ContractRow
                    key={contract.id}
                    applicantPhone={applicantPhone}
                    contract={contract}
                    fallbackRows={riskConfig.fallbackRows}
                    index={index}
                    onOpenDashboard={() => setSelectedContract(contract)}
                  />
                ))}
                {localContracts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center text-sm text-slate-500">
                      {text.empty}
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
        riskConfig={riskConfig}
        onCertificationApprove={handleCertificationApprove}
        onClose={() => setSelectedContract(null)}
      />
    </AdminShell>
  );
}

function ContractRow({
  applicantPhone,
  contract,
  fallbackRows,
  index,
  onOpenDashboard,
}: {
  applicantPhone: string;
  contract: Contract;
  fallbackRows: RiskConfig["fallbackRows"];
  index: number;
  onOpenDashboard: () => void;
}) {
  const extendedContract = contract as ExtendedContract;
  const fallback = fallbackRows[index % fallbackRows.length] ?? {
    adoptionDate: "",
    lastCertificationDate: "",
    petType: "",
  };
  const riskTone = getRiskTone(contract, index);
  const risk = riskStyle[riskTone];
  const approval = getApprovalStyle(contract.status, riskTone);
  const adoptionDate = extendedContract.adoptionDate ?? fallback.adoptionDate;
  const lastCertificationDate = extendedContract.lastCertificationDate ?? fallback.lastCertificationDate;
  const petType = extendedContract.petType ?? fallback.petType;
  const isDelayed = lastCertificationDate.includes("\uC9C0\uC5F0") || riskTone === "urgent";
  const isMissingSubmission =
    contract.status.includes("\uBBF8\uC81C\uCD9C") ||
    contract.nextCheck.includes("\uBBF8\uC81C\uCD9C") ||
    lastCertificationDate.includes("\uBBF8\uC81C\uCD9C");
  const isNormal = riskTone === "normal";
  const phoneHref = applicantPhone ? `tel:${normalizePhone(applicantPhone)}` : undefined;

  return (
    <tr className={["transition-colors", getRowBackground(riskTone)].join(" ")}>
      <td className="px-2 py-5 text-left">
        <p className="truncate text-sm font-extrabold text-slate-950" title={contract.adopterName}>
          {contract.adopterName}
        </p>
      </td>
      <td className="px-2 py-5 text-left">
        <p className={["break-keep text-sm font-extrabold leading-5", risk.petTextClass].join(" ")} title={`${contract.petName} (${petType})`}>
          {contract.petName}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
          {petType}{isNormal && <span className="ml-1 text-blue-600">OK</span>}
        </p>
      </td>
      <td className="px-2 py-5 text-left font-mono text-xs text-slate-500"><span className="break-keep">{adoptionDate}</span></td>
      <td className={["px-2 py-5 text-left font-mono", "text-xs font-semibold leading-5", isDelayed ? "text-red-600" : isNormal ? "text-emerald-700" : "text-slate-600"].join(" ")}>
        <span className="break-keep">{lastCertificationDate}</span>
      </td>
      <td className="px-2 py-5 text-center">
        <span className={["inline-flex items-center justify-center gap-1.5", "rounded-full border px-2.5 py-1.5", "text-xs font-bold", risk.badgeClass].join(" ")}>
          <span className={["h-2.5 w-2.5 shrink-0 rounded-full", risk.dotClass].join(" ")} />{risk.label}
        </span>
      </td>
      <td className="px-2 py-5 text-center">
        <span className={["inline-flex max-w-full items-center justify-center gap-1", "rounded-md border px-2 py-1.5", "break-keep text-xs font-bold leading-5", approval.className].join(" ")}>
          <span className="shrink-0" aria-hidden="true">{approval.icon}</span><span>{approval.label}</span>
        </span>
      </td>
      <td className="px-2 py-5 text-center">
        <div className="mx-auto flex w-full max-w-[145px] flex-col gap-1.5">
          <button type="button" onClick={onOpenDashboard} className={["inline-flex h-10 w-full", "items-center justify-center gap-1.5", "rounded-lg px-2", "text-xs font-bold text-white shadow-sm", "transition-colors", isNormal ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800 hover:bg-slate-700"].join(" ")}>
            <span aria-hidden="true">▣</span><span className="break-keep">{text.openDashboard}</span>
          </button>
          {isMissingSubmission && (
            <Link href={buildCertificationHref(contract, adoptionDate)} className="inline-flex h-7 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50">
              {text.form}
            </Link>
          )}
        </div>
      </td>
      <td className="px-2 py-5 text-center">
        <div className="mx-auto flex w-full max-w-[105px] flex-col items-center gap-1.5">
          <p className="w-full truncate font-mono text-[9px] font-semibold text-slate-500" title={applicantPhone}>{applicantPhone || "-"}</p>
          {!phoneHref && (
            <span className="text-xs text-slate-400">{text.noPhone}</span>
          )}
        </div>
      </td>
    </tr>
  );
}

function getRiskTone(contract: Contract, index = 0): RiskTone {
  const status = (contract.status ?? "").toLowerCase();
  const nextCheck = (contract.nextCheck ?? "").toLowerCase();
  if (contract.risk === "urgent" || status.includes("\uAE34\uAE09") || status.includes("\uC9C0\uC5F0") || nextCheck.includes("\uAE34\uAE09") || nextCheck.includes("\uC9C0\uC5F0")) {
    return "urgent";
  }
  if (status.includes("\uC8FC\uC758") || status.includes("\uAC80\uD1A0")) {
    return "caution";
  }
  if (status.includes("\uAD00\uCC30") || status.includes("\uD655\uC778")) {
    return "observe";
  }
  if (status.includes("\uC815\uC0C1") || status.includes("\uC2B9\uC778 \uC644\uB8CC")) {
    return "normal";
  }
  const fallbackTones: RiskTone[] = ["caution", "urgent", "observe", "normal"];
  return fallbackTones[index % fallbackTones.length];
}

function getApprovalStyle(status: string, riskTone: RiskTone) {
  const normalized = (status ?? "").toLowerCase();
  if (riskTone === "urgent") {
    return { label: text.approveAfterAction, icon: "!", className: "border-slate-200 bg-slate-200 text-slate-700" };
  }
  if (riskTone === "normal" || normalized.includes("\uC2B9\uC778 \uC644\uB8CC")) {
    return { label: text.approveDone, icon: "OK", className: "border-emerald-300 bg-emerald-50 text-emerald-700" };
  }
  if (normalized.includes("\uC644\uB8CC") || normalized.includes("\uC2B9\uC778")) {
    return { label: text.approveAfterCheck, icon: "OK", className: "border-slate-200 bg-slate-200 text-slate-700" };
  }
  return { label: text.reviewPending, icon: "!", className: "border-red-300 bg-red-50 text-red-600" };
}

function isCompletedStatus(status: string) {
  const normalized = (status ?? "").toLowerCase();
  return normalized.includes("\uC644\uB8CC") || normalized.includes("\uC2B9\uC778");
}

const riskStyle: Record<RiskTone, { label: string; badgeClass: string; dotClass: string; petTextClass: string }> = {
  urgent: { label: text.urgent, badgeClass: "border-red-300 bg-red-50 text-red-700", dotClass: "bg-gradient-to-br from-red-300 to-red-600", petTextClass: "text-red-600" },
  caution: { label: text.caution, badgeClass: "border-orange-300 bg-orange-50 text-orange-700", dotClass: "bg-gradient-to-br from-orange-200 to-orange-500", petTextClass: "text-orange-700" },
  observe: { label: text.observe, badgeClass: "border-yellow-300 bg-yellow-50 text-yellow-700", dotClass: "bg-gradient-to-br from-yellow-200 to-yellow-500", petTextClass: "text-amber-700" },
  normal: { label: text.normal, badgeClass: "border-emerald-300 bg-emerald-50 text-emerald-700", dotClass: "bg-gradient-to-br from-emerald-200 to-emerald-500", petTextClass: "text-blue-600" },
};

function getRowBackground(riskTone: RiskTone) {
  if (riskTone === "urgent") return "bg-red-50/60 hover:bg-red-50";
  if (riskTone === "caution") return "bg-orange-50/50 hover:bg-orange-50";
  if (riskTone === "observe") return "bg-yellow-50/50 hover:bg-yellow-50";
  return "bg-emerald-50/30 hover:bg-emerald-50/50";
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function buildCertificationHref(contract: Contract, adoptionDate: string) {
  const params = new URLSearchParams({
    petId: contract.id,
    petName: contract.petName,
    adopterName: contract.adopterName,
    adoptionDate,
  });

  if (contract.certificationRound) {
    params.set("round", String(contract.certificationRound));
  }

  return `/certification?${params.toString()}`;
}

function StatusFilter({ label, count, tone, active = false }: { label: string; count: number; tone: "all" | "completed" | "urgent" | "caution" | "observe" | "normal"; active?: boolean }) {
  const className = active
    ? "border-slate-900 bg-slate-900 text-white"
    : {
        all: "border-slate-300 bg-white text-slate-700",
        completed: "border-orange-200 bg-orange-50 text-orange-700",
        urgent: "border-red-200 bg-red-50 text-red-600",
        caution: "border-orange-200 bg-orange-50 text-orange-700",
        observe: "border-yellow-300 bg-yellow-50 text-yellow-700",
        normal: "border-emerald-200 bg-emerald-50 text-emerald-700",
      }[tone];
  return (
    <button type="button" className={["rounded-lg border px-3 py-2", "text-xs font-bold transition", "hover:brightness-95", className].join(" ")}>
      {label} ({count})
    </button>
  );
}
