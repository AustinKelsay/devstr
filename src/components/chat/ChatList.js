import React, { useState, useEffect } from "react";
import Link from "next/link";
import { relayInit } from "nostr-tools";
import styles from "./chat.module.css";
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Avatar,
  Heading,
  Flex,
  Box,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
// import ReadChatEvents from "@/utils/readChatEvents";

const ChatList = () => {
  const [events, setEvents] = useState([]);
  const [repoEvents, setRepoEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrls, setAvatarUrls] = useState({});

  const relay = relayInit("ws://18.220.89.39:8006/");

  const sub = relay.sub([{ kinds: [339] }]);

  const checkAndReconnect = () => {
    if (relay.readyState === WebSocket.OPEN) {
      return;
    } else {
      relay.connect();

      sub.on("event", (event) => {
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
          tag: event.tags[0],
        };
        return {
          id: event.id,
          repoName: parsedData.repo.name,
          repoOwner: parsedData.repo.owner,
          repoUrl: parsedData.repo.url,
          type: parsedData.type,
          pubkey: parsedKeys.pubkey,
          created_at: parsedKeys.createdAt,
          tag: parsedKeys.tag,
        };
      });
      setIsLoading(false);
      setRepoEvents(parsedEvents);
    }
  }, [events]);

  useEffect(() => {
    setEvents((prevState) =>
      [...prevState].sort((a, b) => b.created_at - a.created_at)
    );
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = moment(timestamp * 1000);
    return date.format("MMM Do YYYY, h:mm a");
  };

  return (
    <div
      className={styles.chatList}
      style={{ overflowY: "scroll", height: "800px" }}
    >
      {isLoading ? (
        <div className={styles.error}>
          <div className={styles.loading}>
            <Spinner color="purple.500" />
          </div>
        </div>
      ) : (
        <div className={styles.currentEvents}>
          {repoEvents.map((event) => (
            <div>
              <Card
                className={styles.event}
                key={event.id}
                my={2}
                boxShadow="dark-lg"
                maxW="md"
                backgroundColor="#242424"
                color="#8affd4;"
              >
                <CardHeader>
                  <Flex spacing="4">
                    <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                      <Avatar
                        name={event.repoOwner}
                        src={avatarUrls[event.repoOwner]}
                      />
                      <Box>
                        <Heading size="sm">
                          <Link href={event.repoOwner}>{event.repoOwner}</Link>
                        </Heading>
                        <Text>
                          <Link href={event.repoUrl}>{event.repoName}</Link>
                        </Text>
                      </Box>
                    </Flex>
                    <p>{formatTimestamp(event.created_at)}</p>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Text>
                    <br />
                    <p>Event ID: {event.id}</p>
                    <br />
                    <p>Pubkey: {event.pubkey}</p>
                  </Text>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
