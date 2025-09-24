// export { default } from "next-auth/middleware";

// export const config = { matcher: ["/admin/:path*"] };

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // If not logged in and trying to access admin, redirect to login
  if (!token && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If logged in and trying to access login page, send to dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/admin/dashboard/createUser", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/"],
};
