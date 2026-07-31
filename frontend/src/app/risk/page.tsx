import type {
  Contract,
  RiskApprovalStatus,
  RiskCertificationCard,
  RiskConfig,
  RiskDashboardData,
  RiskLevel,
  RiskManagementItem,
  RiskUpcomingTimeline,
  TimelineEvent,
} from "@/mvc/models/adminModel";
import { RiskView } from "@/mvc/views/RiskView";

type RiskDashboardModalViewModel = {
  contract: Contract | null;
  dashboardData: RiskDashboardData | null;
  upcomingTimeline: RiskUpcomingTimeline | null;
  certificationCards: RiskCertificationCard[];
};

type RiskDashboardPageData = {
  contracts: Contract[];
  applicantPhone: string;
  timelineEvents: TimelineEvent[];
  modalViewModels: Record<string, RiskDashboardModalViewModel>;
  riskConfig: RiskConfig;
};

export default async function RiskPage() {
  const viewModel = await getRiskDashboardFromBackend();

  return <RiskView contracts={toRiskManagementItems(viewModel)} />;
}

/* ==============================
 * 백엔드 응답 -> 화면 데이터 변환
 * ============================== */

function toRiskManagementItems(
  data: RiskDashboardPageData,
): RiskManagementItem[] {
  return data.contracts.map((contract) => {
    const modal = data.modalViewModels?.[contract.id];
    const certificationCards = modal?.certificationCards ?? [];
    const certification = resolveCertificationDates(
      contract.lastCertificationDate,
    );

    return {
      id: contract.id,
      petId: contract.id,
      adopterName: contract.adopterName,
      petName: contract.petName,
      petBreed: contract.petType ?? "정보 없음",
      contact: contract.applicantPhone ?? "연락처 미등록",
      adoptionDate: contract.adoptionDate ?? contract.signedAt,
      lastCertificationDate: certification.lastCertificationDate,
      certificationDueDate: certification.certificationDueDate,
      riskLevel: toRiskLevel(contract),
      approvalStatus: toApprovalStatus(certificationCards),
      contract: modal?.contract ?? contract,
      dashboardData: modal?.dashboardData ?? null,
      upcomingTimeline: modal?.upcomingTimeline ?? null,
      certificationCards,
    };
  });
}

/**
 * 백엔드의 lastCertificationDate는 "2026.07.29 (D+90)" 또는
 * "2026.03.18 미제출 (15일 지연)" 형태의 라벨입니다.
 * 지연/미제출 라벨이면 기한 초과로 다루고, 그 외에는 인증일로 다룹니다.
 */
function resolveCertificationDates(label?: string | null) {
  if (!label) {
    return {
      lastCertificationDate: undefined,
      certificationDueDate: undefined,
    };
  }

  const isoDate = extractIsoDate(label);

  if (!isoDate) {
    return {
      lastCertificationDate: label,
      certificationDueDate: undefined,
    };
  }

  const isOverdue =
    label.includes("미제출") || label.includes("지연");

  return {
    lastCertificationDate: isOverdue ? undefined : isoDate,
    certificationDueDate: isOverdue ? isoDate : undefined,
  };
}

function extractIsoDate(value: string) {
  const matched = value.match(
    /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/,
  );

  if (!matched) {
    return null;
  }

  const [, year, month, day] = matched;

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function toRiskLevel(contract: Contract): RiskLevel {
  const statusText = [contract.status, contract.nextCheck]
    .filter(Boolean)
    .join(" ");

  if (statusText.includes("긴급")) {
    return "urgent";
  }
  if (statusText.includes("주의")) {
    return "warning";
  }
  if (statusText.includes("관찰")) {
    return "watch";
  }
  if (statusText.includes("정상")) {
    return "normal";
  }

  return contract.risk === "urgent"
    ? "urgent"
    : contract.risk === "normal"
      ? "normal"
      : "warning";
}

function toApprovalStatus(
  certificationCards: RiskCertificationCard[],
): RiskApprovalStatus {
  const latest = certificationCards[0];

  if (!latest) {
    return "pending";
  }

  return latest.status.includes("승인완료")
    ? "approved"
    : "pending";
}

/* ==============================
 * 백엔드 호출
 * ============================== */

async function getRiskDashboardFromBackend(): Promise<RiskDashboardPageData> {
  const response = await fetch(
    `${getBackendBaseUrl()}/api/risk/dashboard`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Risk dashboard API request failed.");
  }

  const result = (await response.json()) as {
    data: RiskDashboardPageData;
  };

  return result.data;
}

function getBackendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000"
  );
}
