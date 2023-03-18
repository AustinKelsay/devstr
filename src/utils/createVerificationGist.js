const { Octokit } = require("@octokit/rest");

export const createVerificationGist = async (token, npub) => {
  const octokit = new Octokit({
    auth: token,
    userAgent: "devstr/1.0.0",
    version: "2022-11-28",
  });

  const response = await octokit.gists.create({
    description: "gist",
    public: true,
    files: {
      "README.md": {
        content: `Verifying that I control the following Nostr public key: ${npub}`,
      },
    },
  });
  return response.data.id;
};
