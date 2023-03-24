import ChatInput from "@/components/chat/ChatInput";
import ChatList from "@/components/chat/ChatList";
import styles from "../styles/chat.module.css"
import Head from "next/head";


const Chat = () => {
  return (
    <div className={styles.page}>
      <ChatList />
      <ChatInput />
    </div>
  );
};

export default Chat;
