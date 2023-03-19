import { useState, useEffect } from "react";
import { Avatar, Text, Flex, Box } from "@chakra-ui/react";
import ContributionCalendar from "../components/contributionCalendar/ContributionCalendar";
import ActiveRepos from "../components/activeRepos/ActiveRepos";
import LanguagesUsed from "../components/languagesUsed/LanguagesUsed";
import QR from "../components/QR/QR";
import Recent from "../components/Recent/Recent";
import { useSession } from "next-auth/react";
import styles from "../styles/profile.module.css";

const Profile = () => {
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const { data: session, status } = useSession();
  const user = session?.token?.login

  useEffect(() => {
    async function fetchGitHubData() {
      const response = await fetch(
        `https://api.github.com/users/${user}`
      );
      const data = await response.json();
      setUsername(data.login);
      setBio(data.bio);
      setAvatarUrl(data.avatar_url);
    }

    if (status === "authenticated") {
      fetchGitHubData();
    }
  }, [status, session]);

  let loggedIn = true;

  return (
    <>
      {loggedIn ? (
        <div className={styles.row}>
          <div className={styles.menu}></div>
          <div className={styles.main}>
            <div class={styles.profileCard}>
              <Avatar size="2xl" src={avatarUrl} />
              <Box ml="4">
                <Text fontSize="xl" fontWeight="bold">
                  {username}
                </Text>
                <Text fontSize="l">{bio}</Text>
              </Box>
            </div>
            <div className={styles.contribution}>
              <ContributionCalendar />
            </div>
            <Box p="4">
              <ActiveRepos />
            </Box>
            <Box p="4">
              <LanguagesUsed />
            </Box>
          </div>
          <div className={styles.aside}>
            <div className={styles.qr}>
              <QR value={"bitcoinplebdev@stacker.news"} />{" "}
            </div>
            <div className={styles.recent}>
              <Recent />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.error}>
          <h1>Log in to view profile</h1>
        </div>
      )}
    </>
  );
};

export default Profile;
