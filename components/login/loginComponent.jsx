import InputField from "../common/inputField"
import AdminLoginForm from "./adminLoginForm"
import CustomerLoginForm from "./customerLoginForm"

const LoginComponent = ({user}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="bg-blue-300 max-w-[460px] w-full mx-4 rounded-lg shadow-xl">
            { user=="admin" && <AdminLoginForm/>}
            { user=="customer" && <CustomerLoginForm/>}
        </div>
    </div>
  )
}

export default LoginComponent