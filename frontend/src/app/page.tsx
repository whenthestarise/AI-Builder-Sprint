import { getDashboardViewModel } from "@/mvc/controllers/adminController";
import { DashboardView } from "@/mvc/views/DashboardView";

export default function Home() {
  return <DashboardView {...getDashboardViewModel()} />;
}
