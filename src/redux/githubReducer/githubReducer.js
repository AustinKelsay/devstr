import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  repos: [],
  repoEvents: [],
  userRepoEvents: [],
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
      console.log("setRepos", action.payload);
      state.repos = action.payload;
    },
    setRepoEvents: (state, action) => {
      console.log("setRepoEvents", action.payload);
      state.repoEvents = action.payload;
    },
  },
});

export const { setRepos, setRepoEvents } = githubSlice.actions;

export default githubSlice.reducer;
