import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

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
  },
  jwt: {
    secret: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
});
