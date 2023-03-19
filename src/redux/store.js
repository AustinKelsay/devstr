import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import userReducer from "./userReducer/userReducer";
import nostrReducer from "./nostrReducer/nostrReducer";

export const store = configureStore({
  reducer: {
    users: userReducer,
    nostr: nostrReducer,
  },
  middleware: [thunk],
});
