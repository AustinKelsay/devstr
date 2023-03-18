import styles from "./chat.module.css"
import React, { useState } from "react";

function ChatLayout() {
  const [messages, setMessages] = useState([]);

  function handleSubmit(event) {
    event.preventDefault();
    const message = event.target.elements.message.value;
    setMessages([...messages, { text: message, sender: "user" }]);
    event.target.reset();
  }

  return (
    <div className={styles.chatInterface}>
      <div className={styles.messageList}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={styles.message}
            
            // {`message ${message.sender === "user" ? "sent" : "received"}`}
          >
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input className={styles.input} type="text" name="message" placeholder="Type a message" />
        <button className={styles.submitBtn} type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatLayout;
