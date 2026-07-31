import { getManageViewModelByPetId } from "@/mvc/controllers/adminController";
import { ManageView } from "@/mvc/views/ManageView";

type ManagePetPageProps = {
  params: Promise<{ petId: string }>;
};

export default async function ManagePetPage({ params }: ManagePetPageProps) {
  const { petId } = await params;
  const viewModel = getManageViewModelByPetId(petId);

  return <ManageView {...viewModel} />;
}
