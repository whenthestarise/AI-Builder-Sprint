import { getRiskViewModel } from "@/mvc/controllers/adminController";
import { RiskView } from "@/mvc/views/RiskView";

export default function RiskPage() {
  return <RiskView {...getRiskViewModel()} />;
}
