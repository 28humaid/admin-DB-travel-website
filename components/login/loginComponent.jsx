"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminLoginForm from "./adminLoginForm"

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
    return <div>Waiting...</div>;
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