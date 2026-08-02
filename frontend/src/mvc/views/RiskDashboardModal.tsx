"use client";

/* eslint-disable @next/next/no-img-element */

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (settings: {
          objectType: "feed";
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: { mobileWebUrl: string; webUrl: string };
          };
          buttons: Array<{
            title: string;
            link: { mobileWebUrl: string; webUrl: string };
          }>;
        }) => void;
      };
    };
  }
}

import type {
  ChangeEvent,
  ReactNode,
} from "react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  CertificationAnswerTone,
  Contract,
  GradeOption,
  ManualGrade,
  RiskCertificationCard,
  RiskConfig,
  RiskDashboardData,
  RiskUpcomingTimeline,
} from "@/mvc/models/adminModel";

type RiskDashboardModalProps = {
  applicantPhone: string;
  contract: Contract | null;
  dashboardData: RiskDashboardData | null;
  upcomingTimeline: RiskUpcomingTimeline | null;
  certificationCards: RiskCertificationCard[];
  riskConfig?: RiskConfig;
  onCertificationApprove?: (
    contractId: string,
    certificationId: string,
    approvedStatus: string,
  ) => void;
  onClose: () => void;
};

const DEFAULT_RISK_CONFIG: RiskConfig = {
  gradeOptions: [
    {
      value: "urgent",
      label: "긴급 (Red)",
      shortLabel: "긴급",
      badgeClass: "border-red-400 bg-red-500 text-white",
      dotClass: "bg-red-200",
      textClass: "text-red-600",
    },
    {
      value: "caution",
      label: "주의 (Orange)",
      shortLabel: "주의",
      badgeClass: "border-orange-400 bg-orange-500 text-white",
      dotClass: "bg-orange-200",
      textClass: "text-orange-600",
    },
    {
      value: "observe",
      label: "관찰 (Yellow)",
      shortLabel: "관찰",
      badgeClass: "border-yellow-400 bg-yellow-400 text-yellow-950",
      dotClass: "bg-yellow-200",
      textClass: "text-yellow-600",
    },
    {
      value: "normal",
      label: "정상 (Green)",
      shortLabel: "정상",
      badgeClass: "border-emerald-400 bg-emerald-500 text-white",
      dotClass: "bg-emerald-200",
      textClass: "text-emerald-600",
    },
  ],
  reasonCategories: [
    "연락 두절",
    "안부 인증 미제출",
    "안부 인증 지연",
    "건강 이상 징후",
    "주거 환경 문제",
    "계약 위반 의심",
    "기타 사유",
  ],
  actionOptions: [
    "우선 전화 상담 완료",
    "필수 의무 미이행 안내 발송",
    "제휴 동물병원 건강상담 링크 발송",
    "다음 안부 주기 집중 모니터링 대상으로 태그 지정",
  ],
  fallbackRows: [],
};

type ManualStatusPayload = {
  grade: ManualGrade;
  category: string;
  reason: string;
};

type ExtendedContract = Contract & {
  petImageUrl?: string;
};

type CertificationReviewResult = {
  imageDataUrl: string;
  actions: string[];
  comment: string;
};

let kakaoNoticeSdkPromise:
  | Promise<NonNullable<Window["Kakao"]>>
  | null = null;

function loadKakaoSdkForNotice() {
  if (window.Kakao) {
    return Promise.resolve(window.Kakao);
  }
  if (kakaoNoticeSdkPromise) {
    return kakaoNoticeSdkPromise;
  }

  kakaoNoticeSdkPromise = new Promise(
    (resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://t1.kakaocdn.net/kakao_js_sdk/2.8.1/kakao.min.js";
      script.async = true;
      script.onload = () => {
        if (window.Kakao) {
          resolve(window.Kakao);
        } else {
          reject(
            new Error(
              "\uCE74\uCE74\uC624 SDK\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
            ),
          );
        }
      };
      script.onerror = () => {
        kakaoNoticeSdkPromise = null;
        reject(
          new Error(
            "\uCE74\uCE74\uC624 SDK\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
          ),
        );
      };
      document.head.appendChild(script);
    },
  );

  return kakaoNoticeSdkPromise;
}

