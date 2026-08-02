"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

import type {
  AdoptionApplication,
  Contract,
  Pet,
} from "@/mvc/models/adminModel";
import { AdminShell } from "@/mvc/views/AdminShell";

/* ==============================
 * 계약 화면 확장 데이터
 *
 * 기존 Contract 타입은 유지하고,
 * 계약 화면에서 사용할 값을 선택 필드로 확장합니다.
 * ============================== */

type ContractViewModel = Contract & {
  baseClauses?: string[];
  specialClause?: string;
  fullTerms?: string;
  aiGuide?: string;
  signaturePath?: string;
};

type DataLabel = {
  label: string;
  value: string;
};

type ContractsAdminViewProps = {
  contract: ContractViewModel;
  pet: Pet;
  applicant: AdoptionApplication;
  dataLabels: DataLabel[];
};

/* ==============================
 * 계약서 검토 화면
 * ============================== */

export function ContractsAdminView({
  contract,
  pet,
  applicant,
  dataLabels,
}: ContractsAdminViewProps) {
  const [isConfirmed, setIsConfirmed] = useState(true);
  const [isSignatureModalOpen, setIsSignatureModalOpen] =
    useState(false);

  const primaryTrait = pet.traits[0] ?? "행동 특성 확인 필요";

  const baseClauses = contract.baseClauses ?? [];

  const mappedSpecialClause = dataLabels.find(({ label }) =>
    ["맞춤 특약", "AI 특약", "추가 조항"].some((keyword) =>
      label.includes(keyword),
    ),
  )?.value;

  const specialClause =
    contract.specialClause ??
    mappedSpecialClause ??
    "생성된 AI 맞춤 특약이 없습니다.";

  const aiGuide =
    contract.aiGuide ??
    `동물의 ${primaryTrait} 특성과 신청자의 ${applicant.home} 환경을 조합하여 분쟁을 예방하고 책임감을 높이는 맞춤형 특약이 생성되었습니다.`;

  const fullTerms =
    contract.fullTerms ??
    [...baseClauses, specialClause].filter(Boolean).join("\n\n");

  const signatureHref =
    contract.signaturePath ??
    `/modusign?contractId=${encodeURIComponent(
      String(contract.id),
    )}&petId=${encodeURIComponent(
      String(pet.id),
    )}&applicationId=${encodeURIComponent(String(applicant.id))}`;

  return (
    <AdminShell>
      {/* ==============================
       * 페이지 상단 헤더
       * ============================== */}
      <header className="border-b border-slate-200 bg-white">
        <div
          className={[
            "mx-auto flex min-h-[84px] w-full max-w-[1240px]",
            "items-center justify-between gap-5 px-5 py-4",
            "sm:px-7 lg:px-8",
          ].join(" ")}
        >
          <div className="min-w-0">
            <nav
              aria-label="현재 위치"
              className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold"
            >
              <Link
                href="/main"
                className="text-slate-500 transition-colors hover:text-slate-900"
              >
                대시보드 홈
              </Link>

              <span className="text-slate-300">&gt;</span>

              <Link
                href={`/manage?petId=${encodeURIComponent(String(pet.id))}`}
                className="text-slate-500 transition-colors hover:text-slate-900"
              >
                동물 상세 및 신청자 검토
              </Link>

              <span className="text-slate-300">&gt;</span>

              <span className="text-blue-600">계약서 검토</span>
            </nav>

            <h1 className="mt-2 text-lg font-extrabold tracking-tight text-slate-950">
              {pet.name} 상세 정보
            </h1>
          </div>

          <Link
            href="/main"
            className={[
              "inline-flex h-9 shrink-0 items-center justify-center gap-1.5",
              "rounded-lg border border-slate-200 bg-white px-4",
              "text-[11px] font-semibold text-slate-600 shadow-sm",
              "transition-colors hover:bg-slate-50 hover:text-slate-900",
            ].join(" ")}
          >
            <ArrowLeftIcon />
            목록으로
          </Link>
        </div>
      </header>

      {/* ==============================
       * 본문
       * ============================== */}
      <section className="min-h-[calc(100vh-84px)] bg-[#f3f6fa]">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-6 sm:px-7 lg:px-8">
          <section
            className={[
              "min-h-[690px] rounded-xl border border-slate-200",
              "bg-white px-5 py-6 shadow-sm",
              "sm:px-7 lg:px-9 lg:py-8",
            ].join(" ")}
          >
            <div className="grid gap-7 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-8">
              {/* ==============================
               * 왼쪽: 체결 대상 정보
               * ============================== */}
              <aside>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
                  체결 대상 정보
                </h2>

                <div className="mt-5 space-y-4">
                  {/* 입양 동물 정보 */}
                  <InfoGroup>
                    <InfoRow
                      label="입양 동물"
                      value={`${pet.name} (${pet.age}, ${pet.breed})`}
                    />

                    <InfoRow
                      label="동물 특성"
                      value={
                        <span className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600">
                          {primaryTrait}
                        </span>
                      }
                    />
                  </InfoGroup>

                  {/* 신청자 정보 */}
                  <InfoGroup>
                    <InfoRow
                      label="입양 신청자"
                      value={applicant.applicant}
                    />

                    <InfoRow
                      label="주거 특성"
                      value={applicant.home}
                    />
                  </InfoGroup>

                  {/* AI 조율 가이드 */}
                  <section className="rounded-xl border border-slate-200 bg-[#f3f8fd] p-4">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-blue-600">
                      <SparkleIcon />
                      Upstage AI 조율 가이드
                    </h3>

                    <p className="mt-3 text-xs font-medium leading-6 text-slate-600">
                      {aiGuide}
                    </p>
                  </section>
                </div>
              </aside>

              {/* ==============================
               * 오른쪽: 계약서 조항
               * ============================== */}
              <section className="min-w-0">
                <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
                  입양 계약서 검토 및 특약 설정
                </h2>

                <div className="mt-5 space-y-4">
                  {/* 기본 약관 */}
                  <section className="rounded-xl border border-slate-200 bg-[#f3f8fd] p-5">
                    <h3 className="text-sm font-extrabold text-slate-950">
                      기본 약관 요약
                    </h3>

                    {baseClauses.length > 0 ? (
                      <ul className="mt-4 space-y-3">
                        {baseClauses.map((clause, index) => (
                          <li
                            key={`${clause}-${index}`}
                            className="flex items-start gap-3 text-sm leading-6 text-slate-700"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                              <CheckIcon />
                            </span>

                            <span>{clause}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">
                        등록된 기본 약관 요약이 없습니다.
                      </p>
                    )}

                    <details className="group mt-5">
                      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        원문 약관 전체보기
                        <ChevronDownIcon />
                      </summary>

                      <div className="mt-3 whitespace-pre-line rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs leading-6 text-slate-600">
                        {fullTerms || "등록된 원문 약관이 없습니다."}
                      </div>
                    </details>
                  </section>

                  {/* AI 맞춤 특약 */}
                  <section className="rounded-xl border-2 border-blue-500 bg-blue-50/50 p-5">
                    <span className="inline-flex rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
                      {primaryTrait} 및 {applicant.home} 맞춤 추가 조항
                    </span>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white px-5 py-5">
                      <p className="text-sm font-medium leading-7 text-slate-900">
                        {specialClause}
                      </p>
                    </div>
                  </section>

                  {/* 확인 및 계약 진행 */}
                  <section className="rounded-xl border border-slate-200 bg-[#f3f8fd] p-5">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(event) =>
                          setIsConfirmed(event.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600"
                      />

                      <span className="text-sm font-semibold leading-6 text-slate-800">
                        위 기본 약관 및 AI 맞춤 특약을 확인했으며, 모두싸인으로
                        입양자에게 전자서명을 발송합니다.
                      </span>
                    </label>

                    <div className="mt-4">
                      {isConfirmed ? (
                        <button
                          type="button"
                          onClick={() =>
                            setIsSignatureModalOpen(true)
                          }
                          aria-label={`${dataLabels.length}개의 계약 데이터 라벨을 사용하여 전자서명 진행`}
                          className={[
                            "flex h-12 w-full items-center justify-center gap-2",
                            "rounded-lg bg-blue-600 px-6",
                            "text-base font-extrabold text-white shadow-sm",
                            "transition-colors hover:bg-blue-700",
                          ].join(" ")}
                        >
                          AI 맞춤 책임계약 체결하기
                          <ArrowRightIcon />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className={[
                            "flex h-12 w-full cursor-not-allowed",
                            "items-center justify-center gap-2 rounded-lg",
                            "bg-slate-300 px-6 text-base font-extrabold text-white",
                          ].join(" ")}
                        >
                          약관 확인이 필요합니다
                        </button>
                      )}
                    </div>
                  </section>
                </div>
              </section>
            </div>
          </section>
        </div>
      </section>

      {isSignatureModalOpen && (
        <ContractSignatureModal
          contract={contract}
          pet={pet}
          applicant={applicant}
          baseClauses={baseClauses}
          specialClause={specialClause}
          signatureHref={signatureHref}
          onClose={() =>
            setIsSignatureModalOpen(false)
          }
        />
      )}
    </AdminShell>
  );
}

/* ==============================
 * 정보 그룹
 * ============================== */

function ContractSignatureModal({
  contract,
  pet,
  applicant,
  baseClauses,
  specialClause,
  signatureHref,
  onClose,
}: {
  contract: ContractViewModel;
  pet: Pet;
  applicant: AdoptionApplication;
  baseClauses: string[];
  specialClause: string;
  signatureHref: string;
  onClose: () => void;
}) {
  const [showFullTerms, setShowFullTerms] =
    useState(false);
  const standardClauses =
    baseClauses.length > 0
      ? baseClauses.slice(0, 3)
      : [
          "유기·파양 절대 금지 및 원보호소 반환 의무",
          "정기 사후관리 모니터링 협조 의무",
          "동물등록 완수 및 적정 사육 환경 보장",
        ];
  const customClauses = splitSpecialClause(
    specialClause,
  );
  const documentId =
    contract.id.startsWith("DRAFT")
      ? `CLM-${new Date()
          .toISOString()
          .slice(0, 10)
          .replaceAll("-", "")}`
      : contract.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-signature-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100vh-4rem)] w-full max-w-[860px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex h-9 items-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-extrabold text-white">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-white"
            />
            모두싸인 CLM 전자계약 대기 중
          </span>
          <p className="text-sm font-semibold text-slate-500">
            문서번호 #{documentId}
          </p>
        </header>

        <section className="mt-5 grid gap-3 rounded-lg bg-slate-100 px-5 py-4 sm:grid-cols-2">
          <InfoPill
            label="입양 동물"
            value={`${pet.name} (#${pet.id})`}
          />
          <InfoPill
            label="입양자"
            value={applicant.applicant}
          />
        </section>

        <section className="mt-7">
          <h3
            id="contract-signature-modal-title"
            className="text-lg font-extrabold text-slate-950"
          >
            Upstage AI가 요약한 표준계약서 핵심 의무 3대장
          </h3>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {standardClauses.map((clause, index) => (
              <article
                key={`${clause}-${index}`}
                className="flex gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <CheckIcon />
                </span>
                <div className="min-w-0">
                  <h4 className="text-base font-extrabold text-slate-900">
                    {clause}
                  </h4>
                  <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
                    {getClauseDescription(index)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border-2 border-blue-500 bg-white p-5">
          <span className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-extrabold text-white">
            Solar LLM이 분석한 {pet.name} 맞춤형 계약 특약
          </span>

          <div className="mt-4 space-y-4 text-sm font-bold leading-6 text-slate-900">
            {customClauses.map((clause, index) => (
              <p key={`${clause}-${index}`}>
                {index + 1}. {clause}
              </p>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={() =>
            setShowFullTerms(
              (current) => !current,
            )
          }
          className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-blue-600"
        >
          <DocumentIcon />
          한국동물보호협회 표준 입양계약서 원본 전체보기
          <ChevronDownIcon />
        </button>

        {showFullTerms && (
          <div className="mt-3 max-h-40 overflow-y-auto whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600">
            {contract.fullTerms ||
              [...standardClauses, specialClause].join(
                "\n\n",
              )}
          </div>
        )}

        <p className="mt-3 text-sm font-semibold text-red-500">
          △ 위 조건 위반 시 동물에 대한 소유권이 보호소로 귀속됨을 인정합니다.
        </p>

        <Link
          href={signatureHref}
          className="mt-5 flex h-14 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-lg font-extrabold text-white shadow-sm transition hover:bg-blue-700"
        >
          위 약관에 동의하며 모두싸인으로 전자서명 진행하기
        </Link>
      </div>
    </div>
  );
}

function InfoPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-base">
      <span className="shrink-0 font-bold text-slate-500">
        {label}
      </span>
      <strong className="min-w-0 truncate font-extrabold text-slate-950">
        {value}
      </strong>
    </div>
  );
}

function splitSpecialClause(value: string) {
  const clauses = value
    .split(/\n+|\d+\.\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

  return clauses.length > 0
    ? clauses.slice(0, 2)
    : ["입양 동물의 특성과 입양자의 환경을 반영한 맞춤 특약을 준수합니다."];
}

function getClauseDescription(index: number) {
  return [
    "키우지 못할 사정 발생 시 임의 양도·유기 금지, 보호소 반환 필수",
    "사전 조율된 주기에 따라 아이의 근황 및 환경 사진 제출 필수",
    "실내 안전 보호 의무 및 법정 동물등록 진행 필수",
  ][index] ?? "입양 계약상 필수 의무를 성실히 이행합니다.";
}

function InfoGroup({ children }: { children: ReactNode }) {
  return (
    <dl className="overflow-hidden rounded-xl border border-slate-200 bg-[#f3f8fd]">
      {children}
    </dl>
  );
}

/* ==============================
 * 정보 행
 * ============================== */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex min-h-[55px] items-center justify-between gap-4 border-b border-slate-200 px-5 py-3 last:border-b-0">
      <dt className="shrink-0 text-xs font-medium text-slate-500">
        {label}
      </dt>

      <dd className="min-w-0 text-right text-sm font-extrabold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

/* ==============================
 * 아이콘
 * ============================== */

function ArrowLeftIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h5" />
      <path d="M10 17h5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform group-open:rotate-180"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
      <path d="m18 14 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14Z" />
      <path d="m5 13 .7 2.3L8 16l-2.3.7L5 19l-.7-2.3L2 16l2.3-.7L5 13Z" />
    </svg>
  );
}
