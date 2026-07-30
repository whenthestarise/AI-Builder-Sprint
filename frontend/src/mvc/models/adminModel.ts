export type PetStatus = "matching" | "available" | "adopted";
export type RiskLevel = "normal" | "warning" | "urgent";

export type Pet = {
  id: string;
  name: string;
  englishName: string;
  age: string;
  breed: string;
  imageUrl: string;
  status: PetStatus;
  contractStatus: string;
  traits: string[];
  note: string;
  applications: number;
};

export type AdoptionApplication = {
  id: string;
  applicant: string;
  phone: string;
  email: string;
  home: string;
  experience: string;
  awayHours: string;
  aiSummary: string;
  score: string;
};

export type Contract = {
  id: string;
  petName: string;
  adopterName: string;
  status: string;
  signedAt: string;
  nextCheck: string;
  risk: RiskLevel;
  certificationRound?: number;
};

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  tone: RiskLevel;
};

export type RiskDashboardData = {
  headerStatus: string;
  headerBadgeClass: string;
  headerDotClass: string;
  behaviorTrait: string;
  signedDate: string;
};

export type RiskUpcomingTimeline = {
  label: string;
  title: string;
  description: string;
  buttonLabel: string;
};

export type RiskCertificationCard = {
  id: string;
  contractId: string;
  tone: "caution" | "approved";
  title: string;
  description: string;
  status: string;
  submittedAt?: string;
  roundLabel?: string;
  imageUrl?: string;
  answers?: CertificationAnswer[];
  managerActions?: string[];
  managerComment?: string;
};

export type ManualGrade =
  | "urgent"
  | "caution"
  | "observe"
  | "normal";

export type GradeOption = {
  value: ManualGrade;
  label: string;
  shortLabel: string;
  badgeClass: string;
  dotClass: string;
  textClass: string;
};

export type CertificationAnswerTone =
  | "normal"
  | "observe"
  | "caution";

export type CertificationAnswer = {
  question: string;
  answer: string;
  tone: CertificationAnswerTone;
  highlighted?: boolean;
};

export type RiskFallbackRow = {
  adoptionDate: string;
  lastCertificationDate: string;
  petType: string;
};

export type RiskConfig = {
  gradeOptions: GradeOption[];
  reasonCategories: string[];
  actionOptions: string[];
  fallbackRows: RiskFallbackRow[];
};

export const pets: Pet[] = [
  {
    id: "DOG-2026-01",
    name: "바오",
    englishName: "Bao",
    age: "3살",
    breed: "믹스견",
    imageUrl:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
    status: "matching",
    contractStatus: "매칭 대기중",
    traits: ["분리불안", "실외 배변 선호", "사람 친화적"],
    note: "분리불안 완화를 위한 행동 교정 조항이 필요한 추천 계약 개체입니다.",
    applications: 1,
  },
  {
    id: "DOG-2026-02",
    name: "초코",
    englishName: "Choco",
    age: "2살",
    breed: "푸들",
    imageUrl:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80",
    status: "available",
    contractStatus: "입양 가능",
    traits: ["사람 친화적", "작은 가구 주의"],
    note: "온순하지만 초기 적응 기간 동안 분리 공간이 필요합니다.",
    applications: 0,
  },
  {
    id: "DOG-2026-03",
    name: "보리",
    englishName: "Bori",
    age: "5살",
    breed: "리트리버",
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
    status: "adopted",
    contractStatus: "입양 완료",
    traits: ["D+30 인증 지연", "방문 확인 필요"],
    note: "D+30 인증 기한이 지나 보호자 직접 연락이 필요합니다.",
    applications: 0,
  },
];

export const applications: AdoptionApplication[] = [
  {
    id: "APP-001",
    applicant: "김민수",
    phone: "010-1234-5678",
    email: "minsoo@example.com",
    home: "1인 가구 아파트, 안전문 설치 완료",
    experience: "반려견 15년, 노령견 케어 경험",
    awayHours: "하루 평균 6시간",
    aiSummary:
      "과거 케어 경험이 있고 바오의 분리불안 완화 훈련을 수행할 가능성이 높습니다.",
    score: "1차 심사 통과",
  },
];

export const contracts: Contract[] = [
  {
    id: "MD-20260728-001",
    petName: "바오",
    adopterName: "김민수",
    status: "검토대기",
    signedAt: "2026.07.28",
    nextCheck: "D+30 인증 대기",
    risk: "warning",
  },
];
