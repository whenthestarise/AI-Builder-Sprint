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

const DEFAULT_CERTIFICATION_IMAGE_URL = "/default-animal-photo.svg";

export default async function RiskPage() {
  const viewModel = await getRiskDashboardFromBackend();

  return <RiskView contracts={toRiskManagementItems(viewModel)} />;
}

function toRiskManagementItems(
  data: RiskDashboardPageData,
): RiskManagementItem[] {
  return data.contracts.flatMap((contract) => {
    const modal = data.modalViewModels?.[contract.id];
    const certificationCards = modal?.certificationCards ?? [];

    return [
      {
        id: contract.id,
        petId: contract.petId ?? contract.id,
        adopterName: contract.adopterName,
        petName: contract.petName,
        petBreed: contract.petType ?? "정보 없음",
        contact: contract.applicantPhone ?? "연락처 미등록",
        adoptionDate: contract.adoptionDate ?? contract.signedAt,
        lastCertificationDate: contract.lastCertificationDate ?? undefined,
        certificationDueDate: undefined,
        riskLevel: toRiskLevel(contract, modal?.dashboardData ?? null),
        approvalStatus: toApprovalStatus(certificationCards),
        contract: modal?.contract ?? contract,
        dashboardData: modal?.dashboardData ?? null,
        upcomingTimeline: modal?.upcomingTimeline ?? null,
        certificationCards,
      },
    ];
  });
}

function toRiskLevel(
  contract: Contract,
  dashboardData?: RiskDashboardData | null,
): RiskLevel {
  const manualRisk = toRiskLevelFromManualGrade(
    dashboardData?.manualGrade,
  );

  if (manualRisk) {
    return manualRisk;
  }

  switch (contract.risk) {
    case "urgent":
      return "urgent";
    case "normal":
      return "normal";
    case "warning":
      return "warning";
    default:
      return "watch";
  }
}

function toRiskLevelFromManualGrade(
  manualGrade?: string | null,
): RiskLevel | null {
  switch (manualGrade) {
    case "urgent":
      return "urgent";
    case "caution":
      return "warning";
    case "observe":
      return "watch";
    case "normal":
      return "normal";
    default:
      return null;
  }
}

function toApprovalStatus(
  certificationCards: RiskCertificationCard[],
): RiskApprovalStatus {
  if (certificationCards.length === 0) return "approved";

  const isApprovedCard = (card: RiskCertificationCard) =>
    card.status === "APPROVED" ||
    card.status.includes("\uc2b9\uc778\uc644\ub8cc");

  const allApproved = certificationCards.every(isApprovedCard);

  if (!allApproved) return "pending";

  const isActionApproved = certificationCards.some((card) =>
    card.status.includes("\uc870\uce58 \ud6c4 \uc2b9\uc778\uc644\ub8cc"),
  );

  if (isActionApproved) return "actionApproved";

  return "approved";
}

async function getRiskDashboardFromBackend(): Promise<RiskDashboardPageData> {
  const backendUrls = getBackendBaseUrls();
  const dashboards: RiskDashboardPageData[] = [];

  for (const backendUrl of backendUrls) {
    try {
      const response = await fetch(
        `${backendUrl}/api/risk/dashboard`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        continue;
      }

      const result = (await response.json()) as {
        data: RiskDashboardPageData;
      };

      dashboards.push(result.data);
    } catch {
      continue;
    }
  }

  if (dashboards.length > 0) {
    return mergeRiskDashboardData(dashboards);
  }

  return getFallbackRiskDashboardData();
}

