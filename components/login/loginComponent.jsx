"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminLoginForm from "./adminLoginForm"
import { Loader2 } from "lucide-react";

const LoginComponent = ({user}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if session exists AND user is really on "/"
    if (status === "authenticated" && pathname === "/") {
      router.replace("/admin/dashboard/createUser");
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4 p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="bg-blue-300 max-w-[460px] w-full mx-4 rounded-lg shadow-xl">
            <AdminLoginForm/>
        </div>
    </div>
  )
}

export default LoginComponent