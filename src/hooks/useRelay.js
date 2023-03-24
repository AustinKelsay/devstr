import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useRelay = (url) => {
  const dispatch = useDispatch();
  const connected = useSelector((state) => state.nostr.connected);

  useEffect(() => {
    if (!connected) {
      dispatch({ type: "WEBSOCKET_CONNECT", payload: { url } });
    }

    return () => {
      dispatch({ type: "WEBSOCKET_DISCONNECT" });
    };
  }, [connected, dispatch, url]);

  return connected;
};

export default useRelay;
