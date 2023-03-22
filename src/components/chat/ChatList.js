import React, { useState, useEffect } from "react";
import Link from "next/link";
import { relayInit } from "nostr-tools";
import styles from "./chat.module.css";
import { Spinner, Avatar} from '@chakra-ui/react'
import moment from 'moment';
import ReadChatEvents from "@/utils/readChatEvents";


const ChatList = () => {
  const [events, setEvents] = useState([]);
  const [repoEvents, setRepoEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const relay = relayInit("wss://relay.snort.social/");
  const sub = relay.sub([{ kinds: [6847839] }]);
  const [avatarUrls, setAvatarUrls] = useState({});

  const checkAndReconnect = () => {
    if (relay.readyState === WebSocket.OPEN) {
      return;
    } else {
      relay.connect();

      sub.on("event", (event) => {
        // console.log("event", event);
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
  const fetchAvatar = async (name) => {
    const url = `https://api.github.com/users/${name}`;
    const response = await fetch(url);
    const data = await response.json();
    setAvatarUrls((prevState) => ({
      ...prevState,
      [name]: data.avatar_url,
    }));
  };

  repoEvents.forEach((event) => {
    const { repoOwner } = event;
    if (!avatarUrls[repoOwner]) {
      fetchAvatar(repoOwner);
    }
  });
}, [repoEvents, avatarUrls]);

  useEffect(() => {
    if (events.length > 0) {
      const parsedEvents = events.map((event) => {
        const parsedData = JSON.parse(event.content);
        const parsedKeys = {
          pubkey: event.pubkey,
          createdAt: event.created_at,
          tag: event.tags[0]
        }
        return {
          id: event.id,
          repoName: parsedData.repo.name,
          repoOwner: parsedData.repo.owner,
          repoUrl: parsedData.repo.url,
          type: parsedData.type,
          pubkey: parsedKeys.pubkey,
          created_at: parsedKeys.createdAt,
          tag: parsedKeys.tag
        };

      });
      setIsLoading(false);
      setRepoEvents(parsedEvents)
    
    }
  }, [events]);

  useEffect(() => {
    setEvents((prevState) =>
      [...prevState].sort((a, b) => b.created_at - a.created_at)
    );
  }, []); // only run once when the component mounts

  const formatTimestamp = (timestamp) => {
    const date = moment(timestamp * 1000);
    return date.format('MMM Do YYYY, h:mm:ss a');
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
        <div className={styles.currentEvents}>
          {repoEvents.map((event) => (
            <div className={styles.event} key={event.id}>
              <span className={styles.createdAt}>{formatTimestamp(event.created_at)}</span>
              <div className={styles.eventContent}>
              <Avatar size="2xl" src={avatarUrls[event.repoOwner]} />
                  <div className={styles.eventPayload}>
                  <p>Repo Name: {event.repoName}</p>
                  <p><Link href={event.repoOwner}>Repo Owner: {event.repoOwner}</Link></p>
                  <p><Link href={event.repoUrl}>URL: {event.repoUrl}</Link></p>
                  <p>Event ID: {event.id}</p>
                  <p>Pubkey: {event.pubkey}</p>
                  <p>Tags: {event.tag}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
