import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const ECHOATLAS_DB_URL = process.env.ECHOATLAS_DATABASE_URL;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!ECHOATLAS_DB_URL) {
          console.warn('[NextAuth] ECHOATLAS_DATABASE_URL not set, skipping auth');
          return null;
        }
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { prisma } = await import('./echoatlas-db');
          const { compare } = await import('bcryptjs');

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });
          if (!user?.passwordHash) return null;
          const ok = await compare(credentials.password, user.passwordHash);
          if (!ok) return null;
          return { id: user.id, email: user.email, name: user.name ?? undefined };
        } catch (err) {
          console.error('[NextAuth] authorize error:', err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-dev-secret-change-me',
};
