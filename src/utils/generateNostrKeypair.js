import { generatePrivateKey, getPublicKey, nip19 } from "nostr-tools";

export async function generateNostrKeypair() {
  let sk = generatePrivateKey(); // `sk` is a hex string
  let pk = getPublicKey(sk); // `pk` is a hex string

  const npub = nip19.npubEncode(pk);

  const nsec = nip19.nsecEncode(sk);

  return { npub, nsec };
}
