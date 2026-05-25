import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      provider?: unknown;
      providerAccountId?: unknown;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Kakao({
      authorization: {
        params: {
          scope: "profile_nickname account_email"
        }
      }
    })
  ],
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return Boolean(profile?.email);
      }

      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.provider = token.provider;
        session.user.providerAccountId = token.providerAccountId;
      }

      return session;
    }
  }
});
