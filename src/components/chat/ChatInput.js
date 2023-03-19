import React, { useEffect, useState } from "react";
import { Button } from "@chakra-ui/react";
import { getEventHash, relayInit } from "nostr-tools";
import { useSelector } from "react-redux";
import styles from "./chat.module.css";

const ChatInput = () => {
  const [content, setContent] = useState("");
  const [publicKey, setPublicKey] = useState(null);

  useEffect(() => {
    async function getPublicKey() {
      if (typeof window === "undefined") return;
      // If there is no pubkey in the user state
      // Then grab it from the window
      if (!publicKey) {
        const pk = await window.nostr.getPublicKey();

        setPublicKey(pk);
      }
    }

    getPublicKey();
  }, []);

  const handleChange = (event) => {
    setContent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("p", publicKey);

    const eventObject = {
      kind: 6847839,
      pubkey: publicKey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["t", "#devstr"]],
      content,
    };

    eventObject.id = getEventHash(eventObject);

    const signedEvent = await window.nostr.signEvent(eventObject);

    eventObject.sig = signedEvent.sig;

    const relay = relayInit("ws://72.177.66.131:4848");

    await relay.connect();

    try {
      console.log("eventObject", eventObject);
      await relay.publish(eventObject);
      console.log("Event published successfully");
    } catch (err) {
      console.error(`Failed to publish event: ${err}`);
    }

    setContent("");
  };

  return (
    <div className={styles.nostrChat}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={content}
          onChange={handleChange}
          className={styles.nostrInput}
        />
        <Button
          bg="purple.600"
          type="submit"
          className={styles.nostrChatButton}
        >
          Post
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
