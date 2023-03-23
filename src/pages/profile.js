import ContributionCalendar from "../components/contributionCalendar/ContributionCalendar";
import ActiveRepos from "../components/activeRepos/ActiveRepos";
import LanguagesUsed from "../components/languagesUsed/LanguagesUsed";
import QR from "../components/QR/QR";
import Recent from "../components/Recent/Recent";
import ProfileCard from "../components/profileCard/ProfileCard"
import { useSession } from "next-auth/react";
import { useState } from "react"
import { Button } from "@chakra-ui/react"
import styles from "../styles/profile.module.css"


const Profile = () => {

  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false)

  const handleDoubleClick = () => {
    setIsVisible(prev => !prev);
  };

  const user = session?.token?.login;


  return (
    <>
      {status === "authenticated" ? (
        <div className={styles.gridContainer}>
          {/* --------------------left side of page-------------------- */}
          {/* <div className={styles.left}>
          </div> */}
          {/* --------------------center of page-------------------- */}
          <div className={styles.center}>
            <ProfileCard/>
            <button className={styles.qrButton} onClick={handleDoubleClick}>
              {isVisible ? "Hide QR" : "Display QR"}
            </button>
            {isVisible ? (<QR value={"bitcoinplebdev@stacker.news"} />) : null}
            <ContributionCalendar />
            <ActiveRepos />
          </div>
          {/* --------------------right side of page-------------------- */}
          <div className={styles.right}>
            <div className={styles.qr}>
              <QR value={"bitcoinplebdev@stacker.news"} />
            </div>
            <Recent />
            <LanguagesUsed />
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