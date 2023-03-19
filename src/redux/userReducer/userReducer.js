import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pubkey: null,
};

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setPubkey: (state, action) => {
      state.pubkey = action.payload;
    },
  },
});

export const { setPubkey } = userSlice.actions;

export default userSlice.reducer;
