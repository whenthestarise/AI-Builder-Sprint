"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

import type {
  AdoptionApplication,
  Contract,
  Pet,
} from "@/mvc/models/adminModel";
import { AdminShell } from "@/mvc/views/AdminShell";

type ModusignDocument = {
  id: string;
  status: string;
};

const MODUSIGN_TEST_PHONE = "010-2422-4599";

/* ==============================
 * 계약 화면 확장 데이터
 * ============================== */

type ContractViewModel = Contract & {
  baseClauses?: string[];
  specialClause?: string;
  fullTerms?: string;
  aiGuide?: string;
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
  const [isSignatureSentModalOpen, setIsSignatureSentModalOpen] =
    useState(false);
  const [isSendingSignature, setIsSendingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState("");
  const [modusignDocument, setModusignDocument] =
    useState<ModusignDocument | null>(null);

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
    `동물의 ${primaryTrait} 특성과 신청자의 ${applicant.home} 환경을 조합하여 분양 안정성과 책임감을 높이는 맞춤형 특약을 생성했습니다.`;

  const fullTerms =
    contract.fullTerms ??
    [...baseClauses, specialClause].filter(Boolean).join("\n\n");

  async function sendSignatureRequest() {
    setIsSendingSignature(true);
    setSignatureError("");

    try {
      const inputMappings = buildModusignInputMappings({
        contract,
        pet,
        applicant,
        baseClauses,
        specialClause,
        fullTerms,
        dataLabels,
      });
      const response = await fetch("/api/modusign/request-signature", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `책임 입양 계약서_${pet.name}_${applicant.applicant}`,
          participants: [
            {
              role: "",
              name: applicant.applicant,
              signingMethod: {
                type: "KAKAO",
                value: getSignaturePhone(applicant).replace(/\D/g, ""),
              },
              locale: "ko",
            },
          ],
          inputMappings,
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        document?: ModusignDocument;
      };

      if (!response.ok || !result.document?.id) {
        throw new Error(result.message || "모두싸인 발송에 실패했습니다.");
      }

      setModusignDocument(result.document);
      setIsSignatureModalOpen(false);
      setIsSignatureSentModalOpen(true);
    } catch (error) {
      setSignatureError(
        error instanceof Error
          ? error.message
          : "모두싸인 발송에 실패했습니다.",
      );
    } finally {
      setIsSendingSignature(false);
    }
  }

  return (
    <AdminShell>
      {/* ==============================
       * 페이지 상단 헤더
       * ============================== */}
      <header className="border-b border-slate-200 bg-white">
        <div
          className={[
            "mx-auto flex min-h-[76px] w-full max-w-[1240px]",
            "items-center justify-between gap-5 px-5 py-3",
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
                대시보드
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
      <section className="min-h-[calc(100vh-76px)] bg-[#f3f6fa]">
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
                        위 기본 약관 및 AI 맞춤 특약을 확인했으며 모두싸인으로
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
                          aria-label={`${dataLabels.length}개의 계약 데이터를 사용하여 전자서명 진행`}
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
          isSending={isSendingSignature}
          error={signatureError}
          onSend={sendSignatureRequest}
          onClose={() =>
            setIsSignatureModalOpen(false)
          }
        />
      )}

      {isSignatureSentModalOpen && modusignDocument && (
        <SignatureSentModal
          pet={pet}
          applicant={applicant}
          document={modusignDocument}
          onClose={() => setIsSignatureSentModalOpen(false)}
        />
      )}
    </AdminShell>
  );
}

function buildModusignInputMappings({
  contract,
  pet,
  applicant,
  baseClauses,
  specialClause,
  fullTerms,
  dataLabels,
}: {
  contract: ContractViewModel;
  pet: Pet;
  applicant: AdoptionApplication;
  baseClauses: string[];
  specialClause: string;
  fullTerms: string;
  dataLabels: DataLabel[];
}) {
  const mockOriginalOwner = {
    name: "Pawmise",
    representative: "Pawmise 입양관리팀",
    phone: "010-0000-0000",
    emergencyPhone: "010-0000-0001",
    email: "contract@pawmise.example",
    address: "부산광역시 금정구 센텀대로 123",
    registrationNumber: "000-00-00000",
  };
  const mappings = new Map<string, string>();
  const add = (labels: string[], value?: string) => {
    const normalizedValue = value?.trim();
    if (!normalizedValue) return;
    labels.forEach((label) => mappings.set(label, normalizedValue));
  };

  dataLabels.forEach(({ label, value }) => add([label], value));
  add(["contractId", "계약번호", "문서번호"], contract.id);
  add(["contractDate", "계약일", "계약체결일"], new Date().toISOString().slice(0, 10));
  add(["petId", "동물ID", "동물번호"], pet.id);
  add(["petName", "동물이름", "입양동물", "반려동물명"], pet.name);
  add(["petAge", "나이", "동물나이"], pet.age);
  add(["petBreed", "품종", "견종"], pet.breed);
  add(["petWeight", "체중"], pet.weight);
  add(["petGender", "성별"], (pet as Pet & { gender?: string }).gender);
  add(["petTraits", "동물특성", "특이사항"], pet.traits.join(", "));
  add(["rescueDate", "구조일"], pet.rescueDate);
  add(["rescueLocation", "구조장소"], pet.rescueLocation);
  add(["shelterName", "보호소", "보호소명"], pet.shelterName);
  add(
    [
      "rescuerName",
      "rescuerOrOriginalOwnerName",
      "구조자명",
      "구조자 성명",
      "원보호자명",
      "원보호자 성명",
      "구조자 원보호자",
      "구조자 원보호자 성명",
    ],
    mockOriginalOwner.name,
  );
  add(
    [
      "rescuerAddress",
      "originalOwnerAddress",
      "구조자 주소",
      "원보호자 주소",
      "구조자 원보호자 주소",
    ],
    mockOriginalOwner.address,
  );
  add(
    [
      "rescueDate",
      "rescuerAcquisitionDate",
      "구조일",
      "구조 날짜",
      "보호 시작일",
    ],
    pet.rescueDate,
  );
  add(
    [
      "rescuerOrganization",
      "originalShelter",
      "구조기관",
      "원보호기관",
      "보호기관명",
    ],
    mockOriginalOwner.name,
  );
  add(
    [
      "rescuerRepresentative",
      "originalOwnerRepresentative",
      "구조자 대표자",
      "원보호자 대표자",
      "구조자 원보호자 대표자",
    ],
    mockOriginalOwner.representative,
  );
  add(
    [
      "rescuerPhone",
      "originalOwnerPhone",
      "구조자 연락처",
      "원보호자 연락처",
      "구조자 원보호자 연락처",
      "보호소 연락처",
    ],
    mockOriginalOwner.phone,
  );
  add(
    [
      "rescuerEmergencyPhone",
      "originalOwnerEmergencyPhone",
      "구조자 비상연락처",
      "원보호자 비상연락처",
      "구조자 원보호자 비상연락처",
    ],
    mockOriginalOwner.emergencyPhone,
  );
  add(
    [
      "rescuerEmail",
      "originalOwnerEmail",
      "구조자 이메일",
      "원보호자 이메일",
      "구조자 원보호자 이메일",
      "보호소 이메일",
    ],
    mockOriginalOwner.email,
  );
  add(
    [
      "rescuerRegistrationNumber",
      "originalOwnerRegistrationNumber",
      "구조자 등록번호",
      "원보호자 등록번호",
      "구조자 원보호자 등록번호",
      "사업자등록번호",
    ],
    mockOriginalOwner.registrationNumber,
  );
  add(
    ["adopterName", "입양자", "입양자명", "입양자 성명", "신청자명", "이름"],
    applicant.applicant,
  );
  add(["phone", "연락처", "전화번호", "입양자연락처"], getSignaturePhone(applicant));
  add(["二쇰??깅줉踰덊샇"], "000000-0000000");
  add(["비상연락처"], mockOriginalOwner.emergencyPhone);
  add(["입양비 문자"], "기부금 예정");
  add(["입양비 숫자"], "0");
  add(["email", "이메일", "SNS / 이메일", "입양자이메일"], applicant.email);
  add(["housingType", "주거형태", "주거환경", "주소"], applicant.home);
  add(["petExperience", "양육경험", "반려동물경험"], applicant.experience);
  add(["awayHours", "부재시간", "외출시간"], applicant.awayHours);
  add(["baseClauses", "기본약관"], baseClauses.join("\n"));
  add(
    ["specialClause", "맞춤특약", "AI특약", "추가조항", "추가계약내용"],
    specialClause,
  );
  add(["fullTerms", "전체약관", "계약내용"], fullTerms);
  add(["aiGuide", "AI조율가이드"], contract.aiGuide);

  return Array.from(mappings, ([dataLabel, value]) => ({
    dataLabel,
    value,
  }));
}

/* ==============================
 * ?뺣낫 洹몃９
 * ============================== */

function ContractSignatureModal({
  contract,
  pet,
  applicant,
  baseClauses,
  specialClause,
  isSending,
  error,
  onSend,
  onClose,
}: {
  contract: ContractViewModel;
  pet: Pet;
  applicant: AdoptionApplication;
  baseClauses: string[];
  specialClause: string;
  isSending: boolean;
  error: string;
  onSend: () => void;
  onClose: () => void;
}) {
  const [showFullTerms, setShowFullTerms] =
    useState(false);
  const standardClauses =
    baseClauses.length > 0
      ? baseClauses.slice(0, 3)
      : [
          "임의 양도·유기 금지 및 보호소 반환 의무",
          "정기 사후관리 모니터링 협조 의무",
          "동물등록 필수 및 적정 사육 환경 보장",
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

        <button
          type="button"
          onClick={onSend}
          disabled={isSending}
          className="mt-5 flex h-14 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-lg font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:bg-blue-300"
        >
          {isSending
            ? "모두싸인 문서 생성 중..."
            : "약관에 동의하며 모두싸인으로 전자서명 발송하기"}
        </button>
        {error && (
          <p className="mt-3 text-center text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function SignatureSentModal({
  pet,
  applicant,
  document,
  onClose,
}: {
  pet: Pet;
  applicant: AdoptionApplication;
  document: ModusignDocument;
  onClose: () => void;
}) {
  const documentId = document.id;
  const [isCompleted, setIsCompleted] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "입양자 서명 입력 중",
  );
  const [completionError, setCompletionError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function checkSignatureStatus() {
    setIsChecking(true);
    setCompletionError("");

    try {
      const response = await fetch(
        `/api/modusign/documents/${encodeURIComponent(document.id)}`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as {
        message?: string;
        document?: ModusignDocument;
      };

      if (!response.ok || !result.document) {
        throw new Error(result.message || "서명 상태를 확인하지 못했습니다.");
      }

      if (result.document.status === "COMPLETED") {
        setStatusMessage("계약 완료 처리 중");
        await finalizeSignedContract({
          contractId: document.id,
          pet,
          applicant,
        });
        setStatusMessage("서명 완료");
        setIsCompleted(true);
        return;
      }

      if (
        result.document.status === "ABORTED" ||
        result.document.status === "PROCESSING_FAILED"
      ) {
        throw new Error("모두싸인 문서가 중단되었거나 처리에 실패했습니다.");
      }

      setStatusMessage(
        result.document.status === "ON_PROCESSING"
          ? "문서 발송 준비 중"
          : "입양자 서명 입력 중",
      );
      setCompletionError("아직 모두싸인 서명이 완료되지 않았습니다.");
    } catch (error) {
      setCompletionError(
        error instanceof Error
          ? error.message
          : "서명 상태 확인에 실패했습니다.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  if (isCompleted) {
    return (
      <ContractCompletedModal
        applicant={applicant}
        pet={pet}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signature-sent-modal-title"
    >
      <section className="w-full max-w-[604px] rounded-[22px] bg-white px-7 py-10 shadow-2xl sm:px-9">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fee500] text-slate-700">
          <KakaoTalkIcon />
        </div>

        <h2
          id="signature-sent-modal-title"
          className="mt-4 text-center text-2xl font-extrabold tracking-tight text-slate-950"
        >
          모두싸인 알림톡 발송 완료!
        </h2>

        <p className="mt-3 text-center text-sm font-medium leading-6 text-slate-500">
          {applicant.applicant} 님의 카카오톡으로 전자서명 링크가 전송되었습니다.
          <br />
          서명 후 아래 완료 버튼을 눌러주세요.
        </p>

        <dl className="mt-7 space-y-5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-6 text-sm sm:px-6">
          <SentInfoRow
            label="수신"
            value={`${applicant.applicant} (${getSignaturePhone(applicant)})`}
          />
          <SentInfoRow
            label="문서"
            value={`책임 입양 계약서 #${documentId}`}
          />
          <SentInfoRow
            label="상태"
            value={
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                {statusMessage}
              </span>
            }
          />
        </dl>

        {completionError && (
          <p className="mt-5 text-center text-xs font-semibold text-red-600">
            {completionError}
          </p>
        )}
        <button
          type="button"
          onClick={checkSignatureStatus}
          disabled={isChecking}
          className="mt-6 flex h-14 w-full items-center justify-center rounded-lg bg-blue-600 text-lg font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:bg-blue-300"
        >
          {isChecking ? "서명 상태 확인 중..." : "서명 완료"}
        </button>
      </section>
    </div>
  );
}

async function finalizeSignedContract({
  contractId,
  pet,
  applicant,
}: {
  contractId: string;
  pet: Pet;
  applicant: AdoptionApplication;
}) {
  const response = await fetch("/api/contracts/sign-complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contractId,
      petId: pet.id,
      petName: pet.name,
      adopterName: applicant.applicant,
      applicantPhone: getSignaturePhone(applicant),
      signedAt: new Date().toISOString(),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(result?.detail || "계약 완료 처리에 실패했습니다.");
  }
}

function getSignaturePhone(applicant: AdoptionApplication) {
  if (applicant.applicant === "김민수") {
    return MODUSIGN_TEST_PHONE;
  }

  return applicant.phone || MODUSIGN_TEST_PHONE;
}

function ContractCompletedModal({
  applicant,
  pet,
  onClose,
}: {
  applicant: AdoptionApplication;
  pet: Pet;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-completed-modal-title"
    >
      <section className="w-full max-w-[604px] rounded-[22px] bg-white px-7 py-10 shadow-2xl sm:px-9">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
          완료
        </div>
        <h2
          id="contract-completed-modal-title"
          className="mt-5 text-center text-2xl font-extrabold text-slate-950"
        >
          책임 입양 계약 체결!
        </h2>
        <p className="mt-3 text-center text-sm font-medium text-slate-500">
          {applicant.applicant} 님과 {pet.name}의 입양 계약이 법적 효력을 갖췄습니다.
        </p>

        <div className="mt-7 space-y-5 rounded-xl border border-slate-200 bg-slate-50 px-6 py-6 text-sm font-bold text-slate-900">
          <CompletionItem icon={<ArchiveIcon />}>
            아카이빙 : 모두싸인 클라우드 보관 완료
          </CompletionItem>
          <CompletionItem icon={<CalendarIcon />}>
            CLM 설정 : 주기별 알림 스케줄러 등록
          </CompletionItem>
          <CompletionItem icon={<AgentIcon />}>
            AI 에이전트 : 모니터링 리스트 대시보드 연동
          </CompletionItem>
        </div>

        <div className="mt-7 grid grid-cols-[1fr_1.85fr] gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-14 rounded-lg border border-slate-200 bg-white text-lg font-extrabold text-slate-900 transition hover:bg-slate-50"
          >
            완료
          </button>
          <Link
            href="/risk"
            className="flex h-14 items-center justify-center rounded-lg bg-blue-600 text-lg font-extrabold text-white transition hover:bg-blue-700"
          >
            입양관리로 이동
          </Link>
        </div>
      </section>
    </div>
  );
}

function CompletionItem({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-blue-600">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function SentInfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <dt className="shrink-0 font-medium text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right font-bold text-slate-900">{value}</dd>
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
  ][index] ?? "입양 계약의 필수 의무를 성실히 이행합니다.";
}

function InfoGroup({ children }: { children: ReactNode }) {
  return (
    <dl className="overflow-hidden rounded-xl border border-slate-200 bg-[#f3f8fd]">
      {children}
    </dl>
  );
}

/* ==============================
 * ?뺣낫 ??
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

function KakaoTalkIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 6C9.37 6 4 10.2 4 15.38c0 3.34 2.25 6.28 5.63 7.94l-1.18 4.3c-.1.39.34.7.68.47l5.05-3.35c.6.08 1.2.12 1.82.12 6.63 0 12-4.2 12-9.38S22.63 6 16 6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArchiveIcon() {
  return <LineIcon path="M5 8h14v12H5z M4 4h16v4H4z M10 12h4" />;
}

function CalendarIcon() {
  return <LineIcon path="M5 5h14v15H5z M8 3v4 M16 3v4 M5 10h14" />;
}

function AgentIcon() {
  return <LineIcon path="M6 8h12v10H6z M9 12h.01 M15 12h.01 M9 16h6 M12 4v4" />;
}

function LineIcon({ path }: { path: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
