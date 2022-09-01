import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compact } from "lodash";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { globalContext } from "../../../server/context";
import { env } from "../../../server/env";

const GOOGLE_PROVIDER =
  env.GOOGLE_ID &&
  env.GOOGLE_SECRET &&
  GoogleProvider({
    clientId: env.GOOGLE_ID,
    clientSecret: env.GOOGLE_SECRET,
  });

const useLocalDevUsers =
  !GOOGLE_PROVIDER &&
  (env.NODE_ENV === "development" || env.NODE_ENV === "test");

const DEV_ONLY_LOCAL_PROVIDER = CredentialsProvider({
  // The name to display on the sign in form (e.g. "Sign in with...")
  name: "Local Dev Credentials",
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

    // If you return null then an error will be displayed advising the user to check their details.
    return null;
  },
});

export const nextAuthOptions: NextAuthOptions = useLocalDevUsers
  ? {
      callbacks: {
        session({ session, token }) {
          // Put the user ID on the session object:
          return {
            ...session,
            user: session.user && { ...session.user, id: token.sub },
          };
        },
      },
      providers: compact([DEV_ONLY_LOCAL_PROVIDER]),
    }
  : {
      adapter: PrismaAdapter(globalContext.prisma),
      providers: compact([GOOGLE_PROVIDER]),
    };

export default NextAuth(nextAuthOptions);
