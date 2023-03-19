import { useState, useEffect } from "react";
import { Button } from "@chakra-ui/react";
import { createRepoEvent } from "@/utils/createRepoEvent";
import styles from "./repos.module.css";

const ActiveRepos = () => {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const fetchRepos = async () => {
      const response = await fetch(
        "https://api.github.com/users/austinkelsay/repos?sort=pushed&per_page=6"
      );
      const data = await response.json();
      console.log(data);
      setRepos(data);
    };
    fetchRepos();
  }, []);

  const handleBroadcast = async ({ repository }) => {
    console.log("repository in handleBroadcast", repository);
    const owner = repository.owner.login;
    const repoName = repository.name;
    const url = repository.html_url;

    const repo = {
      owner,
      name: repoName,
      url,
    };

    const pubkey = await window.nostr.getPublicKey();

    if (!pubkey) {
      return;
    }

    const event = createRepoEvent({ pubkey, repo });

    console.log("event in handleBroadcast", event);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Recent Repositories</h1>
      <div className={styles.eventListContainer}>
        <div className={styles.eventList}>
          {repos.length &&
            repos.map((repo) => (
              <div key={repo.id} className={styles.event}>
                <div className={styles.eventType}>{repo.name}</div>
                <div className={styles.eventPayload}>{repo.description}</div>
                <div className={styles.details}>
                  <span className={styles.language}>{repo.language}</span>
                  <span className={styles.stars}>
                    {repo.stargazers_count} stars
                  </span>
                  <span className={styles.updated}>
                    Updated on {new Date(repo.pushed_at).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.buttonContainer}>
                  <Button
                    as="a"
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    bg={"purple.600"}
                  >
                    visit
                  </Button>
                  <Button
                    onClick={() => {
                      if (repo) handleBroadcast({ repository: repo });
                    }}
                    bg={"purple.600"}
                  >
                    broadcast
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveRepos;
