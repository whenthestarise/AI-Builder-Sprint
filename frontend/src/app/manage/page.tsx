import { getManageViewModel } from "@/controllers/adminController";
import { ManageView } from "@/views/ManageView";

export default function ManagementPage() {
  return <ManageView {...getManageViewModel()} />;
}
