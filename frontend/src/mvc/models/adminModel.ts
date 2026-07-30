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

export const riskUpcomingTimelines: Record<string, RiskUpcomingTimeline> = {
  "MD-20260728-001": {
    label: "Upcoming Timeline",
    title: "다음 예정: D+90일 차 정기 안부 인증",
    description: "예정 일자: 2026년 10월 26일 · 스케줄러 가동중",
    buttonLabel: "사전 안내 발송",
  },
  "MD-20260618-014": {
    label: "Upcoming Timeline",
    title: "다음 예정: D+90일 차 정기 안부 인증",
    description: "예정 일자: 2026년 10월 26일 · 스케줄러 가동중",
    buttonLabel: "사전 안내 발송",
  },
  "MD-20260704-009": {
    label: "Upcoming Timeline",
    title: "다음 예정: D+90일 차 정기 안부 인증",
    description: "예정 일자: 2026년 10월 26일 · 스케줄러 가동중",
    buttonLabel: "사전 안내 발송",
  },
};

export const riskCertificationCards: RiskCertificationCard[] = [
  {
    id: "CERT-MD-20260728-001-030",
    contractId: "MD-20260728-001",
    tone: "caution",
    title: "D+30일 차 안부 인증 제출 건",
    description: '"사료를 바꿨더니 며칠째 밥을 잘 안 먹어서 걱정이에요."',
    status: "주의 미승인",
    submittedAt: "2026.07.29 14:30",
    roundLabel: "3회차 (D+30)",
    answers: [
      {
        question: "Q1. 밥은 잘 먹고 있나요?",
        answer: "잘 먹어요",
        tone: "normal",
      },
      {
        question: "Q2. 평소 컨디션은 어떤가요?",
        answer: "잘 뛰고 활발해요",
        tone: "normal",
      },
      {
        question: "Q3. 화장실은 잘 가리나요?",
        answer: "약간 묽은 변을 보거나 가끔 실수해요",
        tone: "observe",
      },
      {
        question: "Q4. 특이사항이 있나요?",
        answer: "사료를 바꿨더니 며칠째 밥을 잘 안 먹어서 걱정이에요.",
        tone: "caution",
        highlighted: true,
      },
      {
        question: "Q5. 동물등록 완료 (필수)",
        answer: "네, 완료했습니다.",
        tone: "normal",
      },
      {
        question: "Q6. 예방접종/중성화 완료 (필수)",
        answer: "아직 진행하지 못했어요",
        tone: "caution",
        highlighted: true,
      },
    ],
  },
  {
    id: "CERT-MD-20260728-001-007",
    contractId: "MD-20260728-001",
    tone: "approved",
    title: "D+7일 차 초기 안부 인증 건",
    description: '"너무 잘 지내고 있어요! 산책도 매일 나갑니다."',
    status: "승인완료 (2026.08.04)",
    submittedAt: "2026.08.04 10:12",
    roundLabel: "1회차 (D+7)",
    answers: [
      {
        question: "Q1. 밥은 잘 먹고 있나요?",
        answer: "잘 먹어요",
        tone: "normal",
      },
      {
        question: "Q2. 평소 컨디션은 어떤가요?",
        answer: "잘 뛰고 활발해요",
        tone: "normal",
      },
      {
        question: "Q3. 화장실은 잘 가리나요?",
        answer: "문제없이 잘 가려요",
        tone: "normal",
      },
      {
        question: "Q4. 특이사항이 있나요?",
        answer: "특이사항이 없습니다.",
        tone: "normal",
      },
      {
        question: "Q5. 동물등록 완료 (필수)",
        answer: "네, 완료했습니다.",
        tone: "normal",
      },
      {
        question: "Q6. 예방접종/중성화 완료 (필수)",
        answer: "완료했습니다.",
        tone: "normal",
      },
    ],
  },
  {
    id: "CERT-MD-20260618-014-030",
    contractId: "MD-20260618-014",
    tone: "caution",
    title: "D+30일 차 안부 인증 제출 건",
    description: '"사료를 바꿨더니 며칠째 밥을 잘 안 먹어서 걱정이에요."',
    status: "주의 미승인",
    submittedAt: "2026.07.29 14:30",
    roundLabel: "3회차 (D+30)",
    answers: [
      {
        question: "Q1. 밥은 잘 먹고 있나요?",
        answer: "잘 먹어요",
        tone: "normal",
      },
      {
        question: "Q2. 평소 컨디션은 어떤가요?",
        answer: "잘 뛰고 활발해요",
        tone: "normal",
      },
      {
        question: "Q3. 화장실은 잘 가리나요?",
        answer: "약간 묽은 변을 보거나 가끔 실수해요",
        tone: "observe",
      },
      {
        question: "Q4. 특이사항이 있나요?",
        answer: "사료를 바꿨더니 며칠째 밥을 잘 안 먹어서 걱정이에요.",
        tone: "caution",
        highlighted: true,
      },
      {
        question: "Q5. 동물등록 완료 (필수)",
        answer: "네, 완료했습니다.",
        tone: "normal",
      },
      {
        question: "Q6. 예방접종/중성화 완료 (필수)",
        answer: "아직 진행하지 못했어요",
        tone: "caution",
        highlighted: true,
      },
    ],
  },
  {
    id: "CERT-MD-20260618-014-007",
    contractId: "MD-20260618-014",
    tone: "approved",
    title: "D+7일 차 초기 안부 인증 건",
    description: '"너무 잘 지내고 있어요! 산책도 매일 나갑니다."',
    status: "승인완료 (2026.08.04)",
    submittedAt: "2026.08.04 10:12",
    roundLabel: "1회차 (D+7)",
    answers: [
      {
        question: "Q1. 밥은 잘 먹고 있나요?",
        answer: "잘 먹어요",
        tone: "normal",
      },
      {
        question: "Q2. 평소 컨디션은 어떤가요?",
        answer: "잘 뛰고 활발해요",
        tone: "normal",
      },
      {
        question: "Q3. 화장실은 잘 가리나요?",
        answer: "문제없이 잘 가려요",
        tone: "normal",
      },
      {
        question: "Q4. 특이사항이 있나요?",
        answer: "특이사항이 없습니다.",
        tone: "normal",
      },
      {
        question: "Q5. 동물등록 완료 (필수)",
        answer: "네, 완료했습니다.",
        tone: "normal",
      },
      {
        question: "Q6. 예방접종/중성화 완료 (필수)",
        answer: "완료했습니다.",
        tone: "normal",
      },
    ],
  },
  {
    id: "CERT-MD-20260704-009-030",
    contractId: "MD-20260704-009",
    tone: "caution",
    title: "D+30일 차 안부 인증 제출 건",
    description: '"사료를 바꿨더니 며칠째 밥을 잘 안 먹어서 걱정이에요."',
    status: "주의 미승인",
    submittedAt: "2026.07.29 14:30",
    roundLabel: "3회차 (D+30)",
    answers: [
      {
        question: "Q1. 밥은 잘 먹고 있나요?",
        answer: "잘 먹어요",
        tone: "normal",
      },
      {
        question: "Q2. 평소 컨디션은 어떤가요?",
        answer: "잘 뛰고 활발해요",
        tone: "normal",
      },
      {
        question: "Q3. 화장실은 잘 가리나요?",
        answer: "약간 묽은 변을 보거나 가끔 실수해요",
        tone: "observe",
      },
      {
        question: "Q4. 특이사항이 있나요?",
        answer: "사료를 바꿨더니 며칠째 밥을 잘 안 먹어서 걱정이에요.",
        tone: "caution",
        highlighted: true,
      },
      {
        question: "Q5. 동물등록 완료 (필수)",
        answer: "네, 완료했습니다.",
        tone: "normal",
      },
      {
        question: "Q6. 예방접종/중성화 완료 (필수)",
        answer: "아직 진행하지 못했어요",
        tone: "caution",
        highlighted: true,
      },
    ],
  },
  {
    id: "CERT-MD-20260704-009-007",
    contractId: "MD-20260704-009",
    tone: "approved",
    title: "D+7일 차 초기 안부 인증 건",
    description: '"너무 잘 지내고 있어요! 산책도 매일 나갑니다."',
    status: "승인완료 (2026.08.04)",
    submittedAt: "2026.08.04 10:12",
    roundLabel: "1회차 (D+7)",
    answers: [
      {
        question: "Q1. 밥은 잘 먹고 있나요?",
        answer: "잘 먹어요",
        tone: "normal",
      },
      {
        question: "Q2. 평소 컨디션은 어떤가요?",
        answer: "잘 뛰고 활발해요",
        tone: "normal",
      },
      {
        question: "Q3. 화장실은 잘 가리나요?",
        answer: "문제없이 잘 가려요",
        tone: "normal",
      },
      {
        question: "Q4. 특이사항이 있나요?",
        answer: "특이사항이 없습니다.",
        tone: "normal",
      },
      {
        question: "Q5. 동물등록 완료 (필수)",
        answer: "네, 완료했습니다.",
        tone: "normal",
      },
      {
        question: "Q6. 예방접종/중성화 완료 (필수)",
        answer: "완료했습니다.",
        tone: "normal",
      },
    ],
  },
];

