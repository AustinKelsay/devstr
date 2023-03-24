import { useState, useEffect } from "react";
import { Button, Box } from "@chakra-ui/react";
import styles from "./repos.module.css";
import { useSession } from "next-auth/react";
import { Spinner } from "@chakra-ui/react";
import { setRepos } from "../../redux/githubReducer/githubReducer";
import { useDispatch, useSelector } from "react-redux";
import { useFetchGithubEvents } from "../../hooks/useFetchGithubEvents";
import useRelayInstance from "../../hooks/useRelayInstance";
import Repo from "../repo/repo";

const ActiveRepos = () => {
  const [displayCount, setDisplayCount] = useState(10);
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const user = session?.token?.login;

  const pubkey = useSelector((state) => state.users.user.pubkey);

  const devstrRelay = useRelayInstance();

  // Build a hook that fetches repo events from the relay to be able to tell if a repo has been broadcasted
  const [events, loading] = useFetchGithubEvents({
    devstrRelay: devstrRelay,
    kind: 339,
    pubKey: pubkey,
  });

  console.log("events in repos babyyyyyyy", events);

  const repoList = useSelector((state) => state.github.repos);

  useEffect(() => {
    const fetchRepos = async () => {
      const response = await fetch(
        `https://api.github.com/users/${user}/repos?sort=pushed`
      );
      const data = await response.json();
      dispatch(setRepos(data));
    };
    fetchRepos();
  }, []);

  const handleSeeMore = () => {
    setDisplayCount(displayCount + 10);
  };

  return loading || !repoList.length ? (
    <Spinner color="gray.50" />
  ) : (
    <div className={styles.container}>
      <h1 className={styles.header}>Active Repositories</h1>
      <div className={styles.eventList}>
        {repoList.length &&
          repoList.slice(0, displayCount).map((repo) => {
            const isBroadcasted = events.some(
              (event) => event.content.repo.name === repo.name
            );
            return (
              <Repo key={repo.id} repo={repo} isBroadcasted={isBroadcasted} />
            );
          })}

        {repoList.length > displayCount && (
          <Box textAlign="center" marginBottom="1rem">
            <Button onClick={handleSeeMore} bg={"purple.600"}>
              See More
            </Button>
          </Box>
        )}
      </div>
    </div>
  );
};

export default ActiveRepos;
