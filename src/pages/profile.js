import React, { useEffect, useState } from "react";
import ContributionCalendar from "../components/contributionCalendar/ContributionCalendar";
import ActiveRepos from "../components/repos/repos";
import LanguagesUsed from "../components/languagesUsed/LanguagesUsed";
import QR from "../components/QR/QR";
import Recent from "../components/Recent/Recent";
import ProfileCard from "../components/profileCard/ProfileCard";
import { useSession } from "next-auth/react";
import { setUser } from "../redux/userReducer/userReducer";
import { useDispatch, useSelector } from "react-redux";
import styles from "../styles/profile.module.css";
import { relayInit } from "nostr-tools";
import NostrCard from "../components/nostrCard/nostrCard";
import { Switch, FormControl, FormLabel, Text} from '@chakra-ui/react'

const Profile = () => {
  const { data: session, status } = useSession();
  const [profileCard, setProfileCard] = useState(true)
  const [qr, setQr] = useState('')

  const handleProfileChange = () => {
    setProfileCard((prev) => !prev);
  };

  const user = session?.token?.login;

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
        const parsedProfile = {
          about: profile.about,
          displayName: profile.display_name,
          name: profile.name,
          nip05: profile.nip05,
          picture: profile.picture,
          lnAddress: profile.lud16
        }
        setQr(parsedProfile.lnAddress)
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

  return (
    <>
      {status === "authenticated" ? (<div>
                              <div className={styles.switch}>
                              <FormControl display='flex' alignItems='center'>
                                  <FormLabel htmlFor='email-alerts' mb='0'>
                                 {profileCard ? (<Text color="white">Github</Text>) : (<Text color="purple.600">Nostr</Text>)}
                                  </FormLabel>
                                  <Switch colorScheme='purple.600' onChange={handleProfileChange}/>
                                </FormControl>
                                </div>
        <div className={styles.gridContainer}>
          {/* --------------------left side of page-------------------- */}
          <div className={styles.center}>

            {profileCard ? (<ProfileCard />) : (<NostrCard />)}
            <ContributionCalendar />
            <ActiveRepos />
            {/* <NostrCard /> */}
          </div>
          {/* --------------------right side of page-------------------- */}
          <div className={styles.right}>
            <div className={styles.qr}>
              <QR value={qr} />
            </div>
            <Recent />
            <LanguagesUsed />
          </div>
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
