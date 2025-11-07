import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is missing in .env');
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email },
            select: {
              adminId: true,
              email: true,
              passwordHash: true,
              fullName: true,
            },
          });

          if (!admin) return null;

          const isValid = await bcrypt.compare(credentials.password, admin.passwordHash);
          if (!isValid) return null;

          // Return only serializable data
          return {
            id: admin.adminId.toString(),
            email: admin.email,
            name: admin.fullName ?? undefined,
            role: 'admin', // you can add a `role` column later
          };
        } catch (err) {
          console.error('Auth error:', err);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hrs
  },

  callbacks: {
    async jwt({ token, user }) {
      // First call (login): `user` is present
      if (user) {
        token.id = user.id;
        token.role = user.role ?? 'admin';
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) session.user.id = token.id;
      if (token?.role) session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: '/',
    error: '/auth/error',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };