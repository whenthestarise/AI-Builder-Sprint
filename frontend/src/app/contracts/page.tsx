import { getContractsViewModel } from "@/controllers/adminController";
import { ContractsAdminView } from "@/views/ContractsAdminView";

export default function ContractPage() {
  return <ContractsAdminView {...getContractsViewModel()} />;
}
