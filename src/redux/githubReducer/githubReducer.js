import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  repos: [],
  broadcastableCommits: [],
};

// Put the repos in the redux store and add a broadcasted bool to each repo defaulting to false
// if a repo gets broadcasted, check if it's in the store
// if it's in the store, then flip the broadcasted bool to true
// if it's not in the store, then add it to the store with the broadcasted bool set to true

export const githubSlice = createSlice({
  name: "github",
  initialState,
  reducers: {
    setRepos: (state, action) => {
      state.repos = action.payload;
    },
    setBroadcastableCommits: (state, action) => {
      state.broadcastableCommits = action.payload;
    },
    repoBroadcasted: (state, action) => {
      const repo = action.payload;
      const repoIndex = state.repos.findIndex((r) => r.id === repo.id);
      if (repoIndex >= 0) {
        state.repos[repoIndex].broadcasted = true;
      } else {
        throw new Error("Repo not found in store, refresh the page to fix");
      }
    },
  },
});

export const { setRepos, setBroadcastableCommits, repoBroadcasted } =
  githubSlice.actions;

export default githubSlice.reducer;
