import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@chakra-ui/react";
import { getEventHash, relayInit } from "nostr-tools";
import { Octokit } from "@octokit/core";
import { useFetchGithubEvents } from "@/hooks/useFetchGithubEvents";
import useRelayInstance from "../../hooks/useRelayInstance";
import { useSelector } from "react-redux";

const Branches = ({ owner, repoName }) => {
  const [branches, setBranches] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const { data: session, status } = useSession();

  const accessToken = session?.token?.accessToken;

  const pubKey = useSelector((state) => state.users.user.pubkey);

  const devstrRelay = useRelayInstance();

  const [events, loading] = useFetchGithubEvents({
    devstrRelay: devstrRelay,
    kind: 338,
    pubKey: pubKey,
  });

  console.log("events in branches babyyyyyyy", events);

  const octokit = new Octokit({
    auth: accessToken,
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await octokit.request(
          `GET /repos/${owner}/${repoName}/branches`
        );

        const data = response.data;
        setBranches(data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  const broadcastBranch = async (branch) => {
    setIsDisabled(true);

    try {
      if (devstrRelay.readyState !== WebSocket.OPEN) {
        await devstrRelay.connect();
      }

      const branchObj = {
        name: branch.name,
        sha: branch.commit.sha,
        url: branch.commit.url,
      };

      if (!pubKey) {
        return;
      }

      const branchEvent = {
        kind: 338,
        pubkey: pubKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify({
          branch: branchObj,
          type: "branch",
        }),
      };

      branchEvent.id = getEventHash(branchEvent);

      const signedEvent = await window.nostr.signEvent(branchEvent);

      branchEvent.sig = signedEvent.sig;

      let pub = await devstrRelay.publish(branchEvent);
      pub.on("ok", () => {
        console.log("Event published successfully");
      });
      pub.on("failed", (err) => {
        console.log("Failed to publish event:", err);
      });
    } catch (err) {
      console.error(`Failed to publish event: ${err}`);
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    !loading && (
      <div>
        {branches.map((branch) => {
          console.log("THIS IS IT!!!", events[0]);
          const isBroadcasted = events.some(
            (event) => event.content.branch?.sha === branch.commit.sha
          );

          return (
            <div key={branch.name}>
              <h3>{branch.name}</h3>
              <p>{branch.commit.sha}</p>
              <Button
                onClick={() => {
                  if (branch) broadcastBranch(branch);
                }}
                isDisabled={isDisabled || isBroadcasted}
                bg={isBroadcasted ? "gray.500" : "purple.600"}
              >
                {isBroadcasted ? "Broadcasted" : "Broadcast"}
              </Button>
            </div>
          );
        })}
      </div>
    )
  );
};

export default Branches;
