import { useState, useEffect } from "react";
import { relayInit } from "nostr-tools";

export const useFetchRepoEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const relay = relayInit("ws://18.220.89.39:8006/");

  // Need to fix filter on our relay so we can filter by kind and authors
  const sub = relay.sub([{ kinds: [339] }]);

  const checkAndReconnect = () => {
    relay.connect();

    sub.on("event", (event) => {
      const parsedEvent = JSON.parse(event.content);
      console.log("parsedEvent", parsedEvent);
      setEvents((prevState) => [...prevState, parsedEvent]);
      setLoading(false);
    });

    relay.on("error", (err) => {
      console.error(`Relay err: ${err}`);
      setLoading(false);
    });

    return () => {
      sub.unsub();
      relay.close();
    };
  };

  useEffect(() => {
    checkAndReconnect();
  }, []);

  useEffect(() => {
    setEvents((prevState) =>
      [...prevState].sort((a, b) => b.created_at - a.created_at)
    );
  }, []);

  return [events, loading];
};
