"use client";

/* eslint-disable @next/next/no-img-element */

import type {
  ChangeEvent,
  FormEvent,
  ReactNode,
} from "react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
 * 타입
 * ======================================================= */

export type CertificationRound =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;

export type RiskLevel =
  | "green"
  | "yellow"
  | "orange"
  | "red";

type RadioOption = {
  value: string;
  label: string;
  risk: RiskLevel;
  note?: string;
};

type RadioQuestionConfig = {
  id: string;
  question: string;
  options: RadioOption[];
  required?: boolean;
};

type RoundMeta = {
  title: string;
  schedule: string;
  purpose: string;
  badge: string;
};

export type CertificationSubmission = {
  petId?: string;
  round: CertificationRound;
  petName: string;
  adopterName?: string;
  adoptionDate?: string;
  highestRisk: RiskLevel;
  answers: Record<string, string>;
  bodySymptoms: string[];
  textInputs: Record<string, string>;
  files: Record<string, File | null>;
};

type CertificationFormViewProps = {
  petId?: string;
  round: CertificationRound;
  petName: string;
  adopterName?: string;
  adoptionDate?: string;
  onSubmit?: (
    submission: CertificationSubmission,
  ) => void | Promise<void>;
};

/* =========================================================
 * 위험도 설정
 * ======================================================= */

const riskWeight: Record<RiskLevel, number> = {
  green: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

const riskStyle: Record<
  RiskLevel,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    textClass: string;
  }
> = {
  green: {
    label: "정상",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700",
  },
  yellow: {
    label: "관찰",
    badgeClass:
      "border-yellow-300 bg-yellow-50 text-yellow-700",
    dotClass: "bg-yellow-400",
    textClass: "text-yellow-700",
  },
  orange: {
    label: "주의",
    badgeClass:
      "border-orange-300 bg-orange-50 text-orange-700",
    dotClass: "bg-orange-500",
    textClass: "text-orange-700",
  },
  red: {
    label: "긴급",
    badgeClass:
      "border-red-300 bg-red-50 text-red-700",
    dotClass: "bg-red-500",
    textClass: "text-red-700",
  },
};

/* =========================================================
 * 공통 문항
 * ======================================================= */

const baseQuestions: RadioQuestionConfig[] = [
  {
    id: "appetite",
    question: "밥은 잘 먹고 있나요?",
    required: true,
    options: [
      {
        value: "good",
        label: "잘 먹어요",
        risk: "green",
      },
      {
        value: "slightly_less",
        label:
          "평소보다 조금 덜 먹거나 남겨요",
        risk: "yellow",
      },
      {
        value: "almost_none",
        label:
          "최근 2~3일간 거의 먹지 않았어요",
        risk: "orange",
        note: "3일 이상 식욕 부진 감지",
      },
    ],
  },
  {
    id: "condition",
    question:
      "평소 아이의 컨디션은 어떤가요?",
    required: true,
    options: [
      {
        value: "active",
        label:
          "잘 놀고 활발해요 / 나이에 맞게 지내요",
        risk: "green",
      },
      {
        value: "calmer",
        label:
          "잠이 늘었거나 평소보다 얌전해졌어요",
        risk: "yellow",
      },
      {
        value: "abnormal",
        label:
          "구석에 숨어 무기력해요 / 너무 흥분해요",
        risk: "orange",
        note: "무기력 또는 과도한 흥분 지속",
      },
    ],
  },
  {
    id: "toilet",
    question: "화장실은 잘 가나요?",
    required: true,
    options: [
      {
        value: "normal",
        label: "예쁜 모양의 변을 잘 봐요",
        risk: "green",
      },
      {
        value: "slightly_abnormal",
        label:
          "약간 묽은 변을 보거나 가끔 실수를 해요",
        risk: "yellow",
      },
      {
        value: "emergency",
        label:
          "심한 설사나 혈변 / 소변을 전혀 못 봐요",
        risk: "red",
        note: "혈변 또는 배뇨 곤란 징후 감지",
      },
    ],
  },
];

/* =========================================================
 * 회차별 설정
 * ======================================================= */

const roundMeta: Record<
  CertificationRound,
  RoundMeta
