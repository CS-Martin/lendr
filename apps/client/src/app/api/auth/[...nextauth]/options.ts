import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';
import type { NextAuthOptions } from 'next-auth';
import { logger } from '../../../../lib/logger';

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

                    logger.debug('SIWE verification result:', result);

                    // TODO: Implement user creation if not exists
                    // TODO: Fetch user from database

                    if (result.success) {
                        logger.info(`SIWE auth succeeded for address ${siwe.address}`);
                        return { id: siwe.address, address: siwe.address };
                    } else {
                        logger.warn(
                            `SIWE auth failed verification for address ${siwe.address}`,
                        );
                    }
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
            if (user) {
                token.address = user.address;
                token.username = user.username;
                token.avatarUrl = user.avatarUrl;
                token.bio = user.bio;
                token.createdAt = user.createdAt;
                token.updatedAt = user.updatedAt;
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
