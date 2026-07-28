import {
  applications,
  contracts,
  pets,
  timelineEvents,
} from "@/models/adminModel";

export function getDashboardViewModel() {
  return {
    stats: {
      totalPets: pets.length,
      waitingPets: pets.filter((pet) => pet.status !== "risk").length,
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
    timelineEvents,
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
      { label: "특약사항", value: "분리불안 완화 행동 교정 훈련 3개월 이행" },
    ],
  };
}