> = {
  1: {
    title: "1회차 D+3 정기 인증",
    schedule: "입양일 기준 +3일 차",
    purpose:
      "가장 파양률이 높은 시기의 환경 안전 및 초기 반응을 확인합니다.",
    badge: "초기 환경 적응",
  },
  2: {
    title: "2회차 D+7 정기 인증",
    schedule: "입양일 기준 +7일 차",
    purpose:
      "가족과의 행동 적응도와 분리불안 징후를 확인합니다.",
    badge: "교감 및 분리불안",
  },
  3: {
    title: "3회차 D+30 정기 인증",
    schedule: "입양일 기준 +30일 차",
    purpose:
      "동물등록, 예방접종, 중성화 등 법적·계약적 의무 이행 여부를 확인합니다.",
    badge: "행정·의료 필수 검증",
  },
  4: {
    title: "4회차 D+90 정기 인증",
    schedule: "입양일 기준 +90일 차",
    purpose:
      "장기 적응 상태와 사회성 및 행동 교정 필요성을 확인합니다.",
    badge: "장기 적응 및 사회성",
  },
  5: {
    title: "5회차 D+180 정기 인증",
    schedule: "입양일 기준 +180일 차",
    purpose:
      "체중과 전반적인 사육 환경의 지속 적정성을 평가합니다.",
    badge: "반기 신체 변화 점검",
  },
  6: {
    title: "6회차 D+365 정기 인증",
    schedule: "입양일 기준 +365일 차",
    purpose:
      "연간 건강 상태를 종합 점검하고 사후관리 절차 종료 여부를 검토합니다.",
    badge: "1년 종합 평가",
  },
};

const roundRadioQuestions: Partial<
  Record<
    CertificationRound,
    RadioQuestionConfig[]
  >
> = {
  1: [
    {
      id: "familyReaction",
      question: "가족들을 어떻게 대하나요?",
      required: true,
      options: [
        {
          value: "adapted",
          label:
            "곁에 와서 쉬어요 / 주변 냄새를 탐색해요",
          risk: "green",
        },
        {
          value: "stressed",
          label:
            "아직 구석에서 떨거나 경계하며 짖어요",
          risk: "yellow",
          note: "초기 스트레스 안내문 자동 발송",
        },
      ],
    },
  ],
  2: [
    {
      id: "separationReaction",
      question:
        "가족이 외출할 때 아이의 반응은 어떤가요?",
      required: true,
      options: [
        {
          value: "calm",
          label:
            "얌전히 쉬어요 / 낑낑대지만 금방 진정해요",
          risk: "green",
        },
        {
          value: "anxious",
          label:
            "계속 짖거나 하울링 / 물건을 심하게 뜯어요",
          risk: "orange",
          note: "분리불안 징후 및 행동 조언 필요",
        },
      ],
    },
  ],
  3: [
    {
      id: "animalRegistration",
      question: "동물등록을 완료하셨나요?",
      required: true,
      options: [
        {
          value: "completed",
          label: "네, 완료했습니다!",
          risk: "green",
          note: "등록증 사진 첨부 필수",
        },
        {
          value: "waiting",
          label:
            "구청/병원에 신청 후 대기 중이에요",
          risk: "yellow",
        },
        {
          value: "not_started",
          label: "아직 하지 못했어요",
          risk: "orange",
          note: "관리자 유선 확인 태스크 생성",
        },
      ],
    },
    {
      id: "medicalCare",
      question:
        "예방접종 / 중성화는 다녀오셨나요?",
      required: true,
      options: [
        {
          value: "completed",
          label: "네, 다녀왔습니다!",
          risk: "green",
          note: "영수증 또는 수첩 사진 첨부 필수",
        },
        {
          value: "delayed",
          label:
            "수의사 상담 후 건강상 일정을 미뤘어요",
          risk: "yellow",
          note: "연기 사유 입력 필요",
        },
        {
          value: "not_started",
          label: "아직 진행하지 못했어요",
          risk: "orange",
          note: "의무 미이행 관리자 알림",
        },
      ],
    },
  ],
  4: [
    {
      id: "socialReaction",
      question:
        "산책 시 낯선 사람이나 강아지를 만났을 때 반응은 어떤가요?",
      required: true,
      options: [
        {
          value: "social",
          label:
            "호기심을 보이고 어울려요 / 무던하게 지나가요",
          risk: "green",
        },
        {
          value: "guarded",
          label:
            "짖거나 경계하지만 보호자의 통제가 가능해요",
          risk: "yellow",
        },
        {
          value: "aggressive",
          label:
            "공격성을 보이거나 극도로 두려워해요",
          risk: "orange",
          note: "훈련 및 행동 교정 이력 확인 필요",
        },
      ],
    },
  ],
  5: [
    {
      id: "weightChange",
      question:
        "입양 당시에 비해 체중 변화가 있나요?",
      required: true,
      options: [
        {
          value: "stable",
          label: "비슷하게 잘 유지 중이에요",
          risk: "green",
        },
        {
          value: "slight_change",
          label:
            "활동량이 늘어 빠졌거나, 밥을 잘 먹어 쪘어요",
          risk: "yellow",
        },
        {
          value: "large_change",
          label:
            "눈에 띄게 살이 많이 찌거나 마른 것 같아요",
          risk: "orange",
          note: "급격한 증감 관리자 확인 필요",
        },
      ],
    },
  ],
};

