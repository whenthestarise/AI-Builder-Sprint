"use client";

/* eslint-disable @next/next/no-img-element */

import type {
  ChangeEvent,
  ReactNode,
} from "react";
import {
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
  riskConfig: RiskConfig;
  onCertificationApprove?: (
    contractId: string,
    certificationId: string,
    approvedStatus: string,
  ) => void;
  onClose: () => void;
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

export function RiskDashboardModal({
  applicantPhone,
  contract,
  dashboardData,
  upcomingTimeline,
  certificationCards,
  riskConfig,
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
      getInitialGradeFromValues(contract, dashboardData),
    );
  const [
    currentHeaderStatus,
    setCurrentHeaderStatus,
  ] = useState(
    dashboardData?.headerStatus ??
      "\uC8FC\uC758 (\uBBF8\uC2B9\uC778)",
  );
  const [
    currentStatusDetail,
    setCurrentStatusDetail,
  ] = useState(
    contract?.nextCheck ??
      "\uC548\uBD80 \uC778\uC99D \uAC80\uD1A0\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.",
  );
  const [currentCategory, setCurrentCategory] =
    useState(
      "\uC548\uBD80 \uC778\uC99D \uBBF8\uC81C\uCD9C",
    );
  const [
    localCertificationCards,
    setLocalCertificationCards,
  ] = useState<RiskCertificationCard[]>(
    certificationCards,
  );
  const [
    selectedCertificationId,
    setSelectedCertificationId,
  ] = useState<string | null>(null);

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
  const normalizedPhone =
    applicantPhone.replace(/[^\d+]/g, "");
  const phoneHref = normalizedPhone
    ? `tel:${normalizedPhone}`
    : undefined;

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
        className="max-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-300 bg-slate-50 shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="flex min-h-16 items-center justify-between gap-4 bg-slate-700 px-6 py-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h2
              id="risk-dashboard-title"
              className="truncate text-lg font-extrabold text-white"
            >
              {contract.petName} (
              {contract.adopterName}) - CLM
              사후관리 대시보드
            </h2>

            <span
              className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border",
                "px-3 py-1 text-xs font-bold",
                currentGradeStyle.badgeClass,
              ].join(" ")}
            >
              <span
                className={[
                  "h-2.5 w-2.5 rounded-full",
                  currentGradeStyle.dotClass,
                ].join(" ")}
              />
              {currentHeaderStatus}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="모달 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-bold text-white transition hover:bg-white/10"
          >
            x
          </button>
        </header>

        <div className="relative p-6 lg:p-8">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() =>
                setIsStatusModalOpen(true)
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-400 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              상태 수동 변경
            </button>
          </div>

          <div className="grid gap-7 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside>
              <section className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
                <h3 className="border-b-2 border-slate-200 pb-3 text-sm font-extrabold text-blue-600">
                  입양계약 체결 정보
                </h3>

                <dl className="mt-4 space-y-4">
                  <ContractInfoRow
                    label="계약 ID"
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
                    label="특이 성향"
                    value={
                      <span className="font-bold text-orange-600">
                        {
                          dashboardData.behaviorTrait
                        }
                      </span>
                    }
                  />
                  <ContractInfoRow
                    label="현재 등급"
                    value={
                      <span
                        className={`font-bold ${currentGradeStyle.textClass}`}
                      >
                        {
                          currentGradeStyle.shortLabel
                        }
                      </span>
                    }
                  />
                </dl>

                <button
                  type="button"
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-slate-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  계약서 원본 열람하기
                </button>
              </section>

              <section className="mt-5 px-2">
                <h3 className="text-xs font-bold text-slate-600">
                  관리자 검토 가이드
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  제출된 인증 카드를 클릭하면
                  상세 검토가 가능합니다. 이상
                  징후가 있으면 상태 수동 변경을
                  통해 관리 등급과 사유를 기록합니다.
                </p>

                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className="mt-3 inline-flex text-xs font-semibold text-blue-600 hover:underline"
                  >
                    입양자 연락처{" "}
                    {applicantPhone}
                  </a>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">
                    등록된 연락처가 없습니다.
                  </p>
                )}
              </section>
            </aside>

            <main className="min-w-0">
              <section className="rounded-xl border-2 border-blue-500 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-blue-600">
                      {
                        upcomingTimeline.label
                      }
                    </p>
                    <h3 className="mt-1 text-base font-extrabold text-slate-950">
                      {
                        upcomingTimeline.title
                      }
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {
                        upcomingTimeline.description
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-600"
                  >
                    {
                      upcomingTimeline.buttonLabel
                    }
                  </button>
                </div>
              </section>

              <div className="mt-7 flex flex-wrap items-center gap-2 border-b border-slate-300 pb-3">
                <h3 className="text-sm font-extrabold text-slate-600">
                  제출된 안부 인증 카드
                </h3>
                <span className="text-xs text-slate-500">
                  (클릭하여 승인 검토)
                </span>
              </div>

              <div className="mt-4 space-y-4">
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
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                    <p className="text-sm text-slate-500">
                      제출된 안부 인증 카드가
                      없습니다.
                    </p>
                  </div>
                )}
              </div>

              <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-500">
                    최근 관리자 상태 메모
                  </h3>
                  <span
                    className={`text-xs font-bold ${currentGradeStyle.textClass}`}
                  >
                    {currentCategory}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
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
      container:
        "border-l-4 border-l-orange-500 border-y-slate-200 border-r-slate-200",
      badge:
        "border-orange-100 bg-orange-50 text-orange-600",
      dot: "bg-orange-400",
    },
    approved: {
      container:
        "border-l-4 border-l-emerald-400 border-y-slate-200 border-r-slate-200",
      badge:
        "border-emerald-100 bg-emerald-50 text-emerald-600",
      dot: "bg-emerald-400",
    },
  }[card.tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-lg border bg-white p-5 text-left shadow-sm",
        "transition hover:border-blue-400 hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        style.container,
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="text-base font-extrabold text-slate-950">
            {card.title}
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {card.description}
          </p>
        </div>
        <span
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-md border",
            "px-3 py-1.5 text-xs font-bold",
            style.badge,
          ].join(" ")}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
          />
          {card.status}
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
        className="max-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="flex items-start justify-between gap-5 border-b border-slate-200 px-7 py-6">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-blue-500">
              Admin Audit &amp; Approval
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2
                id="certification-review-title"
                className="text-2xl font-black tracking-tight text-slate-950"
              >
                {contract.petName} (
                {contract.adopterName}) -{" "}
                {card.title}
              </h2>
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2",
                  "text-sm font-bold text-white",
                  isAllNormal ||
                  card.tone === "approved"
                    ? "bg-emerald-500"
                    : "bg-orange-500",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-3 w-3 rounded-full",
                    isAllNormal ||
                    card.tone === "approved"
                      ? "bg-emerald-200"
                      : "bg-orange-300",
                  ].join(" ")}
                />
                {isAllNormal
                  ? "정상 등급"
                  : card.tone ===
                      "approved"
                    ? "승인 완료"
                    : "주의 등급"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="인증 검토 모달 닫기"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-3xl font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            x
          </button>
        </header>

        <div className="grid gap-8 px-7 py-7 lg:grid-cols-[360px_minmax(0,1fr)]">
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
              className="group relative h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left shadow-sm"
              aria-label="인증 사진 선택 및 변경"
            >
              {imageDataUrl ? (
                <img
                  src={imageDataUrl}
                  alt={`${contract.petName} 인증 사진`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 px-8 text-center">
                  <p className="text-lg font-bold leading-8 text-slate-700">
                    첨부된 사진이 없습니다.
                    <br />
                    클릭하여 사진을
                    선택하세요.
                  </p>
                </div>
              )}
              <div className="absolute inset-0 flex items-end justify-center bg-black/0 p-5 transition group-hover:bg-black/25">
                <span className="translate-y-3 rounded-lg bg-black/75 px-4 py-2 text-sm font-bold text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  사진 선택 및 변경
                </span>
              </div>
            </button>

            <p className="mt-5 text-center text-sm leading-6 text-slate-500">
              제출 일시: {submittedAt}
              <br />
              회차: {roundLabel}
            </p>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-blue-300 bg-blue-50 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              사진 다시 선택하기
            </button>
          </aside>

          <main className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-bold text-slate-600">
                {isAllNormal
                  ? "모든 문항에서 위험 신호가 확인되지 않았습니다."
                  : "가장 높은 위험 문항 기준으로 최종 등급이 산정되었습니다."}
              </p>

              <dl className="mt-5 divide-y divide-dashed divide-slate-200">
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
              </dl>
            </section>

            {isAllNormal ? (
              <NormalQuickApprovalGuide />
            ) : (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-extrabold text-slate-950">
                    수행할 조치 선택
                  </h3>
                  <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-slate-600">
                    다중선택 가능
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {actionOptions.map(
                    (action) => (
                      <label
                        key={action}
                        className="flex cursor-pointer items-start gap-3"
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
                          className="mt-0.5 h-5 w-5 rounded border-slate-300 accent-blue-600"
                        />
                        <span className="text-sm font-semibold leading-6 text-slate-800">
                          {action}
                        </span>
                      </label>
                    ),
                  )}
                </div>

                <label
                  htmlFor="manager-comment"
                  className="mt-5 block text-sm font-extrabold text-slate-950"
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
                  rows={4}
                  placeholder="특이사항이 있는 경우 자유롭게 적어주세요."
                  className="mt-3 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </section>
            )}
          </main>
        </div>

        <footer className="sticky bottom-0 flex items-center gap-5 border-t border-slate-200 bg-white px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-14 shrink-0 rounded-xl bg-slate-200 px-8 text-base font-bold text-slate-800 transition hover:bg-slate-300"
          >
            닫기 (보류)
          </button>
          <button
            type="button"
            onClick={
              handleApprove
            }
            className={[
              "flex h-14 flex-1 items-center justify-center rounded-xl",
              "px-6 text-lg font-extrabold text-white shadow-md transition",
              isAllNormal
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-blue-600 hover:bg-blue-700",
            ].join(" ")}
          >
            {isAllNormal
              ? "정상 안부 1-Click 빠른 승인 처리"
              : "조치 완료 및 최종 승인 처리"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function NormalQuickApprovalGuide() {
  return (
    <section className="rounded-2xl border border-emerald-300 bg-emerald-50 px-6 py-5">
      <h3 className="text-lg font-extrabold text-emerald-800">
        [정상 등급] 빠른 승인 가이드
      </h3>
      <p className="mt-3 text-base leading-7 text-emerald-800">
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
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/65 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-status-title"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900 text-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="flex items-center justify-between border-b border-dashed border-neutral-700 px-7 py-5">
          <h2
            id="manual-status-title"
            className="text-xl font-bold"
          >
            관리자 상태 수동 변경
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="상태 변경 모달 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-3xl font-bold text-white transition hover:bg-white/10"
          >
            x
          </button>
        </header>

        <div className="space-y-6 px-7 py-6">
          <section>
            <p className="text-sm font-medium text-neutral-400">
              현재 상태
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-lg font-semibold">
              <span className="text-neutral-500">
                [
              </span>
              <span
                className={`h-4 w-4 rounded-full ${currentStyle.dotClass}`}
              />
              <span
                className={
                  currentStyle.textClass
                }
              >
                {currentHeaderStatus}
              </span>
              <span className="text-neutral-500">
                ]
              </span>
              <span className="text-neutral-600">
                /
              </span>
              <span className="text-neutral-300">
                {currentStatusDetail}
              </span>
            </div>
          </section>

          <SelectField
            id="manual-grade"
            label="변경할 위험 등급 선택"
            value={selectedGrade}
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
              className="mb-2 block text-sm font-medium text-neutral-400"
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
              className="w-full resize-y rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-3 text-base leading-7 text-white outline-none transition placeholder:text-neutral-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-dashed border-neutral-700 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-lg border border-neutral-600 bg-neutral-900 px-6 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="h-12 rounded-lg bg-red-500 px-7 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-400"
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
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-neutral-400"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-14 w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 text-base font-semibold text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
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
    </div>
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
        "grid gap-3 px-3 py-3",
        "sm:grid-cols-[minmax(210px,1fr)_minmax(250px,1fr)]",
        highlighted
          ? "bg-orange-50"
          : "bg-white",
      ].join(" ")}
    >
      <dt
        className={[
          "text-sm font-semibold leading-6",
          highlighted
            ? "text-orange-600"
            : "text-slate-500",
        ].join(" ")}
      >
        {question}
      </dt>
      <dd
        className={[
          "flex items-start justify-end gap-2",
          "text-right text-sm font-bold leading-6",
          toneStyle.text,
        ].join(" ")}
      >
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${toneStyle.dot}`}
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
