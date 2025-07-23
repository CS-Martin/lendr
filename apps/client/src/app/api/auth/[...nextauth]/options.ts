import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';
import type { NextAuthOptions } from 'next-auth';
import { logger } from '../../../../lib/logger';
import { userApiService } from '@/services/users.api';
import { UserDto } from '@repo/shared-dtos';

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
          logger.debug('Credentials received:', credentials);

          const siwe = new SiweMessage(credentials?.message || '');
          const result = await siwe.verify({
            signature: credentials?.signature || '',
            domain: process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, ''),
            nonce: siwe.nonce,
          });

          if (result.success) {
            logger.info(`SIWE auth succeeded for address ${siwe.address}`);

            // Fetch or create user right in the authorize callback
            let user = await userApiService.findOne(siwe.address);

            logger.info('User found:', user);
            logger.info('Creating user:', siwe.address);

            if (!user.data) {
              const newUser = await userApiService.create({
                address: siwe.address,
                username: ``,
                avatarUrl: ``,
                bio: '',
              } as UserDto);
              user = newUser;
            }

            logger.info('User created:', user);

            return {
              id: siwe.address,
              address: siwe.address,
              ...user.data,
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
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.address = user.address;
        token.username = user.username;
        token.avatarUrl = user.avatarUrl;
        token.bio = user.bio;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
      }

      // Subsequent requests - refresh user data periodically
      else if (token.address) {
        const now = Date.now();
        const lastUpdated = (token.lastUpdated as number) || 0;

        // Refresh user data if it's older than 5 minutes
        if (now - lastUpdated > 5 * 60 * 1000) {
          const userData = await userApiService.findOne(token.address as string);
          if (userData.data) {
            token.username = userData.data.username;
            token.avatarUrl = userData.data.avatarUrl;
            token.bio = userData.data.bio;
            token.updatedAt = userData.data.updatedAt;
            token.lastUpdated = now;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        address: token.address as string,
        username: token.username as string,
        avatarUrl: token.avatarUrl as string,
        bio: token.bio as string,
        createdAt: token.createdAt as Date,
        updatedAt: token.updatedAt as Date,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
