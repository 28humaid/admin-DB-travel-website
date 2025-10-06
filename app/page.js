"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginComponent from "@/components/login/loginComponent";

export default function page() {
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
    <LoginComponent user="admin"/>
  );
}
