import type {
  AdoptionApplication,
  Contract,
  Pet,
} from "@/mvc/models/adminModel";
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
    signaturePath?: string;
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
  const pets = await attachAiClausesToPets(
    manageData.pets,
    manageData.applications,
  );

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
    "입양자는 반려동물의 안전한 생활 환경을 유지합니다.",
    "입양자는 정기 인증 및 사후 관리 요청에 성실히 응답합니다.",
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
      nextCheck: "서명 후 생성",
      risk: "normal",
      baseClauses,
      specialClause,
      fullTerms: [...baseClauses, ...customClauses].join("\n\n"),
      aiGuide: preview.ai_summary,
      signaturePath: `/modusign?contractId=${encodeURIComponent(
        `DRAFT-${pet.id}-${applicant.id}`,
      )}&petId=${encodeURIComponent(pet.id)}&applicationId=${encodeURIComponent(
        applicant.id,
      )}`,
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
    throw new Error(
      `Backend ${name} API is unavailable. Tried: ${paths.join(", ")}`,
    );
  }

  return viewModel;
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
    imageUrl: pet.imageUrl || "",
  };
}

async function attachAiClausesToPets(
  pets: Pet[],
  applications: AdoptionApplication[],
) {
  return Promise.all(
    pets.map(async (pet) => {
      const normalizedPet = normalizePet(pet);
      const application = applications.find(
        (item) => item.petId === normalizedPet.id,
      );

      if (!application) {
        return normalizedPet;
      }

      const preview = await generateContractPreview(
        normalizedPet,
        application,
      );

      return {
        ...normalizedPet,
        note:
          preview.custom_clauses
            .map((clause, index) => `${index + 1}. ${clause}`)
            .join("\n") || normalizedPet.note,
      };
    }),
  );
}

function generateContractPreview(
  pet: Pet,
  applicant: AdoptionApplication,
) {
  return postBackendJson<
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
}
