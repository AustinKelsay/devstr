import { getEventHash, relayInit } from "nostr-tools";

export const updateKind0Event = async (githubUsername, gistId, userNpub) => {
  const event = {
    kind: 0,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["i", `github:${githubUsername}`, gistId]],
    content: "",
  };

  // Add the user's public key to the event
  const publicKey = await window.nostr.getPublicKey();
  event.pubkey = publicKey;

  // Sign the event using Alby
  const signedEvent = await window.nostr.signEvent(event);

  // Fetch the list of user relays
  //   const relaysResponse = await axios.get(
  //     `https://www.nostrstuff.com/api/users/${userNpub}/relays`
  //   );

  const relays = [
    "wss://relay.plebstr.com",
    "wss://relay.damus.io",
    "wss://relay.snort.social",
    "wss://nostr-pub.wellorder.net",
    "wss://nostr.oxtr.dev",
    "wss://nostr.pleb.network",
    "wss://nostr.mutinywallet.com",
  ];

  // Publish the signed event to each of the user's relays
  const relayPromises = relays.map((relayUrl) => {
    const relay = relayInit(relayUrl);
    return relay.connect().then(() => {
      const pub = relay.publish(signedEvent);
      pub.on("ok", (e) => {
        console.log(`${relayUrl} has accepted our event`);
      });
      pub.on("failed", (reason) => {
        console.log(`failed to publish to ${relayUrl}: ${reason}`);
      });
      return pub;
    });
  });

  // Wait for all the relay publish promises to resolve
  await Promise.all(relayPromises);

  // Return the event ID
  return signedEvent.id;
};
