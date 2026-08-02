import { getManageViewModelByPetId } from "@/mvc/controllers/adminController";
import { ManageView } from "@/mvc/views/ManageView";

export const dynamic = "force-dynamic";

type ManagePetPageProps = {
  params: Promise<{ petId: string }>;
};

export default async function ManagePetPage({ params }: ManagePetPageProps) {
  const { petId } = await params;
  const viewModel = await getManageViewModelByPetId(petId);

  return <ManageView {...viewModel} />;
}
