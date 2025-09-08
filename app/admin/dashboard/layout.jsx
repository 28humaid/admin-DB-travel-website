import Sidebar from "@/components/common/sidebar";

const layout = ({ children }) => {
  const options = [
    { label: 'Create user', route: 'createUser',icon:'Pencil' },
    { label: 'Users details', route: 'usersDetails',icon:'Notebook' },
    { label: 'Upload Excel', route: 'excelUpload',icon:'MonitorUp' },
    { label: 'Logout', route: 'login', icon:'LogOut' },
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