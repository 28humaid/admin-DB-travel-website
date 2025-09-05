import Sidebar from "@/components/common/sidebar";

const layout = ({ children }) => {
  const options = [
    { label: 'Create user', route: 'createUser' },
    { label: 'Users details', route: 'usersDetails' },
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