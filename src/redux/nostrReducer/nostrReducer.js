import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  relays: [
    "wss://relay.plebstr.com",
    "wss://relay.damus.io",
    "wss://relay.snort.social",
    "wss://nostr-pub.wellorder.net",
    "wss://nostr.oxtr.dev",
    "wss://nostr.pleb.network",
    "wss://nostr.mutinywallet.com",
  ],
};

export const nostrSlice = createSlice({
  name: "nostr",
  initialState,
  reducers: {},
});

export default nostrSlice.reducer;
