import type {
  AdoptionApplication,
  Contract,
  Pet,
} from "@/mvc/models/adminModel";
import {
  applications as fallbackApplications,
  pets as fallbackPets,
} from "@/mvc/models/adminModel";

const MAIN_PET_IMAGE_URLS = [
  "/pet-main-1.png",
  "/pet-main-2.png",
  "/pet-main-3.png",
  "/pet-main-4.png",
  "/pet-main-5.png",
];

const DEFAULT_PET_IMAGE_URL = MAIN_PET_IMAGE_URLS[0];
const PET_IMAGE_URL_BY_ID: Record<string, string> = {
  "DOG-2026-01": MAIN_PET_IMAGE_URLS[0],
  "DOG-2026-02": MAIN_PET_IMAGE_URLS[1],
  "DOG-2026-03": MAIN_PET_IMAGE_URLS[2],
  "DOG-2026-04": MAIN_PET_IMAGE_URLS[3],
  "DOG-2026-05": MAIN_PET_IMAGE_URLS[4],
};
import {
  fetchBackendViewModel,
  postBackendJson,
} from "@/mvc/services/adminApi";

type ManageListViewModel = {
  pets: Pet[];
  applications: AdoptionApplication[];
};

type ManageViewModel = {
  selectedPet: Pet;
  applications: AdoptionApplication[];
};

type ContractsViewModel = {
  contract: Contract & {
    baseClauses?: string[];
    specialClause?: string;
    fullTerms?: string;
    aiGuide?: string;
  };
  pet: Pet;
  applicant: AdoptionApplication;
  dataLabels: Array<{
    label: string;
    value: string;
  }>;
};

type ContractPreviewResponse = {
  ai_summary: string;
  custom_clauses: string[];
};

export async function getDashboardViewModel() {
  const manageData = await requireBackendViewModel<ManageListViewModel>(
    ["/api/manage"],
    "manage list",
  );
  const pets = manageData.pets.map(normalizePet);

  return {
    stats: {
      totalPets: manageData.pets.length,
      waitingPets: manageData.pets.filter(
        (pet) => pet.status === "available",
      ).length,
      applications: manageData.applications.length,
      urgentRisks: 0,
    },
    pets,
    applications: manageData.applications,
  };
}

export async function getManageViewModel(petId?: string) {
  if (petId) {
    return normalizeManageViewModel(
      await requireBackendViewModel<ManageViewModel>(
        [`/api/manage/${encodeURIComponent(petId)}`],
        "manage detail",
      ),
    );
  }

  const manageData = await requireBackendViewModel<ManageListViewModel>(
    ["/api/manage"],
    "manage list",
  );
  const selectedPet = manageData.pets[0];

  if (!selectedPet) {
    throw new Error("Backend manage API returned no pets.");
  }

  return {
    selectedPet: normalizePet(selectedPet),
    applications: manageData.applications.filter(
      (application) => application.petId === selectedPet.id,
    ),
  };
}

export async function getManageViewModelByPetId(petId: string) {
  return getManageViewModel(petId);
}

export async function getContractsViewModel(params?: {
  petId?: string;
  applicationId?: string;
}) {
  const manageViewModel = await getManageViewModel(params?.petId);
  const pet = manageViewModel.selectedPet;
  const applicant =
    manageViewModel.applications.find(
      (application) => application.id === params?.applicationId,
    ) ?? manageViewModel.applications[0];

  if (!applicant) {
    throw new Error(
      `Backend manage API returned no applications for pet ${pet.id}.`,
    );
  }

  const preview = await generateContractPreview(pet, applicant);

  const baseClauses = [
    "입양자는 반려동물이 안전하게 생활할 수 있는 환경을 유지합니다.",
    "입양자는 정기 인증 및 사후관리 요청에 성실히 응답합니다.",
    "보호자는 필요 시 입양 이후 적응 상태를 확인할 수 있습니다.",
  ];
  const customClauses = preview.custom_clauses;
  const specialClause =
    customClauses[0] ??
    applicant.aiSummary ??
    pet.note;

  return {
    contract: {
      id: `DRAFT-${pet.id}-${applicant.id}`,
      petName: pet.name,
      adopterName: applicant.applicant,
      applicantPhone: applicant.phone,
      status: "DRAFT",
      signedAt: "",
      nextCheck: "서명 전 생성",
      risk: "normal",
      baseClauses,
      specialClause,
      fullTerms: [...baseClauses, ...customClauses].join("\n\n"),
      aiGuide: preview.ai_summary,
    },
    pet,
    applicant,
    dataLabels: [
      { label: "petName", value: pet.name },
      { label: "adopterName", value: applicant.applicant },
      { label: "phone", value: applicant.phone },
      { label: "specialClause", value: specialClause },
    ],
  } satisfies ContractsViewModel;
}

async function requireBackendViewModel<T>(
  paths: string[],
  name: string,
) {
  const viewModel = await fetchBackendViewModel<T>(paths);

  if (!viewModel) {
    return getFallbackViewModel(name, paths) as T;
  }

  return viewModel;
}

function getFallbackViewModel(
  name: string,
  paths: string[],
): ManageListViewModel | ManageViewModel {
  if (name === "manage detail") {
    const selectedPet =
      fallbackPets.find((pet) =>
        paths.some((path) => path.includes(encodeURIComponent(pet.id))),
      ) ?? fallbackPets[0];

    return {
      selectedPet,
      applications: fallbackApplications.filter(
        (application) => application.petId === selectedPet.id,
      ),
    };
  }

  return {
    pets: fallbackPets,
    applications: fallbackApplications,
  };
}

function normalizeManageViewModel(
  viewModel: ManageViewModel,
): ManageViewModel {
  return {
    selectedPet: normalizePet(viewModel.selectedPet),
    applications: viewModel.applications,
  };
}

function normalizePet(pet: Pet): Pet {
  return {
    ...pet,
    imageUrl:
      PET_IMAGE_URL_BY_ID[pet.id] ||
      pet.imageUrl ||
      DEFAULT_PET_IMAGE_URL,
  };
}

async function generateContractPreview(
  pet: Pet,
  applicant: AdoptionApplication,
) {
  try {
    return await postBackendJson<
      ContractPreviewResponse,
      {
        pet_id: string;
        application_id: string;
        pet_info: {
          name: string;
          age: string;
          breed: string;
          special_notes: string;
        };
        adopter_info: {
          name: string;
          household_type: string;
          housing_type: string;
          pet_experience: string;
        };
      }
    >("/api/ai/contract-preview", {
      pet_id: pet.id,
      application_id: applicant.id,
      pet_info: {
        name: pet.name,
        age: pet.age,
        breed: pet.breed,
        special_notes:
          pet.traits.join(", ") ||
          pet.note ||
          "입양 계약 맞춤 특약 검토",
      },
      adopter_info: {
        name: applicant.applicant,
        household_type: applicant.home,
        housing_type: applicant.home,
        pet_experience: applicant.experience,
      },
    });
  } catch {
    return {
      ai_summary:
        applicant.aiSummary ||
        `${applicant.applicant}님의 환경과 ${pet.name}의 특성을 기준으로 사후관리 특약을 구성했습니다.`,
      custom_clauses: [
        `${applicant.applicant}님은 ${pet.name}의 적응 상태를 정기적으로 확인하고 요청된 안부 인증에 성실히 응답합니다.`,
        `${pet.name}에게 건강 이상 또는 행동 변화가 발견될 경우 보호기관에 즉시 공유하고 필요한 조치를 진행합니다.`,
      ],
    };
  }
}
