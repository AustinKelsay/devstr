import React, { useState } from "react";
import {
  generatePrivateKey,
  getPublicKey,
  signEvent,
  getEventHash,
  validateEvent,
  relayInit,
} from "nostr-tools";

const NostrChat = () => {
  const [content, setContent] = useState("");

  const handleChange = (event) => {
    setContent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const privateKey = await generatePrivateKey();
    const publicKey = await getPublicKey(privateKey);

    const eventObject = {
      kind: 6847839,
      pubkey: publicKey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content,
    };

    eventObject.id = getEventHash(eventObject);
    eventObject.sig = signEvent(eventObject, privateKey);

    const relay = relayInit("wss://relay.plebstr.com");

    await relay.connect();

    try {
      await relay.publish(eventObject);
      console.log("Event published successfully");
    } catch (err) {
      console.error(`Failed to publish event: ${err}`);
    }

    setContent("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Content:
        <input type="text" value={content} onChange={handleChange} />
      </label>
      <button type="submit">Post</button>
    </form>
  );
};

export default NostrChat;
