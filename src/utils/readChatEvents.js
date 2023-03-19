import React, { useState, useEffect } from "react";
import { relayInit } from "nostr-tools";

const ReadChatEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const relay = relayInit("wss://relay.snort.social");
    relay.connect();

    const sub = relay.sub([{ kinds: [1] }]);

    sub.on("event", (event) => {
      setEvents((prevState) => [...prevState, event]);
    });

    return () => {
      sub.unsub();
      relay.close();
    };
  }, []);

  return (
    <div>
      <h2>Kind 1 Events:</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>{event.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default ReadChatEvents;
