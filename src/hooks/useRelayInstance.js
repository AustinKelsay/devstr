// hooks/useRelayInstance.js
import { useSelector } from "react-redux";
import {
  websocketMiddleware,
  relayMap,
} from "@/redux/middleware/websocketMiddleware";

const useRelayInstance = () => {
  const [url, relay] = Array.from(relayMap)[0];

  return relay;
};

export default useRelayInstance;
