import { getDashboardViewModel } from "@/mvc/controllers/adminController";
import { DashboardView } from "@/mvc/views/DashboardView";

export const dynamic = "force-dynamic";

export default async function Home() {
  const viewModel = await getDashboardViewModel();

  return <DashboardView {...viewModel} />;
}
