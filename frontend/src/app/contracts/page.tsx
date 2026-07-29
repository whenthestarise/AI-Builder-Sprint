import { getContractsViewModel } from "@/mvc/controllers/adminController";
import { ContractsAdminView } from "@/mvc/views/ContractsAdminView";

export default function ContractPage() {
  return <ContractsAdminView {...getContractsViewModel()} />;
}
