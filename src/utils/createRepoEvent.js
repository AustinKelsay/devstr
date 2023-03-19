import React, { useState } from "react";
import {
  generatePrivateKey,
  getPublicKey,
  signEvent,
  getEventHash,
  validateEvent,
  relayInit,
} from "nostr-tools";

export const createRepoEvent = async ({ pubkey, repo }) => {
  const eventObject = {
    kind: 1,
    pubkey: pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["#devstr"]],
    // stringify content

    content: JSON.stringify({
      repo: repo,
      type: "repo",
    }),
  };

  console.log("eventObject", eventObject);

  eventObject.id = getEventHash(eventObject);
  const signedEvent = await window.nostr.signEvent(eventObject);

  eventObject.sig = signedEvent.sig;

  const relay = relayInit("wss://relay.plebstr.com");

  await relay.connect();

  try {
    console.log("eventObject", eventObject);
    await relay.publish(eventObject);
    console.log("Event published successfully");
  } catch (err) {
    console.error(`Failed to publish event: ${err}`);
  }
};
