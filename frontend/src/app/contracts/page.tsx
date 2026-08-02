import { getContractsViewModel } from "@/mvc/controllers/adminController";
import { ContractsAdminView } from "@/mvc/views/ContractsAdminView";

export const dynamic = "force-dynamic";

type ContractPageProps = {
  searchParams: Promise<{
    petId?: string;
    applicationId?: string;
  }>;
};

export default async function ContractPage({
  searchParams,
}: ContractPageProps) {
  const { petId, applicationId } = await searchParams;
  const viewModel = await getContractsViewModel({
    petId,
    applicationId,
  });

  return <ContractsAdminView {...viewModel} />;
}
