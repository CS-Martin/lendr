import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { SiweMessage } from "siwe";
import { logger } from "@/lib/logger";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        console.log("CREDENTIALS", credentials);
        try {
          const siwe = await new SiweMessage(credentials?.message || "");

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, ""),
            nonce: siwe.nonce,
          });

          if (!result.success) {
            throw new Error("Failed to verify SIWE message");
          }

          logger.info(`SIWE auth succeeded for address ${siwe.address}`);

          const user = await convex.mutation(api.user.getOrCreateUser, {
            address: siwe.address,
          });

          if (!user) {
            logger.error('Failed to create/fetch user');

            return null;
          }

          return {
            id: user._id.toString(),
            address: user.address,
            name: user.username || 'Anonymous',
            image: user.avatarUrl || null,
          };
        } catch (error) {
          console.error('Error in authorize:', error);
          logger.error('Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.address = token.address as string;
      return session;
    },
  },
};