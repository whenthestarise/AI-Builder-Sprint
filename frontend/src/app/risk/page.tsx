import type {
  Contract,
  RiskCertificationCard,
  RiskConfig,
  RiskDashboardData,
  RiskUpcomingTimeline,
  TimelineEvent,
} from "@/mvc/models/adminModel";
import { RiskView } from "@/mvc/views/RiskView";

type RiskDashboardModalViewModel = {
  contract: Contract | null;
  dashboardData: RiskDashboardData | null;
  upcomingTimeline: RiskUpcomingTimeline | null;
  certificationCards: RiskCertificationCard[];
};

type RiskDashboardPageData = {
  contracts: Contract[];
  applicantPhone: string;
  timelineEvents: TimelineEvent[];
  modalViewModels: Record<string, RiskDashboardModalViewModel>;
  riskConfig: RiskConfig;
};

export default async function RiskPage() {
  const viewModel = await getRiskDashboardFromBackend();

  return <RiskView {...viewModel} />;
}

async function getRiskDashboardFromBackend(): Promise<RiskDashboardPageData> {
  const response = await fetch(
    `${getBackendBaseUrl()}/api/risk/dashboard`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Risk dashboard API request failed.");
  }

  const result = (await response.json()) as {
    data: RiskDashboardPageData;
  };

  return result.data;
}

function getBackendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000"
  );
}
