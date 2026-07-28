import { getRiskViewModel } from "@/controllers/adminController";
import { RiskView } from "@/views/RiskView";

export default function RiskPage() {
  return <RiskView {...getRiskViewModel()} />;
}
