import { Spinner, Avatar } from '@chakra-ui/react'
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { setUser } from "../../redux/userReducer/userReducer";
import { useDispatch, useSelector } from "react-redux";
import styles from "../profileCard/profile.module.css"
import { relayInit } from "nostr-tools";


const NostrCard = () =>{
    const { data: session, status } = useSession();
    const user = session?.token?.login;
    const [bio, setBio] = useState("");
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    const nostrUser = useSelector((state) => state.users.user);
  
    const dispatch = useDispatch();
  
    useEffect(() => {
      const fetchKind0 = async () => {
        const relay = relayInit("wss://relay.damus.io");
        relay.on("connect", () => {
          console.log(`connected to ${relay.url}`);
        });
        relay.on("error", () => {
          console.log(`failed to connect to ${relay.url}`);
        });
  
        await relay.connect();
  
        const pubkey = await window.nostr.getPublicKey();
  
        let sub = relay.sub([
          {
            kinds: [0],
            authors: [pubkey],
          },
        ]);
  
        console.log("sub", sub);
  
        sub.on("event", (event) => {
          console.log("we got the event we wanted:", event);
  
          const profile = JSON.parse(event.content);
          console.log(profile)
          const parsedProfile = {
            about: profile.about,
            displayName: profile.display_name,
            name: profile.name,
            nip05: profile.nip05,
            picture: profile.picture
          }
          setUsername(parsedProfile.displayName);
          setBio(parsedProfile.about);
          setAvatarUrl(parsedProfile.picture);
          dispatch(setUser(profile));
        });
  
        // For when there are no more events from subscription
        sub.on("eose", () => {
          console.log("no more events");
          sub.unsub();
        });
      };
      fetchKind0();
    }, []);



    return(<div class={styles.profileCard}>
        <Avatar size="2xl" src={avatarUrl} />
          <div className={styles.cardText}>
            <h2 className={styles.name}>{username}</h2>
            <p className={styles.bio}>{bio}</p>
            <div className={styles.more}></div>
          </div>
        </div>
    )
}

export default NostrCard;