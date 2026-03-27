import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'BURSAR';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      orgId: string | null;
      imageUrl?: string | null;
      emailVerified?: string | null;
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
    imageUrl?: string | null;
    emailVerified?: string | null;
    organization?: {
      id: string;
      name: string;
      slug: string;
      status: string;
    };
  }
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: Role;
  orgId: string | null;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role,
      orgId: data.orgId,
    },
  });

  return user;
}

export async function findUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      org: true,
    },
  });

  return user as any;
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
          console.log('Missing credentials');
          return null;
        }

        try {
          const user = await findUserByEmail(credentials.email);

          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          console.log('Login successful for:', credentials.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
            orgId: user.orgId,
            imageUrl: user.imageUrl,
            emailVerified: user.emailVerified?.toISOString() || null,
            organization: user.org ? {
              id: user.org.id,
              name: user.org.name,
              slug: user.org.slug,
              status: user.org.status,
            } : undefined,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        const u = user as any;
        token.id = u.id || token.sub;
        token.role = u.role;
        token.orgId = u.orgId;
        token.imageUrl = u.imageUrl;
        token.emailVerified = u.emailVerified;
        token.organization = u.organization;
        token.name = u.name;
        token.email = u.email;
      }
      
      // Handle session update (e.g., from settings page)
      if (trigger === 'update' && session) {
        // Update token with new session data
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.imageUrl !== undefined) token.imageUrl = session.imageUrl;
        if (session.emailVerified !== undefined) token.emailVerified = session.emailVerified;
        if (session.organization) token.organization = session.organization;
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.orgId = token.orgId;
      session.user.imageUrl = token.imageUrl;
      session.user.emailVerified = token.emailVerified;
      session.user.organization = token.organization;
      session.user.name = token.name || session.user.name;
      session.user.email = token.email || session.user.email;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
