import { Avatar, Text, Flex, Box } from "@chakra-ui/react";
import ContributionCalendar from "../components/contributionCalendar/ContributionCalendar"
// import PinnedRepos from "../src/components/pinnedRepos/PinnedRepos";
import LanguagesUsed from "../components/languagesUsed/LanguagesUsed";
// import QR from "../src/components/QR/QR"
import Recent from "../components/Recent/Recent"
import styles from "../styles/profile.module.css"
import {useState} from "react"

const Profile = () => {

    const [bio, setBio] = useState('bio');

    function addBio() {
      const bioContent = prompt('add your bio: ');
      setBio(bioContent);
    }
    let loggedIn = true

    return (
        <>
        {loggedIn? (
            <div className={styles.row}>
            <div className={styles.menu}></div>
            <div className={styles.main}>
                <div class={styles.profileCard}>
                    <Avatar size="2xl" />
                    <Box ml="4">
                        <Text fontSize='xl' fontWeight="bold">username</Text>
                        <Text fontSize='sm'>date joined</Text>
                        <Text fontSize='l'>{bio}</Text>
                        <button onClick={addBio}>+</button>
                    </Box>
                </div>
                <div className={styles.contribution}>
                    <ContributionCalendar />
                </div>
                <Box p="4">
                    {/* <PinnedRepos /> */}
                </Box>
                <Box p="4">
                    <LanguagesUsed />
                </Box>
            </div>
            <div className={styles.aside}>
                <div className={styles.qr}>
                    {/* <QR /> */}
                </div>
                <div className={styles.recent}>
                    <Recent />
                </div>
            </div>
        </div>
        ):

        (
            <div className={styles.error}>
                <h1>Log in to view profile</h1>
            </div>
        )}
</>
    )
}

export default Profile;