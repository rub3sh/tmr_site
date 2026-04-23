import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import { prisma } from './prisma';
import { verifyPassword } from './password';

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: 'identify email messages.read connections',
        },
      },
    }),
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.passwordHash) return null;
        if (user.role !== 'ADMIN') return null;

        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'discord') {
        const discordProfile = profile as {
          id: string;
          username: string;
          avatar: string;
          email: string;
        };

        const existingUser = await prisma.user.findUnique({
          where: { discordId: discordProfile.id },
        });

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              discordUsername: discordProfile.username,
              discordAvatar: discordProfile.avatar,
              image: `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`,
              name: discordProfile.username,
            },
          });
        } else {
          const emailUser = await prisma.user.findUnique({
            where: { email: discordProfile.email },
          });

          if (emailUser) {
            await prisma.user.update({
              where: { id: emailUser.id },
              data: {
                discordId: discordProfile.id,
                discordUsername: discordProfile.username,
                discordAvatar: discordProfile.avatar,
                image: `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`,
              },
            });
          } else {
            const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } });
            const studentId = `MH-${String(studentCount + 1).padStart(4, '0')}`;

            await prisma.user.create({
              data: {
                email: discordProfile.email,
                name: discordProfile.username,
                discordId: discordProfile.id,
                discordUsername: discordProfile.username,
                discordAvatar: discordProfile.avatar,
                image: `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`,
                role: 'STUDENT',
                studentId,
                verificationStatus: 'PENDING',
              },
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'discord') {
        const dbUser = await prisma.user.findUnique({
          where: { discordId: token.sub },
        });
        if (!dbUser) {
          const dbUserByEmail = await prisma.user.findUnique({
            where: { email: token.email ?? '' },
          });
          if (dbUserByEmail) {
            token.id = dbUserByEmail.id;
            token.role = dbUserByEmail.role;
            token.studentId = dbUserByEmail.studentId;
            token.verificationStatus = dbUserByEmail.verificationStatus;
          }
        } else {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.studentId = dbUser.studentId;
          token.verificationStatus = dbUser.verificationStatus;
        }
      } else if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      // Default: student library
      return `${baseUrl}/student/library`;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as 'STUDENT' | 'ADMIN';
      session.user.studentId = token.studentId as string | undefined;
      session.user.verificationStatus = token.verificationStatus as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