function mergeRiskDashboardData(
  dashboards: RiskDashboardPageData[],
): RiskDashboardPageData {
  const [primary] = dashboards;
  const contracts = new Map<string, Contract>();
  const modalViewModels: Record<string, RiskDashboardModalViewModel> = {};
  const timelineEvents = new Map<string, TimelineEvent>();

  for (const dashboard of dashboards) {
    for (const contract of dashboard.contracts) {
      if (isEmptyPhoneKimMinsooContract(contract)) {
        continue;
      }

      if (!contracts.has(contract.id)) {
        contracts.set(contract.id, contract);
      }
    }

    for (const [contractId, modal] of Object.entries(
      dashboard.modalViewModels ?? {},
    )) {
      if (!modalViewModels[contractId]) {
        modalViewModels[contractId] = modal;
      }
    }

    for (const event of dashboard.timelineEvents ?? []) {
      if (!timelineEvents.has(event.id)) {
        timelineEvents.set(event.id, event);
      }
    }
  }

  return {
    contracts: Array.from(contracts.values()).sort((left, right) =>
      String(right.signedAt).localeCompare(String(left.signedAt)),
    ),
    applicantPhone:
      dashboards.find((dashboard) => dashboard.applicantPhone)
        ?.applicantPhone ?? "",
    timelineEvents: Array.from(timelineEvents.values()),
    modalViewModels,
    riskConfig: primary.riskConfig,
  };
}

function isEmptyPhoneKimMinsooContract(contract: Contract) {
  return (
    contract.adopterName === "김민수" &&
    !contract.applicantPhone?.trim()
  );
}

function getBackendBaseUrls() {
  return Array.from(
    new Set(
      [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://192.168.56.1:8000",
        process.env.NEXT_PUBLIC_API_BASE_URL,
        process.env.API_BASE_URL,
        "http://113.131.34.14:8000",
      ]
        .filter((value): value is string => Boolean(value?.trim()))
        .map((value) => value.trim().replace(/\/$/, "")),
    ),
  );
}

function getFallbackRiskDashboardData(): RiskDashboardPageData {
  const contracts: Contract[] = [
    {
      id: "CONTRACT-DEMO-CHOCO-001",
      petName: "초코",
      adopterName: "강민수",
      applicantPhone: "010-4444-5555",
      status: "검토대기",
      signedAt: "2026-07-31",
      nextCheck: "D+7 인증 제출 완료",
      risk: "warning",
      petType: "시바견",
      adoptionDate: "2026-07-31",
      lastCertificationDate: "2026.08.02 (D+2)",
      certificationRound: 2,
    },
    {
      id: "CONTRACT-DEMO-TOFU-001",
      petName: "두부",
      adopterName: "정다은",
      applicantPhone: "010-3333-2222",
      status: "승인완료 (2026.07.29)",
      signedAt: "2026-06-01",
      nextCheck: "D+90 인증 제출 완료",
      risk: "normal",
      petType: "포메라니안",
      adoptionDate: "2026-06-01",
      lastCertificationDate: "2026.07.29 (D+58)",
      certificationRound: 4,
    },
    {
      id: "CONTRACT-DEMO-BORI-001",
      petName: "보리",
      adopterName: "박서준",
      applicantPhone: "010-5555-4444",
      status: "미제출 (15일 지연)",
      signedAt: "2026-02-01",
      nextCheck: "미제출 (15일 지연)",
      risk: "urgent",
      petType: "반려동물",
      adoptionDate: "2026-02-01",
      lastCertificationDate: "2026.07.30 (4일 지연)",
      certificationRound: 3,
    },
    {
      id: "CONTRACT-DEMO-KONGI-001",
      petName: "콩이",
      adopterName: "이지은",
      applicantPhone: "010-9876-5432",
      status: "승인완료 (2026.08.03)",
      signedAt: "2025-07-10",
      nextCheck: "D+90 인증 제출 완료",
      risk: "normal",
      petType: "푸들",
      adoptionDate: "2025-07-10",
      lastCertificationDate: "2026.06.10 (D+335)",
      certificationRound: 4,
    },
  ];

  return {
    contracts,
    applicantPhone: "010-3333-2222",
    timelineEvents: [],
    modalViewModels: Object.fromEntries(
      contracts.map((contract) => [
        contract.id,
        {
          contract,
          dashboardData: {
            headerStatus:
              contract.risk === "urgent"
                ? "긴급 조치 필요"
                : contract.risk === "warning"
                  ? "관찰"
                  : "정상",
            headerBadgeClass:
              contract.risk === "urgent"
                ? "border-red-400 bg-red-500 text-white"
                : contract.risk === "warning"
                  ? "border-yellow-400 bg-yellow-400 text-yellow-950"
                  : "border-emerald-400 bg-emerald-500 text-white",
            headerDotClass:
              contract.risk === "urgent"
                ? "bg-red-200"
                : contract.risk === "warning"
                  ? "bg-yellow-200"
                  : "bg-emerald-200",
            behaviorTrait: "안부 인증 모니터링",
            signedDate: (contract.adoptionDate ?? contract.signedAt).replaceAll(
              "-",
              ".",
            ),
            lastCertificationDate: contract.lastCertificationDate,
          },
          upcomingTimeline: {
            label: "다음 예정",
            title: "정기 안부 인증",
            description: "예정된 다음 안부 인증을 확인하세요.",
            buttonLabel: "알림 보내기",
          },
          certificationCards: getFallbackCertificationCards(contract),
        },
      ]),
    ),
    riskConfig: {
      gradeOptions: [],
      reasonCategories: [],
      actionOptions: [],
      fallbackRows: [],
    },
  };
}

