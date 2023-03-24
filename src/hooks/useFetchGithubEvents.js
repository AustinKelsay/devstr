import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export const useFetchGithubEvents = ({ devstrRelay, kind, pubKey }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("devstrRelay", devstrRelay.status);

  const checkRelayState = async () => {
    try {
      if (devstrRelay.status !== 0) {
        await devstrRelay.connect();
      }
    } catch (error) {
      throw new Error("Failed to connect to relay");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await checkRelayState();

        // Need to fix filter on our relay so we can filter by kind and authors
        const sub = devstrRelay.sub([{ kinds: [kind] }]);

        if (!sub) {
          setLoading(false);
          throw new Error("Failed to create subscription");
        }

        sub.on("event", (event) => {
          console.log("event", event);
          const content = JSON.parse(event.content);
          event.content = content;

          if (event.pubkey === pubKey) {
            setEvents((prevState) =>
              [...prevState, event].sort((a, b) => b.created_at - a.created_at)
            );
          }
          setLoading(false);
        });

        sub.on("eose", () => {
          console.log("no more events");
          setLoading(false);
          sub.unsub();
        });

        const checkAndReconnect = () => {
          if (devstrRelay.readyState === WebSocket.OPEN) {
            return;
          } else {
            devstrRelay.connect();
          }
        };

        checkAndReconnect();

        return () => {
          setLoading(false);
          sub.unsub();
          devstrRelay.close();
        };
      } catch (error) {
        console.error(error.message);
        setLoading(false);
      }
    })();
  }, []);

  return [events, loading];
};
