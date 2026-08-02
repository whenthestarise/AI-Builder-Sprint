import { getManageViewModel } from "@/mvc/controllers/adminController";
import { ManageView } from "@/mvc/views/ManageView";

export const dynamic = "force-dynamic";

type ManagementPageProps = {
  searchParams: Promise<{ petId?: string }>;
};

export default async function ManagementPage({
  searchParams,
}: ManagementPageProps) {
  const { petId } = await searchParams;
  const viewModel = await getManageViewModel(petId);

  return <ManageView {...viewModel} />;
}
