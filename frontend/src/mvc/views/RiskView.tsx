"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type {
  RiskManagementItem,
  RiskLevel,
  RiskApprovalStatus,
} from "@/mvc/models/adminModel";
import {
  AdminShell,
  PageContent,
  PageHeader,
} from "@/mvc/views/AdminShell";
import { RiskDashboardModal } from "@/mvc/views/RiskDashboardModal";

type RiskFilter =
  | "all"
  | "pending"
  | "urgent"
  | "warning"
  | "watch"
  | "normal";

type RiskViewProps = {
  contracts: RiskManagementItem[];
};

const filterItems: Array<{
  key: RiskFilter;
  label: string;
  riskLevel?: RiskLevel;
}> = [
  {
    key: "all",
    label: "전체",
  },
  {
    key: "pending",
    label: "승인 미완료",
  },
  {
    key: "urgent",
    label: "긴급",
    riskLevel: "urgent",
  },
  {
    key: "warning",
    label: "주의",
    riskLevel: "warning",
  },
  {
    key: "watch",
    label: "관찰",
    riskLevel: "watch",
  },
  {
    key: "normal",
    label: "정상",
    riskLevel: "normal",
  },
];

export function RiskView({ contracts }: RiskViewProps) {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<RiskFilter>("all");
  const [selectedContract, setSelectedContract] =
    useState<RiskManagementItem | null>(null);
  const [loadingDashboardId, setLoadingDashboardId] =
    useState<string | null>(null);
  const [dashboardLoadError, setDashboardLoadError] =
    useState("");

  const handleOpenDashboard = async (
    item: RiskManagementItem,
  ) => {
    setLoadingDashboardId(item.id);
    setDashboardLoadError("");

    try {
      const response = await fetchContractDashboard(item.id);

      if (!response.ok) {
        throw new Error(
          "대시보드 최신 정보를 불러오지 못했습니다.",
        );
      }

      const modal = (await response.json()) as {
        contract: RiskManagementItem["contract"] | null;
        dashboardData: RiskManagementItem["dashboardData"] | null;
        upcomingTimeline: RiskManagementItem["upcomingTimeline"] | null;
        certificationCards: RiskManagementItem["certificationCards"];
      };

      setSelectedContract({
        ...item,
        contract: modal.contract ?? item.contract,
        dashboardData: modal.dashboardData ?? null,
        upcomingTimeline: modal.upcomingTimeline ?? null,
        certificationCards: modal.certificationCards ?? [],
      });
    } catch {
      setSelectedContract(item);
      setDashboardLoadError("");
    } finally {
      setLoadingDashboardId(null);
    }
  };

  const filterCounts = useMemo(() => {
    return {
      all: contracts.length,

      pending: contracts.filter(
        (item) => item.approvalStatus === "pending",
      ).length,

      urgent: contracts.filter(
        (item) => item.riskLevel === "urgent",
      ).length,

      warning: contracts.filter(
        (item) => item.riskLevel === "warning",
      ).length,

      watch: contracts.filter(
        (item) => item.riskLevel === "watch",
      ).length,

      normal: contracts.filter(
        (item) => item.riskLevel === "normal",
      ).length,
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return contracts.filter((item) => {
      const matchesKeyword =
        !keyword ||
        [
          item.adopterName,
          item.petName,
          item.petBreed,
          item.contact,
        ].some((value) =>
          value.toLowerCase().includes(keyword),
        );

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "pending" &&
          item.approvalStatus === "pending") ||
        item.riskLevel === selectedFilter;

      return matchesKeyword && matchesFilter;
    });
  }, [contracts, searchKeyword, selectedFilter]);

  return (
    <AdminShell>
      <PageHeader
        title="동물 입양 관리"
        description="입양자가 제출한 안부 보고를 검토하고 승인하세요."
        action={
          <Link
            href="/main"
            className={[
              "inline-flex h-9 items-center justify-center gap-1.5",
              "rounded-lg border border-slate-200 bg-white px-4",
              "text-[11px] font-semibold text-slate-600 shadow-sm",
              "transition-colors hover:bg-slate-50 hover:text-slate-900",
            ].join(" ")}
          >
            <ArrowLeftIcon />
            목록으로
          </Link>
        }
      />

      <PageContent>
        <div className="space-y-4">
          {/* 검색 및 필터 */}
          <section className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative w-full xl:max-w-[380px]">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                <SearchIcon />
              </span>

              <input
                type="search"
                value={searchKeyword}
                onChange={(event) =>
                  setSearchKeyword(event.target.value)
                }
                placeholder="입양자 검색하기"
                aria-label="입양자 검색"
                className={[
                  "h-11 w-full rounded-lg border border-slate-200",
                  "bg-white pl-11 pr-4 text-sm text-slate-900",
                  "outline-none placeholder:text-slate-400",
                  "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                ].join(" ")}
              />
            </div>

            <div className="hidden h-8 w-px bg-slate-200 xl:block" />

            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {filterItems.map((item) => (
                <FilterChip
                  key={item.key}
                  filterKey={item.key}
                  label={item.label}
                  count={filterCounts[item.key]}
                  active={selectedFilter === item.key}
                  riskLevel={item.riskLevel}
                  onClick={() =>
                    setSelectedFilter(item.key)
                  }
                />
              ))}
            </div>
          </section>

          {/* 입양 관리 테이블 */}
          <section
            className={[
              "min-h-[calc(100vh-245px)] overflow-hidden",
              "rounded-xl border border-slate-200",
              "bg-white shadow-sm",
            ].join(" ")}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] table-fixed border-collapse">
                <colgroup>
                  <col className="w-[8%]" />
                  <col className="w-[13%]" />
                  <col className="w-[11%]" />
                  <col className="w-[17%]" />
                  <col className="w-[10%]" />
                  <col className="w-[15%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                </colgroup>

                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <TableHeader>입양자</TableHeader>
                    <TableHeader>반려동물</TableHeader>
                    <TableHeader>입양날짜</TableHeader>
                    <TableHeader>마지막 인증일</TableHeader>
                    <TableHeader>위험 등급</TableHeader>
                    <TableHeader>승인 상태</TableHeader>
                    <TableHeader>대시보드</TableHeader>
                    <TableHeader>연락처</TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {filteredContracts.map((item) => (
                    <RiskTableRow
                      key={item.id}
                      item={item}
                      loading={
                        loadingDashboardId === item.id
                      }
                      onOpenDashboard={() =>
                        handleOpenDashboard(item)
                      }
                    />
                  ))}

                  {filteredContracts.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex min-h-[240px] items-center justify-center">
                          <div className="text-center">
                            <p className="text-sm font-semibold text-slate-600">
                              조건에 맞는 입양 관리 내역이 없습니다.
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                setSearchKeyword("");
                                setSelectedFilter("all");
                              }}
                              className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700"
                            >
                              검색 조건 초기화
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          {dashboardLoadError ? (
            <p className="text-xs font-semibold text-red-600">
              {dashboardLoadError}
            </p>
          ) : null}
        </div>
      </PageContent>

      {selectedContract && (
        <RiskDashboardModal
          contract={selectedContract.contract}
          applicantPhone={selectedContract.contact}
          dashboardData={
            selectedContract.dashboardData ?? null
          }
          upcomingTimeline={
            selectedContract.upcomingTimeline ?? null
          }
          certificationCards={
            selectedContract.certificationCards ?? []
          }
          onClose={() => {
            setSelectedContract(null);
            router.refresh();
          }}
        />
      )}
    </AdminShell>
  );
}

