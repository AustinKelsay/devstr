import { generatePrivateKey, getPublicKey, nip19 } from "nostr-tools";

export async function generateNostrKeypair() {
  let sk = generatePrivateKey(); // `sk` is a hex string
  let pk = getPublicKey(sk); // `pk` is a hex string

  return { pk, sk };
}
