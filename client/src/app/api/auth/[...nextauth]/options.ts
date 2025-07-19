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
                        domain: process.env.NEXTAUTH_URL?.replace(
                            /^https?:\/\//,
                            '',
                        ),
                        nonce: siwe.nonce,
                    });

                    logger.debug('SIWE verification result:', result);

                    if (result.success) {
                        logger.info(
                            `SIWE auth succeeded for address ${siwe.address}`,
                        );
                        return { id: siwe.address };
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
    },
    callbacks: {
        async session({ session, token }) {
            // @ts-expect-error because I still don't know how to fix hahahaha
            session.address = token.sub;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
