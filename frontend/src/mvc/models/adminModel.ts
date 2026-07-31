export type PetStatus = "matching" | "available" | "adopted";
export type RiskLevel = "normal" | "watch" | "warning" | "urgent";
export type RiskApprovalStatus = "pending" | "approved";

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
  rescueDate?: string;
  rescueLocation?: string;
  shelterName?: string;
  intakeDate?: string;
  weight?: string;
  neutered?: boolean;
};

export type AdoptionApplication = {
  id: string;
  petId?: string;
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
  applicantPhone?: string;
  status: string;
  signedAt: string;
  nextCheck: string;
  risk: RiskLevel;
  petType?: string;
  adoptionDate?: string;
  lastCertificationDate?: string;
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
  manualGrade?: string;
  manualCategory?: string;
  manualReason?: string;
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

export type RiskManagementItem = {
  id: string;
  petId: string;
  adopterName: string;
  petName: string;
  petBreed: string;
  contact: string;
  adoptionDate: string;
  lastCertificationDate?: string;
  certificationDueDate?: string;
  riskLevel: RiskLevel;
  approvalStatus: RiskApprovalStatus;
  contract: Contract | null;
  dashboardData?: RiskDashboardData | null;
  upcomingTimeline?: RiskUpcomingTimeline | null;
  certificationCards?: RiskCertificationCard[];
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
    traits: [
      "⚠️ 심한 분리불안",
      "실외 배변 선호",
      "헛짖음 약간",
      "사람을 매우 좋아함",
    ],
    note: "심한 분리불안 완화를 위한 행동 교정 조항이 필요합니다.",
    applications: 3,
    rescueDate: "2026.05.12",
    rescueLocation: "부산 해운대구",
    shelterName: "부산 유기동물 보호협회",
    weight: "8.5kg",
    neutered: true,
  },
  {
    id: "DOG-2026-02",
    name: "코코",
    englishName: "Coco",
    age: "2살",
    breed: "말티즈",
    imageUrl:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80",
    status: "available",
    contractStatus: "입양 가능",
    traits: [
      "⚠️ 슬개골 탈구 2기",
      "초인종 반응 짖음",
      "실내 배변 100% 완벽",
      "스킨십 선호",
    ],
    note: "슬개골 탈구 2기로 관절 보호 환경과 정기 검진이 필요합니다.",
    applications: 0,
    rescueDate: "2026.06.01",
    rescueLocation: "부산 수영구",
    shelterName: "부산 유기동물 보호협회",
    weight: "3.2kg",
    neutered: true,
  },
  {
    id: "DOG-2026-03",
    name: "맥스",
    englishName: "Max",
    age: "4살",
    breed: "골든 리트리버 믹스",
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
    status: "available",
    contractStatus: "입양 가능",
    traits: [
      "⚠️ 성인 남성 경계함",
      "높은 활동량 (하루 2시간 산책 필수)",
      "탈출 시도 이력 있음",
      "다른 강아지와 사회성 좋음",
    ],
    note: "성인 남성 경계와 탈출 시도 이력이 있어 안전 관리 조항이 필요합니다.",
    applications: 0,
    rescueDate: "2026.04.15",
    rescueLocation: "부산 기장군",
    shelterName: "부산 유기동물 보호협회",
    weight: "22.0kg",
    neutered: true,
  },
  {
    id: "DOG-2026-04",
    name: "다미",
    englishName: "Dami",
    age: "10살 (노령견)",
    breed: "시추",
    imageUrl:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80",
    status: "available",
    contractStatus: "입양 가능",
    traits: [
      "⚠️ 심장병 초기 (매일 아침 투약 필수)",
      "매우 온순하고 조용함",
      "분리불안 없음",
      "수면 시간이 길음",
    ],
    note: "심장병 초기로 매일 아침 투약이 필요한 노령견입니다.",
    applications: 0,
    rescueDate: "2026.03.20",
    rescueLocation: "부산 동래구",
    shelterName: "부산 유기동물 보호협회",
    weight: "5.1kg",
    neutered: true,
  },
  {
    id: "DOG-2026-05",
    name: "레오",
    englishName: "Leo",
    age: "6개월 (퍼피)",
    breed: "진도 믹스",
    imageUrl:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
    status: "available",
    contractStatus: "입양 가능",
    traits: [
      "⚠️ 이갈이 및 입질 시기",
      "중성화 수술 예정 (D+30 필수)",
      "호기심 최고조",
      "퍼피 사회화 교육 필요",
    ],
    note: "퍼피 사회화 교육과 D+30 중성화 이행 조항이 필요합니다.",
    applications: 0,
    rescueDate: "2026.07.02",
    rescueLocation: "부산 사하구",
    shelterName: "부산 유기동물 보호협회",
    weight: "6.8kg",
    neutered: false,
  },
];

export const applications: AdoptionApplication[] = [
  {
    id: "APP-2026-0727-1",
    petId: "DOG-2026-01",
    applicant: "김민수",
    phone: "010-1234-5678",
    email: "minsoo@naver.com",
    home: "1인 가구, 아파트 (방묘문 및 안전문 설치 완)",
    experience: "과거 반려견 15년 자연사 돌봄 경험 있음",
    awayHours: "하루 평균 6시간 (퇴근 후 산책 2회 가능)",
    aiSummary:
      "과거 노령견 돌봄 경험이 있어 바오의 분리불안 훈련이나 다미의 투약 관리에 매우 적합함.",
    score: "1차 심사 통과",
  },
  {
    id: "APP-2026-0728-2",
    petId: "DOG-2026-01",
    applicant: "이지은",
    phone: "010-9876-5432",
    email: "jieun.lee@gmail.com",
    home: "4인 가구, 마당이 있는 단독주택 (1.8m 높은 담장 완비)",
    experience: "대형견(래브라도 리트리버) 10년 양육 경험 있음",
    awayHours: "하루 평균 1~2시간 (부모님이 상시 집에 계심)",
    aiSummary:
      "상시 사람이 있고 마당이 완비되어 있어 활동량이 많고 탈출 이력이 있는 맥스에게 최적의 입양처임.",
    score: "1차 심사 통과",
  },
  {
    id: "APP-2026-0728-3",
    petId: "DOG-2026-01",
    applicant: "박준호",
    phone: "010-5555-4444",
    email: "junho.park@kakao.com",
    home: "신혼부부(2인 가구), 빌라 2층 (전 좌석 미끄럼 방지 매트 시공 완)",
    experience: "반려견 양육 첫 경험 (주말 방문 훈련소 등록 완료)",
    awayHours: "하루 평균 4시간 (부부 교대 재택근무 가능)",
    aiSummary:
      "첫 입양이나 미끄럼 방지 매트 시공 등 준비성이 철저하여 슬개골 관리가 필요한 코코나 퍼피 레오와 적합함.",
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
