// @/lib/getAuthSession.js
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getAuthSession(request) {
  // Fallback to cookie-based session if no request (e.g., for pages like getServerSideProps)
  if (!request) {
    console.log("!!!!!!!!!NO REQUEST FOUND!!!!!!!!!!!");
    
    return await getServerSession(authOptions);
  }
  console.log("xxxxxxREQUEST FOUNDxxxxx");
  
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required");
  }

  // Decode from header or cookie
  const token = await getToken({ 
    req: request, 
    secret 
  });

  if (!token) {
    return null;
  }

  // Build session object from decoded token (matches your session structure)
  return {
    user: {
      id: token.sub,  // From NextAuth (user ID)
      // email: token.email,
      // name: token.name || token.sub,
      role: token.role,  // Added via your jwt callback
    },
    expires: new Date(token.exp * 1000),
  };
}