import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  npub: null,
};

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setNpub: (state, action) => {
      state.npub = action.payload;
    },
  },
});

export const { setNpub } = userSlice.actions;

export default userSlice.reducer;