function getFallbackCertificationCards(
  contract: Contract,
): RiskCertificationCard[] {
  const card = (
    id: string,
    submittedAt: string,
    roundLabel: string,
    status: string,
  ): RiskCertificationCard => ({
    id,
    contractId: contract.id,
    tone: status.includes("PENDING") ? "caution" : "approved",
    title: `${roundLabel} 안부 인증`,
    description: "안부 인증 카드입니다.",
    status,
    submittedAt,
    roundLabel,
    imageUrl: DEFAULT_CERTIFICATION_IMAGE_URL,
    answers: [],
  });

  if (contract.id.includes("CHOCO")) {
    return [
      card("CERT-DEMO-CHOCO-002", "2026.08.02 13:00", "2회차 (D+7)", "PENDING"),
      card("CERT-DEMO-CHOCO-001", "2026.08.01 13:00", "1회차 (D+3)", "승인완료 (2026.08.01)"),
    ];
  }

  if (contract.id.includes("TOFU")) {
    return [
      card("CERT-DEMO-TOFU-004", "2026.07.29 11:00", "4회차 (D+90)", "승인완료 (2026.07.29)"),
      card("CERT-DEMO-TOFU-003", "2026.07.01 11:00", "3회차 (D+30)", "승인완료 (2026.07.01)"),
      card("CERT-DEMO-TOFU-002", "2026.06.08 11:00", "2회차 (D+7)", "승인완료 (2026.06.08)"),
      card("CERT-DEMO-TOFU-001", "2026.06.04 11:00", "1회차 (D+3)", "승인완료 (2026.06.04)"),
    ];
  }

  if (contract.id.includes("BORI")) {
    return [
      card("CERT-DEMO-BORI-003", "2026.07.30 09:00", "3회차 (D+30)", "PENDING"),
      card("CERT-DEMO-BORI-002", "2026.03.01 15:30", "2회차 (D+7)", "조치 후 승인완료 (2026.03.01)"),
      card("CERT-DEMO-BORI-001", "2026.02.04 12:00", "1회차 (D+3)", "조치 후 승인완료 (2026.02.04)"),
    ];
  }

  return [
    card("CERT-DEMO-KONGI-004", "2026.06.10 11:00", "4회차 (D+90)", "승인완료 (2026.08.03)"),
    card("CERT-DEMO-KONGI-003", "2026.03.10 11:00", "3회차 (D+30)", "승인완료 (2026.08.03)"),
    card("CERT-DEMO-KONGI-002", "2025.11.10 11:00", "2회차 (D+7)", "승인완료 (2026.08.03)"),
    card("CERT-DEMO-KONGI-001", "2025.08.10 11:00", "1회차 (D+3)", "승인완료 (2026.08.03)"),
  ];
}

