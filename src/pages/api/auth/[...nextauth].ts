import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { globalContext } from "../../../server/context";
import { env } from "../../../server/env";

/**
 * For Logging in with a Google account.
 * Required a Google ID and secret
 */
const GOOGLE_PROVIDER =
  env.GOOGLE_ID &&
  env.GOOGLE_SECRET &&
  GoogleProvider({
    clientId: env.GOOGLE_ID,
    clientSecret: env.GOOGLE_SECRET,
  });

/**
 * Only works if either:
 * * You are in dev mode: Login using admin:admin or user:user.
 * * You've set the ADMIN_PASSWORD environment variable.
 *
 * This should only be used for development and demos,
 * not for a serious production deployment.
 */
const CREDENTIALS_PROVIDER = CredentialsProvider({
  // The name to display on the sign in form (e.g. "Sign in with...")
  name: "Credentials",
  // The credentials is used to generate a suitable form on the sign in page.
  // You can specify whatever fields you are expecting to be submitted.
  // e.g. domain, username, password, 2FA token, etc.
  // You can pass any HTML attribute to the <input> tag through the object.
  credentials: {
    username: { label: "Username", type: "text", placeholder: "jsmith" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const username = credentials?.username;
    const password = credentials?.password;

    const isDevMode =
      process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

    // In dev mode allow user:user or admin:admin:
    if (isDevMode) {
      if (username === "admin" && password === "admin") {
        return await globalContext.prisma.user.findUnique({
          where: { id: "admin-id" },
        });
      }
      if (username === "user" && password === "user") {
        return await globalContext.prisma.user.findUnique({
          where: { id: "user-id" },
        });
      }
    }

    // Allow a custom admin password from the env variable:
    if (env.ADMIN_PASSWORD?.length) {
      if (username === "admin" && password === env.ADMIN_PASSWORD) {
        return await globalContext.prisma.user.findUnique({
          where: { id: "admin-id" },
        });
      }
    }

    // If you return null then an error will be displayed advising the user to check their details.
    return null;
  },
});

export const nextAuthOptions: NextAuthOptions = {
  ...(GOOGLE_PROVIDER
    ? {
        adapter: PrismaAdapter(globalContext.prisma),
        providers: [GOOGLE_PROVIDER],
        callbacks: {
          session({ session, user }) {
            // Put the user ID on the session object:
            return {
              ...session,
              user: session.user && { ...session.user, id: user.id },
            };
          },
        },
      }
    : {
        providers: [CREDENTIALS_PROVIDER],
        callbacks: {
          session({ session, token }) {
            // Put the user ID on the session object:
            return {
              ...session,
              user: session.user && { ...session.user, id: token.sub },
            };
          },
        },
      }),
};

export default NextAuth(nextAuthOptions);
