import { getManageViewModel } from "@/mvc/controllers/adminController";
import { ManageView } from "@/mvc/views/ManageView";

export default function ManagementPage() {
  return <ManageView {...getManageViewModel()} />;
}
