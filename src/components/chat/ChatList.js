import React, { useState, useEffect } from "react";
import { relayInit } from "nostr-tools";
import styles from "./chat.module.css";
import { Spinner } from '@chakra-ui/react'

const ChatList = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const relay = relayInit("wss://relay.snort.social/");
  const sub = relay.sub([{ kinds: [6847839] }]);

  const checkAndReconnect = () => {
    if (relay.readyState === WebSocket.OPEN) {
      return;
    } else {
      relay.connect();

      sub.on("event", (event) => {
        console.log("event", event);
        setEvents((prevState) => [...prevState, event]);
      });

      relay.on("error", (err) => {
        console.error(`Relay err: ${err}`);
      });

      return () => {
        sub.unsub();
        relay.close();
      };
    }
  };

  useEffect(() => {
    checkAndReconnect();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      setIsLoading(false);
    }
  }, [events]);

  useEffect(() => {
    setEvents((prevState) =>
      [...prevState].sort((a, b) => b.created_at - a.created_at)
    );
  }, []); // only run once when the component mounts

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div
      className={styles.chatList}
      style={{ overflowY: "scroll", height: "800px" }}
    >
      {isLoading ? (
        <div className={styles.error}>
          <div className={styles.loading}>
          <Spinner color='purple.500' />
          </div>
        </div>
      ) : (
        <ul className={styles.currentEvents}>
          {events.map((event) => (
            <li className={styles.event} key={event.id}>
              <div className={styles.eventContent}>
                <p>{event.content}</p>
                <span>{formatTimestamp(event.created_at)}</span>
                <div className={styles.eventHeader}>
                  <span>pubkey: {event.pubkey}</span>
                </div>
                <ul className={styles.eventTags}>
                  {event.tags.map((tag) => (
                    <li style={{ listStyle: "none" }} key={tag[1]}>
                      [{tag[0]}: {tag[1]}]
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatList;
