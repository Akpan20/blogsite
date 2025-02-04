import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from '@/src/services/authService';
import { prisma } from '@/src/lib/prisma';
import { generateUsername } from '@/src/lib/utils';

// Define types based on your Prisma schema
type UserRole = 'ADMIN' | 'EDITOR' | 'AUTHOR';

interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  recommendedTags?: string[];
  jwtToken?: string;
}

const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      profile(profile): User {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          username: `gh_${profile.login}`.toLowerCase(),
          avatar: profile.avatar_url,
          role: 'AUTHOR',
          jwtToken: null,
        };
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        try {
          const response = await authService.login({
            email: credentials.email,
            password: credentials.password
          });
      
          const data = response?.data;
      
          if (data?.token) {
            return {
              id: data.user.id,
              email: data.user.email,
              username: data.user.username,
              name: data.user.name,
              avatar: data.user.avatar,
              role: data.user.role,
              bio: data.user.bio,
              recommendedTags: data.user.recommendedTags,
              jwtToken: data.token,
            };
          }
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },      
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        try {
          // Check if user exists
          let dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: user.email },
                { googleId: user.id }
              ]
            }
          });

          if (!dbUser) {
            // Generate a unique username
            let baseUsername = user.name 
              ? user.name.toLowerCase().replace(/[^a-z0-9]/g, '')
              : `user${Math.random().toString(36).slice(2, 8)}`;
            
            let username = baseUsername;
            let counter = 1;
            
            // Keep trying until we find a unique username
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }

            // Create new user
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                username: username,
                name: user.name,
                avatar: user.image,
                googleId: user.id,
                role: 'AUTHOR',
                password: '', // Empty password for OAuth users
                recommendedTags: [],
              },
            });
          } else {
            // Update existing user
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                name: user.name || dbUser.name,
                avatar: user.image || dbUser.avatar,
                updatedAt: new Date(),
              },
            });
          }

          // Attach the database user ID to the NextAuth user
          user.id = dbUser.id;
          return true;
        } catch (error) {
          console.error('Error during GitHub sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Fetch full user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            avatar: true,
            bio: true,
            recommendedTags: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.avatar = dbUser.avatar;
          token.bio = dbUser.bio;
          token.recommendedTags = dbUser.recommendedTags;
          token.jwtToken = user.jwtToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
          role: token.role as UserRole,
          avatar: token.avatar as string | null,
          bio: token.bio as string | null,
          recommendedTags: token.recommendedTags as string[],
        },
        jwtToken: token.jwtToken as string | null,
      };
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.jwtToken) {
        try {
          // Call your backend to invalidate the JWT token
          await authService.logout(token.jwtToken);
        } catch (error) {
          console.error('Error during logout:', error);
        }
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };