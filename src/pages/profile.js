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
import { relayInit, SimplePool } from "nostr-tools";

const Profile = () => {
  const { data: session, status } = useSession();
  // const [profileCard, setProfileCard] = useState(true)
  const [qr, setQr] = useState("");

  // const handleProfileChange = () => {
  //   setProfileCard((prev) => !prev);
  // };

  const relays = useSelector((state) => state.nostr.relays);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchKind0 = async () => {
      const pubkey = await window.nostr.getPublicKey();

      const pool = new SimplePool();

      // Subscriptions not working with kinds and authors?
      let sub = pool.sub(relays, [
        {
          // kinds: [0],
          authors: [pubkey],
        },
      ]);

      sub.on("event", (event) => {
        // Parse out the first kind 0 event and set it as the user
        if (event.kind !== 0) {
          return;
        }

        console.log("event made it", event);

        if (!event.content) {
          dispatch(setUser(event));
        } else {
          const parsedContent = JSON.parse(event.content);
          event.content = parsedContent;
          setQr(event.content.lud16);
          dispatch(setUser(event));
        }
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
      {status === "authenticated" ? (
        <div className={styles.gridContainer}>
          {/* --------------------left side of page-------------------- */}
          <div className={styles.center}>
            <ProfileCard />
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
