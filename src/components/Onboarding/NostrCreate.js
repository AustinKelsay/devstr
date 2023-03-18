import { signEvent, getEventHash } from "nostr-tools";

export const createKind0Event = async (
  publicKey,
  privateKey,
  githubUsername,
  gistId
) => {
  const event = {
    kind: 0,
    pubkey: publicKey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["i", `github:${githubUsername}`, gistId]],
    content: "",
  };

  event.id = getEventHash(event);
  event.sig = signEvent(event, privateKey);

  // Publish the event to the Nostr relay
  const relay = relayInit("wss://relay.example.com");
  await relay.connect();
  const pub = relay.publish(event);
  pub.on("ok", () => {
    console.log(`${relay.url} has accepted our event`);
  });
  pub.on("failed", (reason) => {
    console.log(`failed to publish to ${relay.url}: ${reason}`);
  });

  // Return the event ID
  return event.id;
};
