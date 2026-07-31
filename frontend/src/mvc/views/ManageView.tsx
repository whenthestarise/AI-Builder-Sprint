"use client";

import {
  type ReactNode,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

import type {
  AdoptionApplication,
  Pet,
} from "@/mvc/models/adminModel";
import { AdminShell } from "@/mvc/views/AdminShell";

/* ==============================
 * 상세 화면에서 사용하는 확장 타입
 *
 * 기존 Pet, AdoptionApplication 구조는 유지하고
 * 상세 화면에 필요한 필드만 선택적으로 확장합니다.
 * ============================== */

type DetailedPet = Pet & {
  sex?: string;
  neutered?: boolean;
  weightKg?: number | string;
  rescueDate?: string;
  rescueLocation?: string;
  shelterName?: string;
  intakeDate?: string;
};

type DetailedApplication = AdoptionApplication & {
  submittedAt?: string;
};

type ManageViewProps = {
  selectedPet: DetailedPet;
  applications: DetailedApplication[];
};

/* ==============================
 * 메인 View
 * ============================== */

export function ManageView({
  selectedPet,
  applications,
}: ManageViewProps) {
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    AdoptionApplication["id"] | null
  >(applications[0]?.id ?? null);

  const selectedApplication = useMemo(() => {
    return (
      applications.find(
        (application) =>
          String(application.id) === String(selectedApplicationId),
      ) ??
      applications[0] ??
      null
    );
  }, [applications, selectedApplicationId]);

  const petSummary = createPetSummary(selectedPet);

  return (
    <AdminShell>
      {/* ==============================
       * 페이지 헤더
       * ============================== */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[84px] w-full max-w-[1240px] items-center justify-between gap-5 px-5 py-4 sm:px-7 lg:px-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
              <Link
                href="/main"
                className="text-slate-500 transition-colors hover:text-slate-800"
              >
                대시보드 홈
              </Link>

              <span className="text-slate-300">&gt;</span>

              <span className="text-blue-600">
                동물 상세 및 신청자 검토
              </span>
            </div>

            <h1 className="mt-2 text-lg font-extrabold tracking-tight text-slate-950">
              {selectedPet.name} 상세 정보
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
      <main className="min-h-[calc(100vh-84px)] bg-[#f3f6fa]">
        <div
          className={[
            "mx-auto grid w-full max-w-[1240px] gap-5",
            "px-5 py-6 sm:px-7 lg:px-8",
            "xl:grid-cols-12",
          ].join(" ")}
        >
          {/* ==============================
           * 왼쪽: 동물 상세 정보
           * ============================== */}
          <article
            className={[
              "overflow-hidden rounded-xl border border-slate-200",
              "bg-white shadow-sm",
              "xl:col-span-5",
            ].join(" ")}
          >
            {/* 동물 이미지 */}
            <div className="relative h-[280px] overflow-hidden bg-slate-100 sm:h-[320px] xl:h-[280px]">
              <div
                role="img"
                aria-label={`${selectedPet.name} 보호 동물 사진`}
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url("${selectedPet.imageUrl}")`,
                }}
              />
            </div>

            <div className="p-5">
              {/* 기본 정보 */}
              <div>
                <h2 className="text-[26px] font-extrabold leading-none tracking-tight text-slate-950">
                  {selectedPet.name}
                </h2>

                <p className="mt-2 text-xs font-medium text-slate-600">
                  {petSummary}
                </p>
              </div>

              {/* AI 행동 태그 */}
              <section className="mt-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                  <SparklesIcon />
                  <span>AI 맞춤 특약 연동용 핵심 행동 태그</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPet.traits.length > 0 ? (
                    selectedPet.traits.map((trait, index) => (
                      <span
                        key={`${trait}-${index}`}
                        className={[
                          "rounded-md border px-2.5 py-1",
                          "text-[11px] font-semibold",
                          index === 0
                            ? "border-red-300 bg-red-50 text-red-600"
                            : "border-slate-200 bg-white text-slate-600",
                        ].join(" ")}
                      >
                        {trait}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      등록된 행동 특성이 없습니다.
                    </span>
                  )}
                </div>

                <p className="mt-4 border-t border-blue-100 pt-3 text-[11px] leading-5 text-slate-500">
                  위 특성 데이터를 Upstage Solar LLM이 인식하여 맞춤형 책임
                  약관을 작성합니다.
                </p>
              </section>

              {/* 구조 정보 */}
              <dl className="mt-5 space-y-4 border-t border-slate-200 pt-4 text-xs">
                <PetMetadataRow
                  label="구조 일시"
                  value={selectedPet.rescueDate ?? "정보 미등록"}
                />

                <PetMetadataRow
                  label="구조 장소"
                  value={selectedPet.rescueLocation ?? "정보 미등록"}
                />

                <PetMetadataRow
                  label="관할 센터"
                  value={selectedPet.shelterName ?? "정보 미등록"}
                />

                <PetMetadataRow
                  label="접수일"
                  value={selectedPet.intakeDate ?? "정보 미등록"}
                />
              </dl>
            </div>
          </article>

          {/* ==============================
           * 오른쪽: 입양 신청자 목록
           * ============================== */}
          <article
            className={[
              "flex flex-col overflow-hidden rounded-xl",
              "border border-slate-200 bg-white shadow-sm",
              "xl:col-span-7 xl:min-h-[635px]",
            ].join(" ")}
          >
            {/* 신청자 목록 헤더 */}
            <header className="flex items-start justify-between gap-5 border-b border-slate-200 px-5 py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DocumentIcon />

                  <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
                    접수된 입양 신청자 명단
                  </h2>
                </div>

                <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                  온라인 신청서를 작성한 희망자 목록입니다. 선택하여 계약을
                  진행하세요.
                </p>
              </div>

              <span
                className={[
                  "shrink-0 rounded-full border border-orange-300",
                  "bg-orange-50 px-3 py-1.5",
                  "text-[11px] font-bold text-orange-600",
                ].join(" ")}
              >
                {applications.length}건 대기
              </span>
            </header>

            {/* 신청자 카드 */}
            <div className="flex-1 space-y-3 p-5">
              {applications.length > 0 ? (
                applications.map((application, index) => {
                  const selected =
                    String(application.id) ===
                    String(selectedApplication?.id);

                  return (
                    <ApplicantCard
                      key={application.id}
                      application={application}
                      index={index}
                      selected={selected}
                      onSelect={() =>
                        setSelectedApplicationId(application.id)
                      }
                    />
                  );
                })
              ) : (
                <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-500">
                    접수된 입양 신청자가 없습니다.
                  </p>
                </div>
              )}
            </div>

            {/* 계약 버튼 */}
            <div className="px-5 pb-5">
              {selectedApplication ? (
                <Link
                  href={`/contracts?petId=${encodeURIComponent(
                    String(selectedPet.id),
                  )}&applicationId=${encodeURIComponent(
                    String(selectedApplication.id),
                  )}`}
                  className={[
                    "flex h-16 w-full items-center justify-center gap-2",
                    "rounded-xl bg-blue-600 px-5",
                    "text-base font-extrabold text-white shadow-sm",
                    "transition-colors hover:bg-blue-700",
                  ].join(" ")}
                >
                  AI 맞춤 책임계약 체결하기
                  <ArrowRightIcon />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className={[
                    "flex h-16 w-full cursor-not-allowed items-center justify-center",
                    "rounded-xl bg-slate-300 px-5",
                    "text-sm font-bold text-white",
                  ].join(" ")}
                >
                  계약을 진행할 신청자가 없습니다
                </button>
              )}
            </div>
          </article>
        </div>
      </main>
    </AdminShell>
  );
}

/* ==============================
 * 신청자 카드
 * ============================== */

function ApplicantCard({
  application,
  index,
  selected,
  onSelect,
}: {
  application: DetailedApplication;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={[
        "overflow-hidden rounded-xl border transition-colors",
        selected
          ? "border-2 border-blue-500 bg-blue-50/60"
          : "border-slate-200 bg-slate-50 hover:border-blue-200",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {/* 우선순위 번호 */}
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center",
                "rounded-full bg-blue-600 text-sm font-bold text-white",
              ].join(" ")}
            >
              {index + 1}
            </div>

            {/* 신청자 기본 정보 */}
            <div className="min-w-0">
              <h3 className="truncate text-lg font-extrabold text-slate-950">
                {application.applicant}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <PhoneIcon />
                  {application.phone}
                </span>

                <span className="text-slate-300">|</span>

                <span className="inline-flex items-center gap-1">
                  <MailIcon />
                  {application.email}
                </span>
              </div>
            </div>
          </div>

          {/* 심사 결과와 접수일 */}
          <div className="shrink-0 text-right">
            <span
              className={[
                "inline-flex rounded-md bg-blue-600 px-3 py-1.5",
                "text-[11px] font-bold text-white",
              ].join(" ")}
            >
              {application.score}
            </span>

            <p className="mt-2 text-[10px] font-medium text-slate-500">
              접수일: {formatSubmittedDate(application.submittedAt)}
            </p>
          </div>
        </div>
      </button>

      {/* 선택된 신청자만 상세 정보 표시 */}
      {selected && (
        <dl className="mx-4 mb-4 space-y-3 rounded-lg border border-slate-200 bg-white px-4 py-4 text-xs">
          <ApplicantInfoRow
            icon={<HomeIcon />}
            label="주거 환경"
            value={application.home}
          />

          <ApplicantInfoRow
            icon={<ExperienceIcon />}
            label="양육 경험"
            value={application.experience}
          />

          <ApplicantInfoRow
            icon={<ClockIcon />}
            label="외출 시간"
            value={application.awayHours}
          />
        </dl>
      )}
    </article>
  );
}

/* ==============================
 * 정보 행
 * ============================== */

function ApplicantInfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] items-start gap-4">
      <dt className="flex items-center gap-2 text-slate-600">
        <span className="text-slate-500">{icon}</span>
        <span>{label}</span>
      </dt>

      <dd className="text-right font-semibold leading-5 text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function PetMetadataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <dt className="font-medium text-slate-600">{label}</dt>

      <dd className="text-right font-medium text-slate-700">
        {value}
      </dd>
    </div>
  );
}

/* ==============================
 * 데이터 표시 유틸리티
 * ============================== */

function createPetSummary(pet: DetailedPet) {
  const values: string[] = [pet.age, pet.breed];

  if (pet.sex) {
    values.push(pet.sex);
  }

  if (typeof pet.neutered === "boolean") {
    values.push(pet.neutered ? "중성화 완료" : "중성화 미완료");
  }

  if (
    pet.weightKg !== undefined &&
    pet.weightKg !== null &&
    pet.weightKg !== ""
  ) {
    values.push(`${pet.weightKg}kg`);
  }

  return values.filter(Boolean).join(" · ");
}

function formatSubmittedDate(value?: string) {
  if (!value) {
    return "정보 미등록";
  }

  return value.slice(0, 10).replaceAll("-", ".");
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
      width="18"
      height="18"
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

function DocumentIcon() {
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
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h5" />
      <path d="M10 17h5" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      width="16"
      height="16"
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

function PhoneIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 2.1 2.4Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function ExperienceIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <path d="M6 10h12v10H6z" />
      <path d="M9 14h6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}