/* ==============================
 * 테이블 행
 * ============================== */

function RiskTableRow({
  item,
  loading,
  onOpenDashboard,
}: {
  item: RiskManagementItem;
  loading: boolean;
  onOpenDashboard: () => void;
}) {
  const certificationDisplay =
    getCertificationDisplay(item);

  return (
    <tr className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/70">
      <TableCell>
        <span className="block truncate font-extrabold text-slate-950">
          {item.adopterName}
        </span>
      </TableCell>

      <TableCell>
        <Link
          href={`/manage?petId=${encodeURIComponent(
            String(item.petId),
          )}`}
          className="block truncate font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          {item.petName} ({item.petBreed})
        </Link>
      </TableCell>

      <TableCell>
        <span className="whitespace-nowrap text-slate-600">
          {formatDate(item.adoptionDate)}
        </span>
      </TableCell>

      <TableCell>
        <span
          className={[
            "block whitespace-nowrap font-medium",
            certificationDisplay.delayed
              ? "font-bold text-red-600"
              : "text-slate-600",
          ].join(" ")}
        >
          {certificationDisplay.text}
        </span>
      </TableCell>

      <TableCell>
        <RiskBadge riskLevel={item.riskLevel} />
      </TableCell>

      <TableCell>
        <ApprovalBadge status={item.approvalStatus} />
      </TableCell>

      <TableCell>
        <button
          type="button"
          onClick={onOpenDashboard}
          disabled={loading}
          className={[
            "inline-flex h-8 items-center justify-center gap-1.5",
            "whitespace-nowrap rounded-md px-3",
            "text-[11px] font-bold text-white",
            "bg-blue-600 transition-colors hover:bg-blue-700",
            "disabled:cursor-wait disabled:bg-slate-400",
          ].join(" ")}
        >
          <DashboardIcon />
          대시보드 열람
        </button>
      </TableCell>

      <TableCell>
        <span
          className={[
            "inline-flex h-8 items-center justify-center gap-1.5",
            "whitespace-nowrap rounded-md border border-slate-200",
            "bg-white px-3 text-[11px] font-medium text-slate-600",
          ].join(" ")}
        >
          <PhoneIcon />
          {item.contact}
        </span>
      </TableCell>
    </tr>
  );
}

