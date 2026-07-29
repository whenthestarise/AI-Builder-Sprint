import { getDashboardViewModel } from "@/mvc/controllers/adminController";
import { DashboardView } from "@/mvc/views/DashboardView";

export default function MainPage() {
  return <DashboardView {...getDashboardViewModel()} />;
}
