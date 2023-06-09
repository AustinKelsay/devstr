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
    async jwt({ account, token, user, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      if (profile?.login) {
        token.login = profile.login;
      }
      return token;
    },
    async session(session) {
      return session;
    },
    async redirect(url, baseUrl) {
      return Promise.resolve("/onboarding");
    },
  },
  jwt: {
    secret: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
});