/* =========================================================
 * 메인 컴포넌트
 * ======================================================= */

export function CertificationFormView({
  petId,
  round,
  petName,
  adopterName,
  adoptionDate,
  onSubmit,
}: CertificationFormViewProps) {
  const [answers, setAnswers] = useState<
    Record<string, string>
  >({});

  const [
    bodySymptoms,
    setBodySymptoms,
  ] = useState<string[]>([]);

  const [textInputs, setTextInputs] =
    useState<Record<string, string>>({});

  const [files, setFiles] = useState<
    Record<string, File | null>
  >({});

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const meta = roundMeta[round];

  const highestRisk = useMemo(
    () =>
      calculateHighestRisk(
        answers,
        bodySymptoms,
      ),
    [answers, bodySymptoms],
  );

  const handleAnswerChange = (
    questionId: string,
    value: string,
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));

    setErrorMessage("");
  };

  const handleTextChange = (
    fieldId: string,
    value: string,
  ) => {
    setTextInputs((previous) => ({
      ...previous,
      [fieldId]: value,
    }));
  };

  const handleFileChange = (
    fieldId: string,
    file: File | null,
  ) => {
    setFiles((previous) => ({
      ...previous,
      [fieldId]: file,
    }));

    setErrorMessage("");
  };

  const toggleBodySymptom = (
    symptom: string,
  ) => {
    setBodySymptoms((previous) => {
      if (symptom === "healthy") {
        return previous.includes("healthy")
          ? []
          : ["healthy"];
      }

      const withoutHealthy = previous.filter(
        (item) => item !== "healthy",
      );

      return withoutHealthy.includes(symptom)
        ? withoutHealthy.filter(
            (item) => item !== symptom,
          )
        : [...withoutHealthy, symptom];
    });

    setErrorMessage("");
  };

  const validateConditionalFields = () => {
    if (bodySymptoms.length === 0) {
      return "아이 몸의 특이사항을 하나 이상 선택해 주세요.";
    }

    if (
      bodySymptoms.includes("warning") &&
      !files.bodyWarningPhoto
    ) {
      return "구토, 피부염, 탈모 또는 절뚝거림을 선택한 경우 사진을 첨부해야 합니다.";
    }

    if (
      round === 1 &&
      !files.shelterPhoto
    ) {
      return "아이가 머무는 쉼터 사진을 첨부해 주세요.";
    }

    if (
      round === 2 &&
      !files.dailyMedia
    ) {
      return "산책 또는 놀이 사진이나 영상을 첨부해 주세요.";
    }

    if (
      round === 3 &&
      answers.animalRegistration ===
        "completed" &&
      !files.registrationProof
    ) {
      return "동물등록 완료를 선택한 경우 등록증 사진을 첨부해야 합니다.";
    }

    if (
      round === 3 &&
      answers.medicalCare ===
        "completed" &&
      !files.medicalProof
    ) {
      return "예방접종 또는 중성화 완료를 선택한 경우 증빙 사진을 첨부해야 합니다.";
    }

    if (
      round === 3 &&
      answers.medicalCare ===
        "delayed" &&
      !textInputs.medicalDelayReason?.trim()
    ) {
      return "의료 일정을 연기한 사유를 입력해 주세요.";
    }

    if (
      round === 5 &&
      (!textInputs.currentWeight ||
        Number(textInputs.currentWeight) <= 0)
    ) {
      return "현재 체중을 올바르게 입력해 주세요.";
    }

    return "";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationError =
      validateConditionalFields();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const submission: CertificationSubmission =
      {
        petId,
        round,
        petName,
        adopterName,
        adoptionDate,
        highestRisk,
        answers,
        bodySymptoms,
        textInputs,
        files,
      };

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      if (onSubmit) {
        await onSubmit(submission);
      } else {
        await submitCertificationForm(
          submission,
        );

        window.alert(
          "안부 인증이 제출되었습니다.",
        );
      }

      goBackAfterSubmission();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "인증 제출 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <main className="mx-auto w-full max-w-2xl">
        {/* 헤더 */}
        <header className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            Forever Way CLM
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            포에버웨이 안부 인증
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {petName}의 건강하고 행복한
            일상을 들려주세요.
          </p>

          {(adopterName || adoptionDate) && (
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
              {adopterName && (
                <span>
                  입양자: {adopterName}
                </span>
              )}

              {adoptionDate && (
                <span>
                  입양일: {adoptionDate}
                </span>
              )}
            </div>
          )}
        </header>

        {/* 회차 안내 */}
        <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex rounded-md bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                {meta.badge}
              </span>

              <h2 className="mt-3 text-xl font-extrabold text-slate-950">
                {meta.title}
              </h2>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <dt className="font-semibold text-slate-500">
                발송 시점
              </dt>

              <dd className="font-semibold text-slate-800">
                {meta.schedule}
              </dd>
            </div>

            <div className="grid grid-cols-[80px_1fr] gap-3">
              <dt className="font-semibold text-slate-500">
                인증 목적
              </dt>

              <dd className="leading-6 text-slate-700">
                {meta.purpose}
              </dd>
            </div>
          </dl>
        </section>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* 공통 모듈 */}
          <FormSection
            title="아이의 기본 건강 확인"
            description="모든 인증 회차에 공통으로 포함되는 필수 항목입니다."
          >
            <div className="space-y-4">
              {baseQuestions.map(
                (question, index) => (
                  <RadioQuestion
                    key={question.id}
                    number={index + 1}
                    config={question}
                    value={
                      answers[question.id] ?? ""
                    }
                    onChange={(value) =>
                      handleAnswerChange(
                        question.id,
                        value,
                      )
                    }
                  />
                ),
              )}

              <BodyConditionQuestion
                number={4}
                selected={bodySymptoms}
                observeDetail={
                  textInputs.bodyObserveDetail ??
                  ""
                }
                warningFile={
                  files.bodyWarningPhoto ??
                  null
                }
                onToggle={toggleBodySymptom}
                onObserveDetailChange={(value) =>
                  handleTextChange(
                    "bodyObserveDetail",
                    value,
                  )
                }
                onWarningFileChange={(file) =>
                  handleFileChange(
                    "bodyWarningPhoto",
                    file,
                  )
                }
              />
            </div>
          </FormSection>

          {/* 회차별 모듈 */}
          <FormSection
            title={meta.title}
            description={meta.purpose}
            badge={meta.badge}
          >
            <RoundModule
              round={round}
              answers={answers}
              textInputs={textInputs}
              files={files}
              onAnswerChange={
                handleAnswerChange
              }
              onTextChange={
                handleTextChange
              }
              onFileChange={
                handleFileChange
              }
            />
          </FormSection>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-base font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting
              ? "제출 중..."
              : "안부 인증 제출하기"}
          </button>
        </form>
      </main>
    </div>
  );
}