export function RiskDashboardModal({
  applicantPhone,
  contract,
  dashboardData,
  upcomingTimeline,
  certificationCards,
  riskConfig = DEFAULT_RISK_CONFIG,
  onCertificationApprove,
  onClose,
}: RiskDashboardModalProps) {
  const {
    actionOptions,
    gradeOptions,
    reasonCategories,
  } = riskConfig;

  const [isStatusModalOpen, setIsStatusModalOpen] =
    useState(false);
  const [currentGrade, setCurrentGrade] =
    useState<ManualGrade>(
      (dashboardData?.manualGrade as ManualGrade) ||
      getInitialGradeFromValues(contract, dashboardData),
    );
  const [
    currentHeaderStatus,
    setCurrentHeaderStatus,
  ] = useState(
    dashboardData?.manualGrade
      ? dashboardData.manualGrade === "normal"
        ? "\uC815\uC0C1"
        : `${dashboardData.manualCategory ?? ""}`
      : dashboardData?.headerStatus ??
        "\uC8FC\uC758 (\uBBF8\uC2B9\uC778)",
  );
  const [
    currentStatusDetail,
    setCurrentStatusDetail,
  ] = useState(
    dashboardData?.manualReason ||
    (contract?.nextCheck ??
      "\uC548\uBD80 \uC778\uC99D \uAC80\uD1A0\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4."),
  );
  const [currentCategory, setCurrentCategory] =
    useState(
      dashboardData?.manualCategory ||
      "\uC548\uBD80 \uC778\uC99D \uBBF8\uC81C\uCD9C",
    );
  const [
    localCertificationCards,
    setLocalCertificationCards,
  ] = useState<RiskCertificationCard[]>(
    certificationCards,
  );

  useEffect(() => {
    setLocalCertificationCards(certificationCards);
  }, [certificationCards]);
  const [
    selectedCertificationId,
    setSelectedCertificationId,
  ] = useState<string | null>(null);
  const [noticeStatus, setNoticeStatus] =
    useState("");

  const selectedCertification =
    useMemo(
      () =>
        localCertificationCards.find(
          (card) =>
            card.id ===
            selectedCertificationId,
        ) ?? null,
      [
        localCertificationCards,
        selectedCertificationId,
      ],
    );

  if (
    !contract ||
    !dashboardData ||
    !upcomingTimeline
  ) {
    return null;
  }

  const currentGradeStyle = getGradeOption(
    currentGrade,
    gradeOptions,
  );
  const handleUpcomingNotice = async () => {
    const dueDate =
      upcomingTimeline.description.match(
        /\d{4}\.\d{2}\.\d{2}/,
      )?.[0] ?? "\uC608\uC815\uC77C";
    const nextRound = Math.min(
      (contract.certificationRound ?? 0) + 1,
      6,
    );
    const params = new URLSearchParams({
      petId: contract.id,
      petName: contract.petName,
      adopterName: contract.adopterName,
      adoptionDate: contract.signedAt,
      round: String(nextRound),
      sentAt: new Date().toISOString(),
    });
    const formUrl = buildCertificationFormUrl(params);

    setNoticeStatus("\uCE74\uCE74\uC624\uD1A1 \uC5EC\uB294 \uC911...");
    try {
      const kakao = await loadKakaoSdkForNotice();
      const javascriptKey =
        process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY?.trim();
      if (!javascriptKey) {
        throw new Error(
          "NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
        );
      }
      if (!kakao.isInitialized()) {
        kakao.init(javascriptKey);
      }

      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: `${contract.petName} \uC548\uBD80 \uC778\uC99D \uC0AC\uC804 \uC548\uB0B4`,
          description: `${contract.adopterName}\uB2D8, ${dueDate}\uAE4C\uC9C0 ${contract.petName}\uC758 \uC548\uBD80 \uC778\uC99D \uD3FC\uC744 \uC791\uC131\uD574 \uC8FC\uC138\uC694.`,
          imageUrl:
            "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80",
          link: {
            mobileWebUrl: formUrl,
            webUrl: formUrl,
          },
        },
        buttons: [
          {
            title: "\uC548\uBD80 \uC778\uC99D \uD3FC \uC791\uC131\uD558\uAE30",
            link: {
              mobileWebUrl: formUrl,
              webUrl: formUrl,
            },
          },
        ],
      });
      setNoticeStatus("");
    } catch (error) {
      setNoticeStatus(
        error instanceof Error
          ? error.message
          : "\uCE74\uCE74\uC624\uD1A1 \uACF5\uC720\uCC3D\uC744 \uC5F4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      );
    }
  };

  const handleStatusSave = ({
    grade,
    category,
    reason,
  }: ManualStatusPayload) => {
    const selectedGrade = getGradeOption(
      grade,
      gradeOptions,
    );

    setCurrentGrade(grade);
    setCurrentCategory(category);
    setCurrentStatusDetail(reason);
    setCurrentHeaderStatus(
      grade === "normal"
        ? "\uC815\uC0C1"
        : `${selectedGrade.shortLabel} (${category})`,
    );
    setIsStatusModalOpen(false);

    void persistManualStatus(
      contract.id,
      grade,
      category,
      reason,
    );
  };

  const handleCertificationApprove = (
    result: CertificationReviewResult,
  ) => {
    if (!selectedCertificationId) {
      return;
    }

    const approvalDate = formatDate(
      new Date(),
    );
    const approvedStatus = `\uC2B9\uC778\uC644\uB8CC (${approvalDate})`;

    setLocalCertificationCards(
      (previousCards) =>
        previousCards.map((card) =>
          card.id ===
          selectedCertificationId
            ? {
                ...card,
                tone: "approved",
                status: approvedStatus,
                imageUrl:
                  result.imageDataUrl ||
                  card.imageUrl,
                managerActions:
                  result.actions,
                managerComment:
                  result.comment,
              }
            : card,
        ),
    );

    onCertificationApprove?.(
      contract.id,
      selectedCertificationId,
      approvedStatus,
    );

    void persistCertificationApproval(
      contract.id,
      selectedCertificationId,
      approvedStatus,
      result.actions,
      result.comment,
    );

    setSelectedCertificationId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/35 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="risk-dashboard-title"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100vh-4rem)] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="flex min-h-[56px] items-center justify-between gap-4 bg-blue-600 px-6 py-3.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h2
              id="risk-dashboard-title"
              className="truncate text-base font-bold text-white"
            >
              {contract.petName} (
              {contract.adopterName}) - CLM
              사후관리 대시보드
            </h2>

            <button
              type="button"
              onClick={() =>
                setIsStatusModalOpen(true)
              }
              className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border",
                "px-3 py-1 text-[11px] font-bold shadow-sm transition",
                "hover:scale-[1.02] hover:shadow-md",
                currentGradeStyle.badgeClass,
              ].join(" ")}
              aria-label="관리자 상태 수동 변경"
            >
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  currentGradeStyle.dotClass,
                ].join(" ")}
              />
              {currentHeaderStatus}
              <span aria-hidden="true">✎</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="모달 닫기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white/90 transition hover:bg-white/15 hover:text-white"
          >
            ✕
          </button>
        </header>

        <div className="relative bg-slate-50 p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside>
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 text-[13px] font-bold text-blue-600">
                  <span aria-hidden="true">📄</span>
                  입양 계약 체결 정보
                </h3>

                <dl className="mt-3.5 space-y-3">
                  <ContractInfoRow
                    label="계약서 ID"
                    value={contract.id}
                  />
                  <ContractInfoRow
                    label="체결 일자"
                    value={
                      dashboardData.signedDate
                    }
                  />
                  <ContractInfoRow
                    label="모니터링 주기"
                    value="총 1년 (6회)"
                  />
                  <ContractInfoRow
                    label="특약 약정"
                    value={
                      <span className="font-bold text-orange-600">
                        {
                          dashboardData.behaviorTrait
                        }
                      </span>
                    }
                  />
                </dl>

                <button
                  type="button"
                  className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-[13px] font-bold text-white transition hover:bg-blue-700"
                >
                  계약서 원본 열람하기
                </button>
              </section>

              <section className="mt-4 px-1">
                <h3 className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                  <span aria-hidden="true">💡</span>
                  관리자 검토 가이드
                </h3>
                <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                  우측의 인증 카드를 클릭하면 상세
                  내용 검토가 가능합니다. 정상 외
                  등급은 체크박스 조치 또는 텍스트
                  입력을 거쳐야 승인됩니다.
                </p>

                {applicantPhone ? (
                  <span className="mt-2.5 inline-flex text-[11px] font-semibold text-blue-600">
                    입양자 연락처{" "}
                    {applicantPhone}
                  </span>
                ) : (
                  <p className="mt-2.5 text-[11px] text-slate-400">
                    등록된 연락처가 없습니다.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setIsStatusModalOpen(true)
                  }
                  className="mt-3 inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  상태 수동 변경
                </button>
              </section>
            </aside>

            <main className="min-w-0">
              <section className="rounded-xl border border-blue-300 bg-blue-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">
                      {
                        upcomingTimeline.label
                      }
                    </p>
                    <h3 className="mt-1 text-[15px] font-bold text-slate-950">
                      {
                        upcomingTimeline.title
                      }
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {
                        upcomingTimeline.description
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleUpcomingNotice}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[12px] font-bold text-white transition hover:bg-blue-700"
                  >
                    <span aria-hidden="true">🔔</span>
                    {
                      upcomingTimeline.buttonLabel
                    }
                  </button>
                </div>
                {noticeStatus && (
                  <p className="mt-2.5 text-right text-[11px] font-semibold text-blue-700" role="status">
                    {noticeStatus}
                  </p>
                )}
              </section>

              <div className="mt-5 flex flex-wrap items-center gap-1.5">
                <h3 className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
                  <span aria-hidden="true">📍</span>
                  제출된 안부 인증 카드
                </h3>
                <span className="text-[12px] text-slate-500">
                  (클릭하여 승인 검토)
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {localCertificationCards.map(
                  (card) => (
                    <CertificationCard
                      key={card.id}
                      card={card}
                      onClick={() =>
                        setSelectedCertificationId(
                          card.id,
                        )
                      }
                    />
                  ),
                )}

                {localCertificationCards.length ===
                  0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                    <p className="text-[13px] text-slate-500">
                      제출된 안부 인증 카드가
                      없습니다.
                    </p>
                  </div>
                )}
              </div>

              <section className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[11px] font-bold text-slate-500">
                    최근 관리자 상태 메모
                  </h3>
                  <span
                    className={`text-[11px] font-bold ${currentGradeStyle.textClass}`}
                  >
                    {currentCategory}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-5 text-slate-700">
                  {currentStatusDetail}
                </p>
              </section>
            </main>
          </div>
        </div>
      </div>

      {isStatusModalOpen && (
        <ManualStatusModal
          currentGrade={currentGrade}
          currentHeaderStatus={
            currentHeaderStatus
          }
          currentStatusDetail={
            currentStatusDetail
          }
          gradeOptions={gradeOptions}
          reasonCategories={reasonCategories}
          onClose={() =>
            setIsStatusModalOpen(false)
          }
          onSave={handleStatusSave}
        />
      )}

      {selectedCertification && (
        <CertificationReviewModal
          card={selectedCertification}
          contract={contract}
          actionOptions={actionOptions}
          onClose={() =>
            setSelectedCertificationId(
              null,
            )
          }
          onApprove={
            handleCertificationApprove
          }
        />
      )}
    </div>
  );
}

