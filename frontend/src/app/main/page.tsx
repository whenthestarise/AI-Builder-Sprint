import { getDashboardViewModel } from "@/controllers/adminController";
import { DashboardView } from "@/views/DashboardView";

export default function MainPage() {
  return <DashboardView {...getDashboardViewModel()} />;
}