/* ==============================
 * ?꾪꽣 移?
 * ============================== */

function FilterChip({
  filterKey,
  label,
  count,
  active,
  riskLevel,
  onClick,
}: {
  filterKey: RiskFilter;
  label: string;
  count: number;
  active: boolean;
  riskLevel?: RiskLevel;
  onClick: () => void;
}) {
  const styles = getFilterStyle(
    filterKey,
    riskLevel,
    active,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex h-8 items-center justify-center gap-1.5",
        "whitespace-nowrap rounded-full border px-3",
        "text-[11px] font-bold transition-all",
        styles.className,
      ].join(" ")}
    >
      {styles.dotClassName && (
        <span
          className={[
            "h-2.5 w-2.5 rounded-full shadow-inner",
            styles.dotClassName,
          ].join(" ")}
        />
      )}

      <span>
        {label} ({count})
      </span>
    </button>
  );
}

/* ==============================
 * ?꾪뿕 ?깃툒 諛곗?
 * ============================== */

function RiskBadge({
  riskLevel,
}: {
  riskLevel: RiskLevel;
}) {
  const style = {
    urgent: {
      label: "긴급",
      wrapper: "border-red-300 bg-red-50 text-red-600",
      dot: "bg-red-500",
    },
    warning: {
      label: "주의",
      wrapper: "border-orange-300 bg-orange-50 text-orange-600",
      dot: "bg-orange-500",
    },
    watch: {
      label: "관찰",
      wrapper: "border-yellow-300 bg-yellow-50 text-yellow-700",
      dot: "bg-yellow-400",
    },
    normal: {
      label: "정상",
      wrapper: "border-emerald-300 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
  }[riskLevel];

  return (
    <span
      className={[
        "inline-flex h-7 items-center gap-1.5",
        "whitespace-nowrap rounded-full border px-2.5",
        "text-[11px] font-bold",
        style.wrapper,
      ].join(" ")}
    >
      <span
        className={[
          "h-2.5 w-2.5 rounded-full",
          style.dot,
        ].join(" ")}
      />

      {style.label}
    </span>
  );
}
function ApprovalBadge({
  status,
}: {
  status: RiskApprovalStatus;
}) {
  if (status === "actionApproved") {
    return (
      <span
        className={[
          "inline-flex h-7 items-center gap-1.5",
          "whitespace-nowrap rounded-full border border-blue-300",
          "bg-blue-50 px-2.5 text-[11px] font-bold text-blue-600",
        ].join(" ")}
      >
        <CheckCircleIcon />
        {"\uc870\uce58 \ud6c4 \uc2b9\uc778\uc644\ub8cc"}
      </span>
    );
  }

  if (status === "approved") {
    return (
      <span
        className={[
          "inline-flex h-7 items-center gap-1.5",
          "whitespace-nowrap rounded-full border border-blue-300",
          "bg-blue-50 px-2.5 text-[11px] font-bold text-blue-600",
        ].join(" ")}
      >
        <CheckCircleIcon />
        {"\uc2b9\uc778\uc644\ub8cc"}
      </span>
    );
  }

  return (
    <span
      className={[
        "inline-flex h-7 items-center",
        "whitespace-nowrap rounded-full border border-slate-300",
        "bg-white px-2.5 text-[11px] font-semibold text-slate-600",
      ].join(" ")}
    >
      {"\uac80\ud1a0 \ub300\uae30 \uc911"}
    </span>
  );
}
function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      scope="col"
      className="h-11 px-4 text-left text-[11px] font-bold text-slate-500"
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="h-[62px] overflow-hidden px-4 text-xs">
      {children}
    </td>
  );
}

