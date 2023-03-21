import { useState, useEffect } from "react";
import { Avatar, Text, Flex, Box } from "@chakra-ui/react";
import ContributionCalendar from "../components/contributionCalendar/ContributionCalendar";
import ActiveRepos from "../components/activeRepos/ActiveRepos";
import LanguagesUsed from "../components/languagesUsed/LanguagesUsed";
import QR from "../components/QR/QR";
import Recent from "../components/Recent/Recent";
import ProfileCard from "../components/profileCard/ProfileCard"
import { useSession } from "next-auth/react";
import styles from "../styles/profile.module.css"


const Profile = () => {
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const { data: session, status } = useSession();
  const user = session?.token?.login;

  useEffect(() => {
    async function fetchGitHubData() {
      const response = await fetch(`https://api.github.com/users/${user}`);
      const data = await response.json();
      setUsername(data.login);
      setBio(data.bio);
      setAvatarUrl(data.avatar_url);
    }

    if (status === "authenticated") {
      fetchGitHubData();
    }
  }, [status, session]);

  return (
    <>

      {status === "authenticated" ? (
        <div className={styles.gridContainer}>
{/* --------------------left side of page-------------------- */}
        <div className={styles.left}>
          <ProfileCard/>
          <ContributionCalendar />
          <LanguagesUsed />
        </div>
{/* --------------------center of page-------------------- */}
        <div className={styles.center}>

        <ActiveRepos />
        <QR value={"bitcoinplebdev@stackernews.com"} />
        </div>
{/* --------------------right side of page-------------------- */}
        <div className={styles.right}>
        <Recent />    
        </div>
    </div>
      ) : (
        <div className={styles.error}>
          <div className={styles.login}>
            <h1>You are not logged in. Login to view your profile</h1>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
