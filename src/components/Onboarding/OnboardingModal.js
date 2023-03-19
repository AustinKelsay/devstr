import { useEffect, useState } from "react";
import { Button } from "@chakra-ui/react";
import { nip19 } from "nostr-tools";
import { useSession } from "next-auth/react";
import { createVerificationGist } from "@/utils/createVerificationGist";
import { generateNostrKeypair } from "@/utils/generateNostrKeypair";
import { newKind0Event } from "@/utils/newKind0Event";
import { updateKind0Event } from "@/utils/updateKind0Event";
import { useDispatch } from "react-redux";
import { setPubkey } from "@/redux/userReducer/userReducer";
import { useRouter } from "next/router";
import styles from "./onboarding.module.css";

const OnboardingModal = () => {
  const [step, setStep] = useState(1);
  const [keyPair, setKeyPair] = useState(null);
  const [npub, setNpub] = useState(null);
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (keyPair?.pk) {
      const npub = nip19.npubEncode(keyPair.pk);

      setNpub(npub);
    }
  }, [keyPair]);

  const handleSignIn = async () => {
    if (typeof window === "undefined") return;

    if (!window.nostr) {
      alert("Nostr not found");
      return;
    }

    const pk = await window.nostr.getPublicKey();

    dispatch(setPubkey(pk));

    const npub = nip19.npubEncode(pk);

    setNpub(npub);

    setKeyPair({ pk, sk: null });
  };

  const handleKeyGeneration = async () => {
    const { pk, sk } = await generateNostrKeypair();

    setKeyPair({ pk, sk });
  };

  const handleNewSubmit = async () => {
    const token = session.token.accessToken;

    const gistID = await createVerificationGist(token, npub);

    if (!gistID) {
      alert("Could not create gist");
      return;
    }

    alert("Gist created", gistID);

    await newKind0Event(
      keyPair.pk,
      keyPair.sk,
      session.token.login.replace(/\s/g, ""),
      gistID
    );
  };

  const handleUpdateSubmit = async () => {
    const token = session.token.accessToken;

    const gistID = await createVerificationGist(token, npub);

    if (!gistID) {
      alert("Could not create gist");
      return;
    }

    alert("Gist created", gistID);

    await updateKind0Event(
      session.session.user.name.replace(/\s/g, ""),
      gistID,
      keyPair.npub
    );
  };

  // handle the case where the session status is not authenticated
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "error") {
    return <div>Error: Could not authenticate user</div>;
  }

  return (
    <div className={styles.modal}>
      {step === 1 && (
        <div className={styles.modalContent}>
          <h2>Step 1: Do you have a nostr account?</h2>
          <Button bg="purple.600" onClick={() => setStep("login")}>
            Yes
          </Button>
          <Button
            bg="purple.600"
            onClick={async () => {
              await handleKeyGeneration();
              setStep("create");
            }}
          >
            No
          </Button>
        </div>
      )}
      {step === "login" && (
        <div className={styles.modalContent}>
          <h2>Step 2: Login with nostr</h2>
          <Button bg="purple.600" onClick={handleSignIn}>
            Login with Alby / Nos2x
          </Button>
          <Button bg="purple.600" onClick={() => setStep(1)}>
            Back
          </Button>

          <Button
            bg="purple.600"
            disabled={!keyPair || !npub}
            _disabled={{
              bg: "gray.400",
              cursor: "not-allowed",
              color: "gray.700",
              _hover: { bg: "gray.400" },
              _focus: { boxShadow: "none" },
              _active: { bg: "gray.400" },
            }}
            onClick={() => setStep("confirm-connect")}
          >
            Next
          </Button>
        </div>
      )}
      {step === "create" && (
        <div className={styles.modalContent}>
          <h2>Step 2: Choose your username</h2>
          <input type="text" placeholder="username" />
          {keyPair && (
            <div>
              <p>NPUB: {npub}</p>
              <p>NSEC: {keyPair.sk}</p>
            </div>
          )}
          <Button bg="purple.600" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button
            bg="purple.600"
            onClick={() => {
              setStep("confirm-new");
            }}
          >
            Next
          </Button>
        </div>
      )}
      {step === "confirm-connect" && (
        <div className={styles.modalContent}>
          <h2>Step 3: Confirm your information</h2>
          <p>NPUB: {npub}</p>
          <p>GitHub username: {session.token.login.replace(/\s/g, "")}</p>
          <p>
            If you confirm and press submit below we will post a verification
            gist on your behalf which will link this nostr public key to your
            Github profile
          </p>
          <Button bg="purple.600" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button bg="purple.600" onClick={handleUpdateSubmit}>
            Submit
          </Button>
        </div>
      )}
      {step === "confirm-new" && (
        <div className={styles.modalContent}>
          <h2>Step 3: Confirm your information</h2>
          <p>NPUB: {npub}</p>
          <p>GitHub username: {session.session.user.name.replace(/\s/g, "")}</p>
          <p>
            If you confirm and press submit below we will post a verification
            gist on your behalf which will link this newly created nostr public
            key to your Github profile
          </p>
          <Button bg="purple.600" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button bg="purple.600" onClick={handleNewSubmit}>
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

export default OnboardingModal;
