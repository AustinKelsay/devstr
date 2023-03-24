import { relayInit } from "nostr-tools";

const relayMap = new Map();

export default function websocketMiddleware(store) {
  return function (next) {
    return function (action) {
      switch (action.type) {
        case "WEBSOCKET_CONNECT":
          const relay = relayInit(action.payload.url);
          relayMap.set(action.payload.url, relay);

          relay.on("connect", () => {
            console.log("WebSocket connected");
            store.dispatch({
              type: "RELAY_CONNECT",
              payload: { url: action.payload.url },
            });
          });

          relay.on("error", () => {
            store.dispatch({ type: "RELAY_DISCONNECT" });
          });

          relay.connect();
          break;
        case "WEBSOCKET_DISCONNECT":
          if (store.getState().nostr.connected) {
            const relayToClose = relayMap.get(store.getState().nostr.url);
            if (relayToClose) {
              relayToClose.close();
              store.dispatch({ type: "RELAY_DISCONNECT" });
            }
          }
          break;
        case "WEBSOCKET_SEND":
          // Send message through WebSocket here
          break;
        default:
          break;
      }

      return next(action);
    };
  };
}

export { relayMap };
