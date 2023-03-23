import { Spinner, Avatar } from '@chakra-ui/react'
import { useState, useEffect } from "react";
import styles from "./profile.module.css"
import { useSession } from "next-auth/react";

 
 function ProfileCard() {
    const { data: session, status } = useSession();
    const user = session?.token?.login
    const [loading, setLoading] = useState(true);
    const [bio, setBio] = useState("");
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
  
  
    useEffect(() => {
      async function fetchGitHubData() {
        const url = `https://api.github.com/users/${user}`
        const response = await fetch(url);
        const data = await response.json();
        setUsername(data.login);
        setBio(data.bio);
        setAvatarUrl(data.avatar_url);
        setLoading(false)
      }
  
      fetchGitHubData();
  
    }, [])

    return loading ? (<Spinner color='gray.50' />):
        (<div class={styles.profileCard}>
        <Avatar size="2xl" src={avatarUrl} />
          <div className={styles.cardText}>
            <h2 className={styles.name}>{username}</h2>
            <p className={styles.bio}>{bio}</p>
            <div className={styles.more}></div>
          </div>
        </div>
    )
}

export default ProfileCard