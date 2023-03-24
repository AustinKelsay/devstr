import React, { useState } from "react";
import { Button, Badge } from "@chakra-ui/react";
import styles from "../Repo/repos.module.css";

const Commits = ({ repo, isBroadcasted }) => {
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <>
      <h1 className={styles.header}>Commit History</h1>
      <div className={isDisabled ? styles.disabledEvent : styles.event}>
        <div className={styles.eventType}>Commit</div>
        {isBroadcasted && (
          <Badge variant="outline" colorScheme="purple">
            Broadcasted
          </Badge>
        )}
        <div className={styles.eventPayload}>
          Added a new button to test if this works
        </div>
        <div className={styles.details}>
          <span className={styles.updated}>
            Updated on March 23, 2023, 12:20AM
          </span>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            as="a"
            href="?"
            target="_blank"
            rel="noopener noreferrer"
            bg={"purple.600"}
            size={{ base: "xs", md: "md" }}
          >
            visit
          </Button>
          {!isBroadcasted && (
            <Button
              onClick={() => {
                if (repo) handleBroadcast({ repository: repo });
              }}
              size={{ base: "xs", md: "md" }}
              bg={isDisabled ? "grey.500" : "purple.600"}
              disabled={isDisabled}
              isLoading={isDisabled}
            >
              broadcast
            </Button>
          )}
        </div>
        <div></div>
      </div>
    </>
  );
};

export default Commits;