function CertificationCard({
  card,
  onClick,
}: {
  card: RiskCertificationCard;
  onClick: () => void;
}) {
  const style = {
    caution: {
      badge:
        "border-amber-300 bg-amber-50 text-amber-700",
      divider: "bg-amber-300",
      dot: "bg-orange-500",
      gradeLabel: "주의",
    },
    approved: {
      badge:
        "border-emerald-300 bg-emerald-50 text-emerald-700",
      divider: "bg-emerald-300",
      dot: "bg-emerald-500",
      gradeLabel: "승인완료",
    },
  }[card.tone];

  const isApproved = card.tone === "approved";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-xl border border-slate-200 bg-white p-4 text-left",
        "transition hover:border-blue-400 hover:shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
      ].join(" ")}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="text-[14px] font-bold text-slate-950">
            {card.title}
          </h4>
          <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
            {card.description}
          </p>
        </div>

        <span
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border",
            "px-2.5 py-1 text-[11px] font-bold",
            style.badge,
          ].join(" ")}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
          />

          {isApproved ? (
            <span>{card.status}</span>
          ) : (
            <>
              <span>{style.gradeLabel}</span>
              <span
                className={`h-3 w-px ${style.divider}`}
                aria-hidden="true"
              />
              <span>{card.status}</span>
            </>
          )}
        </span>
      </div>
    </button>
  );
}

