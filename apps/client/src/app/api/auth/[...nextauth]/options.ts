import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';
import type { NextAuthOptions } from 'next-auth';
import { logger } from '../../../../lib/logger';
import { userApiService } from '@/services/users.api';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(credentials?.message || '');
          const result = await siwe.verify({
            signature: credentials?.signature || '',
            domain: process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, ''),
            nonce: siwe.nonce,
          });

          if (result.success) {
            logger.info(`SIWE auth succeeded for address ${siwe.address}`);

            const userResponse = await userApiService.findOne(siwe.address);

            if (userResponse) {
              return {
                id: userResponse.address, // Authorize expects ID which causes an error. Use address instead
                address: userResponse.address,
                username: userResponse.username,
                avatarUrl: userResponse.avatarUrl,
                bio: userResponse.bio,
                createdAt: userResponse.createdAt,
                updatedAt: userResponse.updatedAt,
              };
            }

            // Create user if not found
            const newUserResponse = await userApiService.create({
              address: siwe.address,
              username: '',
              avatarUrl: '',
              bio: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            return {
              id: newUserResponse.address, // Using address as id since it's unique
              ...newUserResponse,
            };
          }

          logger.warn(`SIWE auth failed verification for address ${siwe.address}`);
          return null;
        } catch (e) {
          logger.error('SIWE auth failed:', e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.address = user.address;
        token.username = user.username;
        token.avatarUrl = user.avatarUrl;
        token.bio = user.bio;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
      }

      // Manual update trigger (from client-side update)
      if (trigger === 'update' && session?.user) {
        token.username = session.user.username;
        token.avatarUrl = session.user.avatarUrl;
        token.bio = session.user.bio;
        token.updatedAt = new Date();
      }

      return token;
    },

    async session({ session, token }) {
      session.user.address = token.address as string;
      session.user.username = token.username as string;
      session.user.avatarUrl = token.avatarUrl as string;
      session.user.bio = token.bio as string;
      session.user.createdAt = token.createdAt as Date;
      session.user.updatedAt = token.updatedAt as Date;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