/* =========================================================
 * 회차별 문항
 * ======================================================= */

function RoundModule({
  round,
  answers,
  textInputs,
  files,
  onAnswerChange,
  onTextChange,
  onFileChange,
}: {
  round: CertificationRound;
  answers: Record<string, string>;
  textInputs: Record<string, string>;
  files: Record<string, File | null>;
  onAnswerChange: (
    questionId: string,
    value: string,
  ) => void;
  onTextChange: (
    fieldId: string,
    value: string,
  ) => void;
  onFileChange: (
    fieldId: string,
    file: File | null,
  ) => void;
}) {
  const questions =
    roundRadioQuestions[round] ?? [];

  if (round === 1) {
    return (
      <div className="space-y-4">
        <FileQuestion
          number={5}
          title="아이가 주로 머무는 쉼터는 어디인가요?"
          description="아이가 생활하는 공간의 사진을 첨부해 주세요."
          accept="image/*"
          file={files.shelterPhoto ?? null}
          required
          onChange={(file) =>
            onFileChange(
              "shelterPhoto",
              file,
            )
          }
        />

        <RadioQuestion
          number={6}
          config={questions[0]}
          value={
            answers.familyReaction ?? ""
          }
          onChange={(value) =>
            onAnswerChange(
              "familyReaction",
              value,
            )
          }
        />
      </div>
    );
  }

  if (round === 2) {
    return (
      <div className="space-y-4">
        <RadioQuestion
          number={5}
          config={questions[0]}
          value={
            answers.separationReaction ??
            ""
          }
          onChange={(value) =>
            onAnswerChange(
              "separationReaction",
              value,
            )
          }
        />

        <FileQuestion
          number={6}
          title="즐거운 일상 사진을 공유해 주세요."
          description="산책 또는 놀이 사진이나 영상을 첨부해 주세요."
          accept="image/*,video/*"
          file={files.dailyMedia ?? null}
          required
          onChange={(file) =>
            onFileChange(
              "dailyMedia",
              file,
            )
          }
        />
      </div>
    );
  }

  if (round === 3) {
    return (
      <div className="space-y-4">
        <RadioQuestion
          number={5}
          config={questions[0]}
          value={
            answers.animalRegistration ??
            ""
          }
          onChange={(value) =>
            onAnswerChange(
              "animalRegistration",
              value,
            )
          }
        />

        {answers.animalRegistration ===
          "completed" && (
          <ConditionalPanel>
            <FileUploadField
              label="동물등록증 사진"
              description="등록번호를 확인할 수 있는 사진을 첨부해 주세요."
              accept="image/*"
              file={
                files.registrationProof ??
                null
              }
              required
              onChange={(file) =>
                onFileChange(
                  "registrationProof",
                  file,
                )
              }
            />
          </ConditionalPanel>
        )}

        <RadioQuestion
          number={6}
          config={questions[1]}
          value={
            answers.medicalCare ?? ""
          }
          onChange={(value) =>
            onAnswerChange(
              "medicalCare",
              value,
            )
          }
        />

        {answers.medicalCare ===
          "completed" && (
          <ConditionalPanel>
            <FileUploadField
              label="예방접종 또는 중성화 증빙"
              description="진료 영수증이나 예방접종 수첩 사진을 첨부해 주세요."
              accept="image/*"
              file={
                files.medicalProof ?? null
              }
              required
              onChange={(file) =>
                onFileChange(
                  "medicalProof",
                  file,
                )
              }
            />
          </ConditionalPanel>
        )}

        {answers.medicalCare ===
          "delayed" && (
          <ConditionalPanel>
            <TextInputField
              label="일정 연기 사유"
              placeholder="예: 감기 기운으로 수의사 상담 후 일정을 미뤘습니다."
              value={
                textInputs.medicalDelayReason ??
                ""
              }
              required
              onChange={(value) =>
                onTextChange(
                  "medicalDelayReason",
                  value,
                )
              }
            />
          </ConditionalPanel>
        )}
      </div>
    );
  }

  if (round === 4) {
    return (
      <RadioQuestion
        number={5}
        config={questions[0]}
        value={
          answers.socialReaction ?? ""
        }
        onChange={(value) =>
          onAnswerChange(
            "socialReaction",
            value,
          )
        }
      />
    );
  }

  if (round === 5) {
    return (
      <div className="space-y-4">
        <QuestionCard
          number={5}
          title="현재 아이의 체중은 몇 kg인가요?"
        >
          <div className="relative">
            <input
              type="number"
              min="0.1"
              step="0.1"
              required
              value={
                textInputs.currentWeight ??
                ""
              }
              onChange={(event) =>
                onTextChange(
                  "currentWeight",
                  event.target.value,
                )
              }
              placeholder="예: 8.5"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 pr-12 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
              kg
            </span>
          </div>
        </QuestionCard>

        <RadioQuestion
          number={6}
          config={questions[0]}
          value={
            answers.weightChange ?? ""
          }
          onChange={(value) =>
            onAnswerChange(
              "weightChange",
              value,
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="font-bold text-slate-900">
        1년 종합 평가
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        현재 제공된 기획에는 6회차 전용
        질문과 선택지가 정의되어 있지
        않습니다. 공통 건강 문항을 기반으로
        제출하며, 상세 만족도 또는 종료 평가
        문항은 추후 추가할 수 있습니다.
      </p>
    </div>
  );
}

/* =========================================================
 * 공통 문항 컴포넌트
 * ======================================================= */

function RadioQuestion({
  number,
  config,
  value,
  onChange,
}: {
  number: number;
  config: RadioQuestionConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <QuestionCard
      number={number}
      title={config.question}
    >
      <div className="space-y-2.5">
        {config.options.map((option) => {
          const selected =
            value === option.value;

          return (
            <label
              key={option.value}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                selected
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <input
                type="radio"
                name={config.id}
                value={option.value}
                checked={selected}
                required={config.required}
                onChange={() =>
                  onChange(option.value)
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-blue-600"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold leading-6 text-slate-800">
                    {option.label}
                  </span>
                </div>

                {option.note && (
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {option.note}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </QuestionCard>
  );
}

function BodyConditionQuestion({
  number,
  selected,
  observeDetail,
  warningFile,
  onToggle,
  onObserveDetailChange,
  onWarningFileChange,
}: {
  number: number;
  selected: string[];
  observeDetail: string;
  warningFile: File | null;
  onToggle: (value: string) => void;
  onObserveDetailChange: (
    value: string,
  ) => void;
  onWarningFileChange: (
    file: File | null,
  ) => void;
}) {
  const symptomOptions = [
    {
      value: "healthy",
      label:
        "특별히 아픈 곳 없이 건강해요",
      risk: "green" as const,
    },
    {
      value: "observe",
      label:
        "눈물/귀지가 늘었어요 / 피부를 가끔 긁어요",
      risk: "yellow" as const,
    },
    {
      value: "warning",
      label:
        "구토/피부염/탈모/다리 절뚝거림이 보여요",
      risk: "orange" as const,
    },
  ];

  return (
    <QuestionCard
      number={number}
      title="아이 몸에 특이사항이 있나요?"
      description="다중 선택이 가능합니다. 건강함을 선택하면 다른 선택은 해제됩니다."
    >
      <div className="space-y-2.5">
        {symptomOptions.map((option) => {
          const checked =
            selected.includes(option.value);

          return (
            <label
              key={option.value}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                checked
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  onToggle(option.value)
                }
                className="mt-0.5 h-5 w-5 shrink-0 rounded accent-blue-600"
              />

              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold leading-6 text-slate-800">
                  {option.label}
                </span>
              </div>
            </label>
          );
        })}

        {selected.includes("observe") && (
          <ConditionalPanel>
            <TextInputField
              label="증상 상세 내용"
              placeholder="어떤 증상인지 간단히 입력해 주세요."
              value={observeDetail}
              onChange={
                onObserveDetailChange
              }
            />
          </ConditionalPanel>
        )}

        {selected.includes("warning") && (
          <ConditionalPanel>
            <FileUploadField
              label="증상 부위 사진"
              description="해당 증상을 확인할 수 있는 사진을 반드시 첨부해 주세요."
              accept="image/*"
              file={warningFile}
              required
              onChange={
                onWarningFileChange
              }
            />
          </ConditionalPanel>
        )}
      </div>
    </QuestionCard>
  );
}

/* =========================================================
 * UI 컴포넌트
 * ======================================================= */

function FormSection({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 border-b-2 border-slate-900 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-extrabold text-slate-950">
            {title}
          </h2>

          {badge && (
            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">
              {badge}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function QuestionCard({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-extrabold text-slate-950">
        {number}. {title}
      </h3>

      {description && (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}

      <div className="mt-4">
        {children}
      </div>
    </article>
  );
}

function FileQuestion({
  number,
  title,
  description,
  accept,
  file,
  required,
  onChange,
}: {
  number: number;
  title: string;
  description: string;
  accept: string;
  file: File | null;
  required?: boolean;
  onChange: (file: File | null) => void;
}) {
  return (
    <QuestionCard
      number={number}
      title={title}
      description={description}
    >
      <FileUploadField
        label="파일 첨부"
        description={description}
        accept={accept}
        file={file}
        required={required}
        onChange={onChange}
      />
    </QuestionCard>
  );
}

function FileUploadField({
  label,
  description,
  accept,
  file,
  required,
  onChange,
}: {
  label: string;
  description: string;
  accept: string;
  file: File | null;
  required?: boolean;
  onChange: (file: File | null) => void;
}) {
  const previewUrl = useFilePreview(file);

  const isVideo =
    file?.type.startsWith("video/") ??
    false;

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    onChange(
      event.target.files?.[0] ?? null,
    );
  };

  return (
    <div>
      <label className="block text-sm font-bold text-slate-800">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <input
        type="file"
        accept={accept}
        required={required && !file}
        onChange={handleChange}
        className="mt-3 block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-blue-600 file:px-4 file:py-3 file:text-sm file:font-bold file:text-white hover:file:bg-blue-700"
      />

      {file && (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
          {previewUrl &&
            (isVideo ? (
              <video
                src={previewUrl}
                controls
                className="max-h-64 w-full rounded-lg bg-black object-contain"
              />
            ) : (
              <img
                src={previewUrl}
                alt="첨부 파일 미리보기"
                className="max-h-64 w-full rounded-lg object-contain"
              />
            ))}

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-xs font-semibold text-slate-600">
              {file.name}
            </p>

            <button
              type="button"
              onClick={() => onChange(null)}
              className="shrink-0 text-xs font-bold text-red-600 hover:underline"
            >
              제거
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TextInputField({
  label,
  placeholder,
  value,
  required,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-800">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type="text"
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}

function ConditionalPanel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="ml-0 rounded-xl border border-blue-200 bg-blue-50/60 p-4 sm:ml-8">
      {children}
    </div>
  );
}

function RiskBadge({
  risk,
}: {
  risk: RiskLevel;
}) {
  const style = riskStyle[risk];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5",
        "text-xs font-bold",
        style.badgeClass,
      ].join(" ")}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${style.dotClass}`}
      />

      현재 {style.label}
    </span>
  );
}

/* =========================================================
 * Helpers
 * ======================================================= */

function calculateHighestRisk(
  answers: Record<string, string>,
  bodySymptoms: string[],
): RiskLevel {
  const risks: RiskLevel[] = [];

  const allRadioQuestions = [
    ...baseQuestions,
    ...Object.values(
      roundRadioQuestions,
    ).flatMap(
      (questions) => questions ?? [],
    ),
  ];

  for (const question of allRadioQuestions) {
    const selectedValue =
      answers[question.id];

    if (!selectedValue) {
      continue;
    }

    const selectedOption =
      question.options.find(
        (option) =>
          option.value === selectedValue,
      );

    if (selectedOption) {
      risks.push(selectedOption.risk);
    }
  }

  if (
    bodySymptoms.includes("healthy")
  ) {
    risks.push("green");
  }

  if (
    bodySymptoms.includes("observe")
  ) {
    risks.push("yellow");
  }

  if (
    bodySymptoms.includes("warning")
  ) {
    risks.push("orange");
  }

  if (risks.length === 0) {
    return "green";
  }

  return risks.reduce<RiskLevel>(
    (highest, current) =>
      riskWeight[current] >
      riskWeight[highest]
        ? current
        : highest,
    "green",
  );
}

async function submitCertificationForm(
  submission: CertificationSubmission,
) {
  const response = await fetch(
    `${getBackendBaseUrl()}/api/form/certifications/multipart`,
    {
      method: "POST",
      body: createCertificationFormData(
        submission,
      ),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Certification form submission failed.",
    );
  }

  return response.json();
}

function createCertificationFormData(
  submission: CertificationSubmission,
) {
  const formData = new FormData();
  const fileFieldIds: string[] = [];

  formData.set(
    "round",
    String(submission.round),
  );
  formData.set("petName", submission.petName);

  if (submission.petId) {
    formData.set("petId", submission.petId);
  }
  formData.set(
    "highestRisk",
    submission.highestRisk,
  );
  formData.set(
    "answers",
    JSON.stringify(submission.answers),
  );
  formData.set(
    "bodySymptoms",
    JSON.stringify(submission.bodySymptoms),
  );
  formData.set(
    "textInputs",
    JSON.stringify(submission.textInputs),
  );

  if (submission.adopterName) {
    formData.set(
      "adopterName",
      submission.adopterName,
    );
  }

  if (submission.adoptionDate) {
    formData.set(
      "adoptionDate",
      submission.adoptionDate,
    );
  }

  for (const [fieldId, file] of Object.entries(
    submission.files,
  )) {
    if (!file) {
      continue;
    }

    fileFieldIds.push(fieldId);
    formData.append("uploadedFiles", file);
  }

  formData.set(
    "fileFieldIds",
    JSON.stringify(fileFieldIds),
  );

  return formData;
}

function getBackendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000"
  );
}

function goBackAfterSubmission() {
  window.location.assign("/risk");
}

function useFilePreview(
  file: File | null,
) {
  const previewUrl = useMemo(() => {
    if (!file) {
      return "";
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return previewUrl;
}