function CertificationReviewModal({
  card,
  contract,
  actionOptions,
  onClose,
  onApprove,
}: {
  card: RiskCertificationCard;
  contract: Contract;
  actionOptions: string[];
  onClose: () => void;
  onApprove: (
    result: CertificationReviewResult,
  ) => void;
}) {
  const extendedContract =
    contract as ExtendedContract;
  const fileInputRef =
    useRef<HTMLInputElement>(null);
  const [imageDataUrl, setImageDataUrl] =
    useState(
      card.imageUrl ??
        extendedContract.petImageUrl ??
        "",
    );
  const [
    selectedActions,
    setSelectedActions,
  ] = useState<string[]>(
    card.managerActions ?? [],
  );
  const [comment, setComment] =
    useState(
      card.managerComment ?? "",
    );

  const answers = card.answers ?? [];
  const isAllNormal =
    answers.length > 0 &&
    answers.every(
      (answer) =>
        answer.tone === "normal",
    );

  const isApproved =
    card.tone === "approved";

  const gradeLabel = isAllNormal
    ? "정상"
    : isApproved
      ? "승인 완료"
      : "주의";

  // 위험 신호가 잡힌 문항의 Q번호를 추출해 등급 산정 근거로 표시합니다.
  const flaggedQuestionCodes = answers
    .filter(
      (answer) =>
        answer.tone !== "normal",
    )
    .map(
      (answer) =>
        answer.question.match(
          /^Q\d+/,
        )?.[0],
    )
    .filter(
      (code): code is string =>
        Boolean(code),
    );

  // 정상 등급이 아니면 조치 체크 또는 코멘트 입력을 거쳐야 승인할 수 있습니다.
  const canApprove =
    isAllNormal ||
    selectedActions.length > 0 ||
    comment.trim().length > 0;

  const handleImageSelect = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile =
      event.target.files?.[0];
    if (!selectedFile) {
      return;
    }
    if (
      !selectedFile.type.startsWith(
        "image/",
      )
    ) {
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (
        typeof reader.result === "string"
      ) {
        setImageDataUrl(
          reader.result,
        );
      }
    };
    reader.readAsDataURL(
      selectedFile,
    );
    event.target.value = "";
  };

  const toggleAction = (
    action: string,
  ) => {
    setSelectedActions(
      (previousActions) =>
        previousActions.includes(action)
          ? previousActions.filter(
              (item) =>
                item !== action,
            )
          : [
              ...previousActions,
              action,
            ],
    );
  };

  const handleApprove = () => {
    onApprove({
      imageDataUrl,
      actions: isAllNormal
        ? []
        : selectedActions,
      comment: isAllNormal
        ? ""
        : comment.trim(),
    });
  };

  const submittedAt =
    card.submittedAt ?? "";
  const roundLabel =
    card.roundLabel ?? "";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certification-review-title"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="flex min-h-[56px] items-center justify-between gap-4 bg-blue-600 px-6 py-3.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h2
              id="certification-review-title"
              className="truncate text-base font-bold text-white"
            >
              {contract.petName}(
              {contract.adopterName}) -{" "}
              {roundLabel || card.title}{" "}
              정기 인증 검토
            </h2>

            <span
              className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-full",
                "px-2.5 py-0.5 text-[11px] font-bold text-white",
                isAllNormal || isApproved
                  ? "bg-emerald-500"
                  : "bg-orange-500",
              ].join(" ")}
            >
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  isAllNormal || isApproved
                    ? "bg-emerald-200"
                    : "bg-orange-200",
                ].join(" ")}
              />
              {gradeLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="인증 검토 모달 닫기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white/90 transition hover:bg-white/15 hover:text-white"
          >
            ✕
          </button>
        </header>

        <div className="grid gap-5 bg-slate-50 px-5 py-5 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={
                handleImageSelect
              }
            />
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="group relative h-[210px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left"
              aria-label="인증 사진 선택 및 변경"
            >
              {imageDataUrl ? (
                <img
                  src={imageDataUrl}
                  alt={`${contract.petName} 인증 사진`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 px-5 text-center">
                  <p className="text-[13px] font-bold leading-6 text-slate-600">
                    첨부된 사진이 없습니다.
                    <br />
                    클릭하여 사진을
                    선택하세요.
                  </p>
                </div>
              )}
              <div className="absolute inset-0 flex items-end justify-center bg-black/0 p-3 transition group-hover:bg-black/25">
                <span className="translate-y-2 rounded-lg bg-black/75 px-3 py-1.5 text-[11px] font-bold text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  사진 선택 및 변경
                </span>
              </div>
            </button>

            <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">
              제출 일시: {submittedAt}
              <br />
              회차: {roundLabel}
            </p>
          </aside>

          <main className="min-w-0 space-y-3">
            <section className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[10px] leading-4 text-slate-400">
                {isAllNormal
                  ? "* 모든 문항에서 위험 신호가 확인되지 않아 최종 [정상] 등급으로 산정됨"
                  : flaggedQuestionCodes.length > 0
                    ? `* 가장 높은 위험도 문항(${flaggedQuestionCodes.join(", ")}) 기준으로 최종 [${gradeLabel}] 등급 산정됨`
                    : `* 최종 [${gradeLabel}] 등급으로 산정됨`}
              </p>

              <dl className="mt-2 divide-y divide-slate-100">
                {answers.map(
                  (answer) => (
                    <CertificationAnswerRow
                      key={
                        answer.question
                      }
                      question={
                        answer.question
                      }
                      answer={
                        answer.answer
                      }
                      tone={
                        answer.tone
                      }
                      highlighted={
                        answer.highlighted
                      }
                    />
                  ),
                )}

                {answers.length === 0 && (
                  <p className="px-2 py-4 text-center text-[12px] text-slate-500">
                    제출된 응답 내용이 없습니다.
                  </p>
                )}
              </dl>
            </section>

            {isAllNormal ? (
              <NormalQuickApprovalGuide />
            ) : (
              <>
                <section className="rounded-xl border border-amber-300 bg-amber-50 p-3.5">
                  <h3 className="text-[12px] font-bold text-orange-700">
                    [{gradeLabel} 등급] 시스템 추천 조치 가이드
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {flaggedQuestionCodes.length >
                      0 && (
                      <li className="text-[11px] leading-5 text-orange-800">
                        • 위험 신호가 확인된 문항
                        ({flaggedQuestionCodes.join(", ")})
                        을 우선 확인하고 보호자
                        유선 안내를 진행하세요.
                      </li>
                    )}
                    <li className="text-[11px] leading-5 text-orange-800">
                      • 첨부된 사진으로 증상 여부를
                      확인하고 필요 시 병원 내원을
                      권고하세요.
                    </li>
                    <li className="text-[11px] leading-5 text-orange-800">
                      • 아래 조치를 1개 이상
                      선택하거나 관리자 코멘트를
                      입력해야 승인할 수 있습니다.
                    </li>
                  </ul>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[13px] font-bold text-slate-950">
                      수행한 조치 선택
                    </h3>
                    <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                      1개 이상 체크 필수
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-2">
                    {actionOptions.map(
                      (action) => (
                        <label
                          key={action}
                          className="flex cursor-pointer items-start gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedActions.includes(
                              action,
                            )}
                            onChange={() =>
                              toggleAction(
                                action,
                              )
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                          />
                          <span className="text-[12px] font-medium leading-5 text-slate-700">
                            {action}
                          </span>
                        </label>
                      ),
                    )}
                  </div>

                  <label
                    htmlFor="manager-comment"
                    className="mt-3 block text-[12px] font-bold text-slate-950"
                  >
                    직접 입력 (관리자 코멘트)
                  </label>
                  <textarea
                    id="manager-comment"
                    value={comment}
                    onChange={(event) =>
                      setComment(
                        event.target.value,
                      )
                    }
                    rows={3}
                    placeholder="특이사항이 있는 경우 자유롭게 적어주세요."
                    className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12px] leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </section>
              </>
            )}
          </main>
        </div>

        <footer className="sticky bottom-0 flex items-center gap-3 border-t border-slate-200 bg-white px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 shrink-0 rounded-lg bg-slate-200 px-6 text-[13px] font-bold text-slate-700 transition hover:bg-slate-300"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={
              handleApprove
            }
            disabled={!canApprove}
            className={[
              "flex h-10 flex-1 items-center justify-center rounded-lg",
              "px-6 text-[13px] font-bold text-white transition",
              "disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500",
              isAllNormal
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-blue-600 hover:bg-blue-700",
            ].join(" ")}
          >
            {isAllNormal
              ? "정상 안부 1-Click 빠른 승인 처리"
              : "조치 완결 및 최종 승인 처리"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function NormalQuickApprovalGuide() {
  return (
    <section className="rounded-xl border border-emerald-300 bg-emerald-50 p-3.5">
      <h3 className="text-[12px] font-bold text-emerald-800">
        [정상 등급] 빠른 승인 가이드
      </h3>
      <p className="mt-1.5 text-[11px] leading-5 text-emerald-800">
        특이사항이나 위험 신호가 없습니다.
        별도 체크 없이 1-Click 빠른 승인이
        가능합니다.
      </p>
    </section>
  );
}

function ManualStatusModal({
  currentGrade,
  currentHeaderStatus,
  currentStatusDetail,
  gradeOptions,
  reasonCategories,
  onClose,
  onSave,
}: {
  currentGrade: ManualGrade;
  currentHeaderStatus: string;
  currentStatusDetail: string;
  gradeOptions: GradeOption[];
  reasonCategories: string[];
  onClose: () => void;
  onSave: (
    payload: ManualStatusPayload,
  ) => void;
}) {
  const [
    selectedGrade,
    setSelectedGrade,
  ] = useState<ManualGrade>(
    currentGrade,
  );
  const [category, setCategory] =
    useState("\uAE30\uD0C0 \uC0AC\uC720");
  const [reason, setReason] =
    useState(currentStatusDetail);
  const currentStyle = getGradeOption(
    currentGrade,
    gradeOptions,
  );

  const handleSubmit = () => {
    const trimmedReason =
      reason.trim();
    if (!trimmedReason) {
      return;
    }
    onSave({
      grade: selectedGrade,
      category,
      reason: trimmedReason,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-900/45 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-status-title"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-500">
            <SettingsIcon />
          </span>
          <h2
            id="manual-status-title"
            className="min-w-0 flex-1 text-lg font-extrabold text-slate-950"
          >
            관리자 상태 수동 변경
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="상태 변경 모달 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl font-bold text-slate-900 transition hover:bg-slate-100"
          >
            ×
          </button>
        </header>

        <div className="space-y-5 bg-white px-6 py-5">
          <section>
            <p className="text-xs font-bold text-slate-700">
              현재 상태
            </p>
            <div className="mt-2 flex min-h-11 flex-wrap items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600">
              <span className="hidden text-slate-300">
                [
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${getManualGradeDotClass(currentGrade)}`}
              />
              <span
                className={
                  currentStyle.textClass
                }
              >
                {currentHeaderStatus}
              </span>
              <span className="hidden text-slate-300">
                ]
              </span>
              <span className="hidden text-slate-300">
                /
              </span>
              <span className="font-semibold">
                {currentStatusDetail}
              </span>
            </div>
          </section>

          <SelectField
            id="manual-grade"
            label="변경할 위험 등급 선택"
            value={selectedGrade}
            showStatusDot
            onChange={(value) =>
              setSelectedGrade(
                value as ManualGrade,
              )
            }
            options={gradeOptions.map(
              (option) => ({
                value: option.value,
                label: option.label,
              }),
            )}
          />

          <SelectField
            id="manual-category"
            label="변경 분류 선택"
            value={category}
            onChange={setCategory}
            options={reasonCategories.map(
              (item) => ({
                value: item,
                label: item,
              }),
            )}
          />

          <div>
            <label
              htmlFor="manual-reason"
              className="mb-2 block text-xs font-bold text-slate-600"
            >
              상세 사유 입력 (필수)
            </label>
            <textarea
              id="manual-reason"
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value,
                )
              }
              rows={5}
              placeholder="상태 변경 사유와 후속 조치 계획을 입력하세요."
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <footer className="grid grid-cols-2 gap-3 bg-white px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="h-12 rounded-lg bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            변경 저장
          </button>
        </footer>
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  showStatusDot = false,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  showStatusDot?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-bold text-slate-600"
      >
        {label}
      </label>
      <div className="relative">
        {showStatusDot && (
          <span
            aria-hidden="true"
            className={[
              "pointer-events-none absolute left-4 top-1/2 h-2.5 w-2.5",
              "-translate-y-1/2 rounded-full",
              getManualGradeDotClass(value),
            ].join(" ")}
          />
        )}
        <select
          id={id}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={[
            "h-11 w-full appearance-none rounded-lg border border-slate-200",
            "bg-white pr-10 text-sm font-semibold text-slate-900 outline-none",
            "transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
            showStatusDot ? "pl-9" : "pl-3",
          ].join(" ")}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg leading-none text-slate-300"
        >
          ⌄
        </span>
      </div>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function ContractInfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-start gap-3">
      <dt className="text-xs font-medium text-slate-500">
        {label}
      </dt>
      <dd className="break-words text-right text-sm font-extrabold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

function CertificationAnswerRow({
  question,
  answer,
  tone,
  highlighted = false,
}: {
  question: string;
  answer: string;
  tone: CertificationAnswerTone;
  highlighted?: boolean;
}) {
  const toneStyle = {
    normal: {
      dot: "bg-emerald-500",
      text: "text-slate-900",
    },
    observe: {
      dot: "bg-yellow-400",
      text: "text-slate-900",
    },
    caution: {
      dot: "bg-orange-500",
      text: "text-orange-600",
    },
  }[tone];

  return (
    <div
      className={[
        "grid gap-2 rounded-md px-2 py-1.5",
        "sm:grid-cols-[minmax(150px,1fr)_minmax(160px,auto)]",
        highlighted
          ? "bg-amber-50"
          : "bg-white",
      ].join(" ")}
    >
      <dt
        className={[
          "text-[11px] font-semibold leading-5",
          highlighted
            ? "text-orange-600"
            : "text-slate-500",
        ].join(" ")}
      >
        {question}
      </dt>
      <dd
        className={[
          "flex items-start justify-end gap-1.5",
          "text-right text-[11px] font-bold leading-5",
          toneStyle.text,
        ].join(" ")}
      >
        <span
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${toneStyle.dot}`}
        />
        <span>{answer}</span>
      </dd>
    </div>
  );
}

function getInitialGradeFromValues(
  contract: Contract | null,
  dashboardData: RiskDashboardData | null,
): ManualGrade {
  if (!contract || !dashboardData) {
    return "caution";
  }

  const statusText = [
    contract.status,
    dashboardData.headerStatus,
    contract.nextCheck,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    contract.risk === "urgent" ||
    statusText.includes("긴급") ||
    statusText.includes("red")
  ) {
    return "urgent";
  }
  if (
    statusText.includes("관찰") ||
    statusText.includes("yellow")
  ) {
    return "observe";
  }
  if (
    contract.risk === "normal" ||
    statusText.includes("정상") ||
    statusText.includes("green") ||
    statusText.includes("승인 완료")
  ) {
    return "normal";
  }

  return "caution";
}

function getGradeOption(
  grade: ManualGrade,
  gradeOptions: GradeOption[],
) {
  return (
    gradeOptions.find(
      (option) =>
        option.value === grade,
    ) ?? gradeOptions[1]
  );
}

function getManualGradeDotClass(value: string) {
  switch (value) {
    case "urgent":
      return "bg-red-500";
    case "caution":
      return "bg-orange-500";
    case "observe":
      return "bg-yellow-400";
    case "normal":
      return "bg-emerald-500";
    default:
      return "bg-slate-300";
  }
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

async function persistCertificationApproval(
  contractId: string,
  certificationId: string,
  approvedStatus: string,
  managerActions: string[] = [],
  managerComment: string = "",
) {
  try {
    const response = await fetch(
      `${getBackendBaseUrl()}/api/risk/contracts/${encodeURIComponent(
        contractId,
      )}/certifications/${encodeURIComponent(certificationId)}/approve`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approvedStatus,
          managerActions,
          managerComment,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        "Risk approval API request failed.",
      );
    }
  } catch (error) {
    console.error(error);
  }
}

function getBackendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000"
  );
}

function buildCertificationFormUrl(params: URLSearchParams) {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_CERTIFICATION_FORM_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_BASE_URL?.trim() ||
    window.location.origin;

  return new URL(
    `/certification?${params.toString()}`,
    configuredBaseUrl,
  ).toString();
}

async function persistManualStatus(
  contractId: string,
  grade: string,
  category: string,
  reason: string,
) {
  try {
    const response = await fetch(
      `${getBackendBaseUrl()}/api/risk/contracts/${encodeURIComponent(contractId)}/manual-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade,
          category,
          reason,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Manual status API request failed.");
    }
  } catch (error) {
    console.error(error);
  }
}
