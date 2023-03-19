import React, { useState } from "react";
import { Button } from "@chakra-ui/react";
import {
  generatePrivateKey,
  getPublicKey,
  signEvent,
  getEventHash,
  validateEvent,
  relayInit,
} from "nostr-tools";
import styles from "./chat.module.css";

const ChatInput = () => {
  const [content, setContent] = useState("");

  const handleChange = (event) => {
    setContent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const privateKey = await generatePrivateKey();
    const publicKey = await getPublicKey(privateKey);

    const eventObject = {
      kind: 1,
      pubkey: publicKey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["#devstr"]],
      content,
    };

    eventObject.id = getEventHash(eventObject);
    eventObject.sig = signEvent(eventObject, privateKey);

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
