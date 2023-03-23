import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import userReducer from "./userReducer/userReducer";
import nostrReducer from "./nostrReducer/nostrReducer";
import githubReducer from "./githubReducer/githubReducer";

export const store = configureStore({
  reducer: {
    users: userReducer,
    nostr: nostrReducer,
    github: githubReducer,
  },
  middleware: [thunk],
});
