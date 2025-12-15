import Sidebar from "@/components/common/sidebar";
import { getAuthSession } from "@/lib/getAuthSession";

const layout = async ({ children }) => {

  const session = await getAuthSession(); // Get server session

  // Protect: Redirect if not authenticated or not admin
  if (!session || session.user.role !== "admin") {
    redirect("/"); // Redirect to login page (or a custom unauthorized page)
  }

  const options = [
    { label: 'Create user', route: 'createUser',icon:'Pencil' },
    { label: 'Users details', route: 'usersDetails',icon:'Notebook' },
    { label: 'Upload Excel', route: 'excelUpload',icon:'MonitorUp' },
    { label: 'View Excel', route: 'viewExcel', icon:'FileSpreadsheet' },
    { label: 'Reconciliation', route: 'reconciliation', icon:'FileCheck' },
    { label: 'Logout', route: 'logout', icon:'LogOut' },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar options={options} />
      <div className="md:ml-[20%] w-full px-4 py-16 md:py-4">
        {children}
      </div>
    </div>
  );
};

export default layout;