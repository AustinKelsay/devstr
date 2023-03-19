import React, { useState, useEffect } from "react";
import { relayInit } from "nostr-tools";
import styles from "./chat.module.css";

const ChatList = () => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(10);

  useEffect(() => {
    const relay = relayInit("ws://72.177.66.131:4848");
    relay.connect();

    // Filter for any events with the #devstr tag
    const sub = relay.sub([
      {
        kinds: [1],
        // tags: [["#devstr"]],
      },
    ]);

    sub.on("event", (event) => {
      setEvents((prevState) => [...prevState, event]);
    });

    return () => {
      sub.unsub();
      relay.close();
    };
  }, []);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.ceil(events.length / eventsPerPage);

  const pageNumbers = [];
  if (currentPage <= 5) {
    for (let i = 1; i <= Math.min(totalPages, 9); i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1, "...");
    for (
      let i = currentPage - 3;
      i <= Math.min(currentPage + 3, totalPages);
      i++
    ) {
      pageNumbers.push(i);
    }
    if (currentPage + 3 < totalPages) {
      pageNumbers.push("...", totalPages);
    } else if (currentPage + 2 === totalPages) {
      pageNumbers.push(totalPages - 1, totalPages);
    } else if (currentPage + 1 === totalPages) {
      pageNumbers.push(totalPages);
    }
  }

  const handleClick = (event) => {
    const pageNumber = Number(event.target.id);
    if (!isNaN(pageNumber)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className={styles.chatList}>
      <ul className={styles.currentEvents}>
        {currentEvents.map((event) => (
          <li className={styles.event} key={event.id}>
            {event.content}
          </li>
        ))}
      </ul>
      <ul className={styles.pageNumbers}>
        {pageNumbers.map((number) => (
          <li
            key={number}
            id={number}
            onClick={handleClick}
            className={currentPage === number ? styles.active : null}
          >
            {isNaN(number) ? number : number.toString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
