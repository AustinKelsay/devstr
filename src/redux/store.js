import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import userReducer from "./userReducer/userReducer";

export const store = configureStore({
  reducer: {
    users: userReducer,
  },
  middleware: [thunk],
});
