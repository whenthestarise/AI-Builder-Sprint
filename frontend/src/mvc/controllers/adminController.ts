import {
  applications,
  type Contract,
  contracts,
  pets,
  riskCertificationCards,
  riskUpcomingTimelines,
  type RiskDashboardData,
  timelineEvents,
} from "@/mvc/models/adminModel";

export function getDashboardViewModel() {
  return {
    stats: {
      totalPets: pets.length,
      waitingPets: pets.filter((pet) => pet.status === "available").length,
      applications: applications.length,
      urgentRisks: contracts.filter((contract) => contract.risk === "urgent")
        .length,
    },
    pets,
    applications,
  };
}

export function getManageViewModel() {
  return {
    applications,
    selectedPet: pets[0],
  };
}

export function getRiskViewModel() {
  return {
    contracts,
    applicantPhone: applications[0].phone,
    timelineEvents,
  };
}

export function getRiskDashboardModalViewModel(contractId: string | null) {
  const contract = contracts.find((item) => item.id === contractId) ?? null;

  return {
    contract,
    dashboardData: contract ? getDashboardData(contract) : null,
    upcomingTimeline: contract
      ? riskUpcomingTimelines[contract.id]
      : null,
    certificationCards: contract
      ? riskCertificationCards.filter(
          (card) => card.contractId === contract.id,
        )
      : [],
  };
}

export function getContractsViewModel() {
  return {
    contract: contracts[0],
    pet: pets[0],
    applicant: applications[0],
    dataLabels: [
      { label: "동물명", value: pets[0].name },
      { label: "입양자명", value: applications[0].applicant },
      { label: "연락처", value: applications[0].phone },
      {
        label: "특약사항",
        value: "분리불안 완화 행동 교정 훈련 3개월 이행",
      },
    ],
  };
}

function getDashboardData(contract: Contract): RiskDashboardData {
  const normalizedStatus = (contract.status ?? "").toLowerCase();

  const isUrgent =
    contract.risk === "urgent" ||
    normalizedStatus.includes("긴급") ||
    normalizedStatus.includes("지연");

  const isApproved =
    normalizedStatus.includes("완료") ||
    normalizedStatus.includes("승인");

  if (isUrgent) {
    return {
      headerStatus: "긴급 조치 필요",
      headerBadgeClass:
        "border-red-400 bg-red-500 text-white",
      headerDotClass: "bg-red-200",
      behaviorTrait: "분리불안 행동교정",
      signedDate: contract.signedAt || "2026.07.28",
    };
  }

  if (isApproved) {
    return {
      headerStatus: "승인 완료",
      headerBadgeClass:
        "border-emerald-400 bg-emerald-500 text-white",
      headerDotClass: "bg-emerald-200",
      behaviorTrait: "분리불안 행동교정",
      signedDate: contract.signedAt || "2026.07.28",
    };
  }

  return {
    headerStatus: "주의 (미승인 건)",
    headerBadgeClass:
      "border-orange-400 bg-orange-500 text-white",
    headerDotClass: "bg-orange-200",
    behaviorTrait: "분리불안 행동교정",
    signedDate: contract.signedAt || "2026.07.28",
  };
}
