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

const Profile = () => {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  const handleDoubleClick = () => {
    setIsVisible((prev) => !prev);
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
      {status === "authenticated" ? (
        <div className={styles.gridContainer}>
          {/* --------------------left side of page-------------------- */}
          {/* <div className={styles.left}>
          </div> */}
          {/* --------------------center of page-------------------- */}
          <div className={styles.center}>
            <ProfileCard />
            <button className={styles.qrButton} onClick={handleDoubleClick}>
              {isVisible ? "Hide QR" : "Display QR"}
            </button>
            {isVisible ? <QR value={"bitcoinplebdev@stacker.news"} /> : null}
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
