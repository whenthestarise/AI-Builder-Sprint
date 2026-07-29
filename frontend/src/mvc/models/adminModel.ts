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
};

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  tone: RiskLevel;
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
    note: "분리불안 완화를 위한 행동 교정 조항이 필요한 추천 시연 개체입니다.",
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
    traits: ["사람 친화적", "다견 가구 주의"],
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
    note: "D+30 인증 기한이 12일 경과해 보호소 직접 연락이 필요합니다.",
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
  {
    id: "MD-20260618-014",
    petName: "보리",
    adopterName: "이서연",
    status: "사후관리 지연",
    signedAt: "2026.06.18",
    nextCheck: "D+30 기한 12일 경과",
    risk: "urgent",
  },
  {
    id: "MD-20260704-009",
    petName: "초코",
    adopterName: "박지훈",
    status: "확인 승인완료",
    signedAt: "2026.07.04",
    nextCheck: "D+7 인증 완료",
    risk: "normal",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "TL-1",
    title: "계약 원본 저장",
    description: "서명 완료 후 계약 원본 ID가 CLM 보관함에 자동 저장됩니다.",
    date: "2026.07.28",
    tone: "normal",
  },
  {
    id: "TL-2",
    title: "D+7 사후 인증 정상",
    description: "입양자가 사진과 생활 리포트를 제출했고 AI 진단 결과 정상입니다.",
    date: "2026.08.04",
    tone: "normal",
  },
  {
    id: "TL-3",
    title: "D+30 인증 지연",
    description: "인증 기한을 초과하여 보호소 직접 연락이 필요합니다.",
    date: "2026.07.28",
    tone: "urgent",
  },
];
