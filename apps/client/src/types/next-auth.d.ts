// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
    interface User {
        address: string;
        username?: string;
        avatarUrl?: string;
        bio?: string;
        createdAt?: Date;
        updatedAt?: Date;
    }

    interface Session {
        user: {
            address: string;
            username?: string;
            avatarUrl?: string;
            bio?: string;
            createdAt?: Date;
            updatedAt?: Date;
        };
    }

    interface JWT {
        address?: string;
        username?: string;
        avatarUrl?: string;
        bio?: string;
        createdAt?: Date;
        updatedAt?: Date;
        lastUpdated?: number;
    }
}
