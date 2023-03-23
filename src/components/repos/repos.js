import { useState, useEffect } from "react";
import { Button, Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import styles from "./repos.module.css";
import { useSession } from "next-auth/react";
import { Spinner } from "@chakra-ui/react";
import { getEventHash, relayInit } from "nostr-tools";

const ActiveRepos = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.token?.login;
  // const relays = useSelector((state) => state.nostr.relays);

  useEffect(() => {
    const fetchRepos = async () => {
      const response = await fetch(
        `https://api.github.com/users/${user}/repos?sort=pushed`
      );
      const data = await response.json();
      console.log(data);
      setRepos(data);
      setLoading(false);
    };
    fetchRepos();
  }, []);

  const handleBroadcast = async ({ repository }) => {
    setIsDisabled(true);

    const repo = {
      owner: repository.owner.login,
      name: repository.name,
      created_at: repository.created_at,
      url: repository.html_url,
      forks_url: repository.forks_url,
      keys_url: repository.keys_url,
      collaborators_url: repository.collaborators_url,
      teams_url: repository.teams_url,
      hooks_url: repository.hooks_url,
      issue_events_url: repository.issue_events_url,
      events_url: repository.events_url,
      assignees_url: repository.assignees_url,
      branches_url: repository.branches_url,
      tags_url: repository.tags_url,
      blobs_url: repository.blobs_url,
      git_tags_url: repository.git_tags_url,
      git_refs_url: repository.git_refs_url,
      trees_url: repository.trees_url,
      statuses_url: repository.statuses_url,
      languages_url: repository.languages_url,
      stargazers_url: repository.stargazers_url,
      contributors_url: repository.contributors_url,
      subscribers_url: repository.subscribers_url,
      subscription_url: repository.subscription_url,
      commits_url: repository.commits_url,
      git_commits_url: repository.git_commits_url,
      comments_url: repository.comments_url,
      issue_comment_url: repository.issue_comment_url,
      contents_url: repository.contents_url,
      compare_url: repository.compare_url,
      merges_url: repository.merges_url,
      archive_url: repository.archive_url,
      downloads_url: repository.downloads_url,
      issues_url: repository.issues_url,
      pulls_url: repository.pulls_url,
      milestones_url: repository.milestones_url,
      notifications_url: repository.notifications_url,
      labels_url: repository.labels_url,
      releases_url: repository.releases_url,
      deployments_url: repository.deployments_url,
      git_url: repository.git_url,
      ssh_url: repository.ssh_url,
      clone_url: repository.clone_url,
      svn_url: repository.svn_url,
      homepage: repository.homepage,
      mirror_url: repository.mirror_url,
      license: repository.license,
      visibility: repository.visibility,
      default_branch: repository.default_branch,
    };

    const pubkey = await window.nostr.getPublicKey();

    console.log("pubkey in handleBroadcast", pubkey);

    if (!pubkey) {
      return;
    }

    const repoEvent = {
      kind: 339,
      pubkey: pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify({
        repo: repo,
        type: "repo",
      }),
    };

    repoEvent.id = getEventHash(repoEvent);
    const signedEvent = await window.nostr.signEvent(repoEvent);

    repoEvent.sig = signedEvent.sig;

    const relay = relayInit("ws://127.0.0.1:8006");

    await relay.connect();

    try {
      await relay.publish(repoEvent);
      console.log("Event published successfully");
    } catch (err) {
      throw new Error(`Failed to publish event: ${err}`);
    }

    setIsDisabled(false);
  };

  return loading ? (
    <Spinner color="gray.50" />
  ) : (
    <div className={styles.container}>
      <h1 className={styles.header}>Recent Repositories</h1>
      <div className={styles.eventList}>
        {repos.length &&
          repos.slice(0, 6).map((repo) => (
            <div
              key={repo.id}
              className={isDisabled ? styles.disabledEvent : styles.event}
            >
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
                  bg={isDisabled ? "grey.500" : "purple.600"}
                  disabled={isDisabled}
                  isLoading={isDisabled}
                >
                  broadcast
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ActiveRepos;
