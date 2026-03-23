import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      orgId: string | null;
      organization?: {
        id: string;
        name: string;
        slug: string;
        status: string;
      };
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    orgId: string | null;
    organization?: {
      id: string;
      name: string;
      slug: string;
      status: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // For now, return a mock user for development
        // Replace with actual database lookup when Prisma is configured
        if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
          return {
            id: '1',
            email: credentials.email,
            name: 'Admin User',
            role: 'ADMIN',
            orgId: 'org_1',
            organization: {
              id: 'org_1',
              name: 'Demo School',
              slug: 'demo-school',
              status: 'ACTIVE',
            },
          } as any;
        }

        throw new Error('Invalid credentials');
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id || token.sub;
        token.role = u.role;
        token.orgId = u.orgId;
        token.organization = u.organization;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.orgId = token.orgId;
      session.user.organization = token.organization;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