export const gradeOptions = [
  {
    value: "urgent",
    label: "🚨 긴급 (Red)",
    shortLabel: "긴급",
    badgeClass:
      "border-red-400 bg-red-500 text-white",
    dotClass: "bg-red-200",
    textClass: "text-red-600",
  },
  {
    value: "caution",
    label: "⚠️ 주의 (Orange)",
    shortLabel: "주의",
    badgeClass:
      "border-orange-400 bg-orange-500 text-white",
    dotClass: "bg-orange-200",
    textClass: "text-orange-600",
  },
  {
    value: "observe",
    label: "👀 관찰 (Yellow)",
    shortLabel: "관찰",
    badgeClass:
      "border-yellow-400 bg-yellow-400 text-yellow-950",
    dotClass: "bg-yellow-200",
    textClass: "text-yellow-600",
  },
  {
    value: "normal",
    label: "✅ 정상 (Green)",
    shortLabel: "정상",
    badgeClass:
      "border-emerald-400 bg-emerald-500 text-white",
    dotClass: "bg-emerald-200",
    textClass: "text-emerald-600",
  },
] satisfies GradeOption[];

export const reasonCategories = [
  "연락 두절",
  "안부 인증 미제출",
  "안부 인증 지연",
  "건강 이상 징후",
  "주거 환경 문제",
  "계약 위반 의심",
  "기타 사유",
];

