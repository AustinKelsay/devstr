import React, { useState } from "react";
import {
  generatePrivateKey,
  getPublicKey,
  signEvent,
  getEventHash,
  validateEvent,
  relayInit,
} from "nostr-tools";

export const createRepoEvent = async ({ pubkey, repo, relays }) => {
  console.log("createRepoEvent", pubkey);
  const eventObject = {
    kind: 6847839,
    pubkey: pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["t", "devstr"]],
    content: JSON.stringify({
      repo: repo,
      type: "repo",
    }),
  };

  console.log("eventObject", relays);

  console.log("eventObject", eventObject);

  eventObject.id = getEventHash(eventObject);
  const signedEvent = await window.nostr.signEvent(eventObject);

  eventObject.sig = signedEvent.sig;

  for (let i = 0; i < relays.length; i++) {
    const relay = relayInit(relays[i]);
    await relay.connect();

    try {
      console.log(`Publishing event to relay ${relays[i]}`);
      console.log("eventObject", eventObject);
      await relay.publish(eventObject);
      console.log("Event published successfully");
    } catch (err) {
      console.error(`Failed to publish event to relay ${relays[i]}: ${err}`);
    }

    relay.close();
  }
  return;
};
