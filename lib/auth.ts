import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'BURSAR';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  orgId: string | null;
  organization?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
}

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

const users = new Map<string, StoredUser>();

export function createUser(data: Omit<StoredUser, 'id'>) {
  const id = `user_${Date.now()}`;
  const user = { id, ...data };
  users.set(data.email, user);
  return user;
}

export function findUserByEmail(email: string) {
  return users.get(email) || null;
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
          return null;
        }

        const user = findUserByEmail(credentials.email);

        if (!user) {
          return null;
        }

        if (user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          organization: user.organization,
        };
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
