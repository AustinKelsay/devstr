export const checkAndReconnect = (relay) => {
  if (relay.readyState === WebSocket.OPEN) {
    return;
  } else {
    relay.connect();

    return () => {
      relay.close();
    };
  }
};

//   useEffect(() => {
//     checkAndReconnect();
//   }, []);
