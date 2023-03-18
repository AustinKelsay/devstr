import React, { useState, useEffect } from "react";
import { setNpub } from "@/redux/userReducer/userReducer";
import { useDispatch } from "react-redux";

const NostrLogin = () => {
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    if (typeof window === "undefined") return;

    if (!window.nostr) {
      alert("Nostr not found");
      return;
    }

    const npub = await window.nostr.getPublicKey();

    dispatch(setNpub(npub));
  };

  return (
    <div>
      <button onClick={handleSignIn}>Login with Alby / Nos2x</button>
    </div>
  );
};

export default NostrLogin;
