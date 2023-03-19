import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "./recent.module.css";

const Recent = () => {
  const [events, setEvents] = useState([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/users/AustinKelsay/events",
          {
            headers: {
              Authorization: `token ${session.token.accessToken}`,
            },
          }
        );
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    if (status === "authenticated") {
      fetchEvents();
    }
  }, [status]);

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Recent GitHub Activity</h2>
      <div className={styles.eventListContainer}>
        <div className={styles.eventList}>
          {events.map((event) => (
            <div className={styles.event} key={event.id}>
              <div className={styles.eventType}>{event.type}</div>
              <div className={styles.eventPayload}>
                {JSON.stringify(event.payload)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recent;
