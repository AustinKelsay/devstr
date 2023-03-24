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
    "ws://18.220.89.39:8006",
  ],
  connected: false,
  url: null,
};

export const nostrSlice = createSlice({
  name: "nostr",
  initialState,
  reducers: {
    relayConnect: (state, action) => {
      state.url = action.payload.url;
      state.connected = true;
      console.log("nostr state after relayConnect:", state);
    },
    relayDisconnect: (state) => {
      state.url = null;
      state.connected = false;
      console.log("nostr state after relayDisconnect:", state);
    },
  },
});

export default nostrSlice.reducer;
