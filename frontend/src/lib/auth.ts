import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
// import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for storing sessions and users
  adapter: PrismaAdapter(prisma),

  // Configure authentication providers
  providers: [
    // GitHub Authentication
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    // Google Authentication
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_ID!,
    //   clientSecret: process.env.GOOGLE_SECRET!,
    // }),

    // Credentials Provider (for email/password login)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials against your database
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // Check if user exists and password is correct
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          };
        }

        return null;
      }
    }),
  ],

  // Custom session callback to include user ID
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },

    // Customize JWT token
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },

  // Session configuration
  session: {
    strategy: 'jwt', // JSON Web Token strategy
  },

  // Pages for custom authentication flows
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    newUser: '/auth/new-user' // New users will be directed here on first sign in
  },

  // Security configurations
  events: {
    async signIn(message) {
      // Optional: Log signin attempts or perform additional actions
      console.log('User signed in', message.user.email);
    },
  },

  // Additional security settings
  theme: {
    colorScheme: 'auto', // Use system preference
    logo: '/logo.png', // Path to your logo
    brandColor: '#000000', // Your brand color
  },

  // Debug only in development
  debug: process.env.NODE_ENV === 'development',
};