/* ==============================
 * 데이터 표시 유틸리티
 * ============================== */

function getCertificationDisplay(
  item: RiskManagementItem,
) {
  const now = startOfDay(new Date());

  if (item.certificationDueDate) {
    const dueDate = parseDate(item.certificationDueDate);

    if (dueDate && dueDate < now) {
      const delayedDays = differenceInDays(now, dueDate);

      return {
        delayed: true,
        text: `${formatDate(
          item.certificationDueDate,
        )} (${delayedDays}일 지연)`,
      };
    }
  }

  if (!item.lastCertificationDate) {
    return {
      delayed: false,
      text: "인증 기록 없음",
    };
  }

  return {
    delayed: item.lastCertificationDate.includes("지연"),
    text: item.lastCertificationDate,
  };
}

function getFilterStyle(
  filterKey: RiskFilter,
  riskLevel: RiskLevel | undefined,
  active: boolean,
) {
  if (filterKey === "all") {
    return {
      className: active
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
      dotClassName: "",
    };
  }

  if (filterKey === "pending") {
    return {
      className: active
        ? "border-slate-500 bg-slate-100 text-slate-900 ring-1 ring-slate-300"
        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
      dotClassName: "",
    };
  }

  const riskStyles = {
    urgent: {
      wrapper: active
        ? "border-red-400 bg-red-100 text-red-700 ring-1 ring-red-200"
        : "border-red-300 bg-red-50 text-red-600 hover:bg-red-100",
      dot: "bg-red-500",
    },
    warning: {
      wrapper: active
        ? "border-orange-400 bg-orange-100 text-orange-700 ring-1 ring-orange-200"
        : "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100",
      dot: "bg-orange-500",
    },
    watch: {
      wrapper: active
        ? "border-yellow-400 bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200"
        : "border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
      dot: "bg-yellow-400",
    },
    normal: {
      wrapper: active
        ? "border-emerald-400 bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
        : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      dot: "bg-emerald-500",
    },
  }[riskLevel ?? "normal"];

  return {
    className: riskStyles.wrapper,
    dotClassName: riskStyles.dot,
  };
}

function parseDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function differenceInDays(
  laterDate: Date,
  earlierDate: Date,
) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const later = Date.UTC(
    laterDate.getFullYear(),
    laterDate.getMonth(),
    laterDate.getDate(),
  );

  const earlier = Date.UTC(
    earlierDate.getFullYear(),
    earlierDate.getMonth(),
    earlierDate.getDate(),
  );

  return Math.floor(
    (later - earlier) / millisecondsPerDay,
  );
}

function formatDate(value: string) {
  const parsed = parseDate(value);

  if (!parsed) {
    return value;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(
    2,
    "0",
  );
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
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

function SearchIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function DashboardIcon() {
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
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v4h4" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
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

function CheckCircleIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function getBackendBaseUrls() {
  return Array.from(
    new Set(
      [
        process.env.NEXT_PUBLIC_API_BASE_URL,
        process.env.API_BASE_URL,
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://192.168.56.1:8000",
        "http://113.131.34.14:8000",
      ]
        .filter((value): value is string => Boolean(value?.trim()))
        .map((value) => value.trim().replace(/\/$/, "")),
    ),
  );
}

async function fetchContractDashboard(contractId: string) {
  let lastResponse: Response | null = null;

  for (const backendUrl of getBackendBaseUrls()) {
    try {
      const response = await fetch(
        `${backendUrl}/api/risk/contracts/${encodeURIComponent(
          contractId,
        )}/dashboard`,
        { cache: "no-store" },
      );

      if (response.ok) {
        return response;
      }

      lastResponse = response;
    } catch {
      continue;
    }
  }

  return (
    lastResponse ??
    new Response(null, {
      status: 502,
    })
  );
}