export const actionOptions = [
  "우선 전화 상담 완료 (건강 상태 파악 및 병원 내원 권고)",
  "필수 의무 미이행에 대한 기한 연장 안내 발송",
  "제휴 동물병원 비대면 수의사 건강상담 링크 카카오톡 발송",
  "다음 안부 주기 집중 모니터링 대상으로 태그 지정",
];

export function createDefaultCertificationAnswers(
  card: RiskCertificationCard,
  hasImage: boolean,
): CertificationAnswer[] {
  return [
    {
      question: "Q1. 밥은 잘 먹고 있나요?",
      answer: "잘 먹어요",
      tone: "normal",
    },
    {
      question: "Q2. 평소 컨디션은 어떤가요?",
      answer: "잘 뛰고 활발해요",
      tone: "normal",
    },
    {
      question: "Q3. 화장실은 잘 가리나요?",
      answer:
        "약간 묽은 변을 보거나 가끔 실수해요",
      tone: "observe",
    },
    {
      question: "Q4. 특이사항이 있나요?",
      answer:
        card.description ||
        "구토 또는 설사 증상이 있어 확인이 필요합니다.",
      tone: "caution",
      highlighted: true,
    },
    {
      question: "Q5. 동물등록 완료 (필수)",
      answer: hasImage
        ? "네, 완료했습니다 (사진 첨부)"
        : "사진 첨부가 필요합니다.",
      tone: hasImage
        ? "normal"
        : "caution",
    },
    {
      question:
        "Q6. 예방접종/중성화 완료 (필수)",
      answer: "아직 진행하지 못했어요",
      tone: "caution",
      highlighted: true,
    },
  ];
}
