import AdminLoginForm from "./adminLoginForm"

const LoginComponent = ({user}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="bg-blue-300 max-w-[460px] w-full mx-4 rounded-lg shadow-xl">
            <AdminLoginForm/>
        </div>
    </div>
  )
}

export default LoginComponent