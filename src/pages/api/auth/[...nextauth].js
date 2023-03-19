import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { redirect } from "next/dist/server/api-utils";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "gist",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ account, token }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session(session) {
      return session;
    },
    // async redirect(url, baseUrl) {
    //   if (url === "/") {
    //     return Promise.resolve("/onboarding");
    //   }
    // },
  },
  jwt: {
    secret: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
});
