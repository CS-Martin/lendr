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

                        // Create user if not found
                        if (!user.data) {
                            const newUser = await userApiService.create({
                                address: siwe.address,
                                username: ``,
                                avatarUrl: ``,
                                bio: '',
                            } as UserDto);
                            user = newUser;
                        }

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
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                return {
                    ...token,
                    ...user,
                };
            }

            // Manual update trigger (from client-side update)
            if (trigger === 'update' && session?.user) {
                return {
                    ...token,
                    ...session.user,
                };
            }

            // Periodic refresh (every 5 minutes)
            if (token.address && Date.now() - ((token.lastUpdated as number) || 0) > 5 * 60 * 1000) {
                try {
                    const userData = await userApiService.findOne(token.address as string);
                    if (userData.data) {
                        return {
                            ...token,
                            ...userData.data,
                            lastUpdated: Date.now(),
                        };
                    }
                } catch (error) {
                    // Log error but don't fail the token refresh
                    logger.error('Failed to refresh user data in JWT callback:', error);
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
