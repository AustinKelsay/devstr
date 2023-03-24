import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "./recent.module.css";
import moment from "moment"

const Recent = () => {
  const [events, setEvents] = useState([]);
  const { data: session, status } = useSession();
  const user = session?.token?.login;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/users/${user}/events`,
          {
            headers: {
              Authorization: `token ${session.token.accessToken}`,
            },
          }
        );
        const data = await response.json();
        setEvents(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    if (status === "authenticated") {
      fetchEvents();
    }
  }, [status]);

  const formatTimestamp = (timestamp) => {
    const date = moment.utc(timestamp);
    return date.format('MMM Do YYYY, h:mm:ss a');
  };
  
  const split = (str) =>{
    return str.split(/(?=[A-Z])/).join(" ")
  }
  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Recent GitHub Activity</h2>
        <div className={styles.eventList}>
          {events.map((event) => (
            <div className={styles.card} key={event.id}>
              <div className={styles.eventHeader}><p>{split(event.type)}</p><p>{formatTimestamp(event.created_at)}</p></div>
                  <div className={styles.cardBody}>
                    {event.type === "PushEvent" && (
                      <div>
                        <div>
                          Repository:{" "}
                          <a
                            href={event.repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {event.repo.name}
                          </a>
                        </div>
                        <div>
                          Author: {event.payload.commits[0].author.name} (
                          {event.payload.commits[0].author.email})
                        </div>
                        <div>Message: {event.payload.commits[0].message}</div>
                      </div>
                    )}
                    {event.type === "PullRequestEvent" && (
                      <div>
                        <div>
                          Pull Request:{" "}
                          <a
                            href={event.payload.pull_request.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {event.payload.pull_request.title}
                          </a>
                        </div>
                        <div>
                          Repository:{" "}
                          <a
                            href={event.repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {event.repo.name}
                          </a>
                        </div>
                      </div>
                    )}
                    {event.type === "CreateEvent" && (
                      <div>
                        <div>
                          {event.payload.ref_type}: {event.payload.ref}
                        </div>
                        <div>
                          Repository:{" "}
                          <a
                            href={event.repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {event.repo.name}
                          </a>
                        </div>
                      </div>
                    )}
                    {event.type !== "PushEvent" && event.type !== "PullRequestEvent" && event.type !== "CreateEvent" && (
                      <div>Event payload: {JSON.stringify(event.payload)}</div>
                    )}
                  </div>
            </div>
          ))}
        </div>
      </div>
  );
};

export default Recent;
