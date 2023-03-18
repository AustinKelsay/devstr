import { useState } from "react";
import { nip19 } from "nostr-tools";
import { useSession } from "next-auth/react";
import { createVerificationGist } from "@/utils/createVerificationGist";
import { generateNostrKeypair } from "@/utils/generateNostrKeypair";
import { newKind0Event } from "@/utils/newKind0Event";
import { updateKind0Event } from "@/utils/updateKind0Event";

const OnboardingModal = () => {
  const [step, setStep] = useState(1);
  const [keyPair, setKeyPair] = useState(null);
  const { data: session, status } = useSession();

  const handleSignIn = async () => {
    if (typeof window === "undefined") return;

    if (!window.nostr) {
      alert("Nostr not found");
      return;
    }

    const pk = await window.nostr.getPublicKey();

    const npub = nip19.npubEncode(pk);

    setKeyPair({ npub, nsec: null });
  };

  const handleKeyGeneration = async () => {
    const { npub, nsec } = await generateNostrKeypair();

    console.log(npub);

    setKeyPair({ npub, nsec });
  };

  const handleNewSubmit = async () => {
    const token = session.token.accessToken;

    const gistID = await createVerificationGist(token, keyPair.npub);

    if (!gistID) {
      alert("Could not create gist");
      return;
    }

    alert("Gist created", gistID);

    await newKind0Event(
      keyPair.npub,
      keyPair.nsec,
      session.session.user.name.replace(/\s/g, ""),
      gistID
    );
  };

  const handleUpdateSubmit = async () => {
    const token = session.token.accessToken;

    const gistID = await createVerificationGist(token, keyPair.npub);

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
    <div className="modal">
      {step === 1 && (
        <div className="modal-content">
          <h2>Step 1: Do you have a nostr account?</h2>
          <button onClick={() => setStep("login")}>Yes</button>
          <button
            onClick={async () => {
              await handleKeyGeneration();
              setStep("create");
            }}
          >
            No
          </button>
        </div>
      )}
      {step === "login" && (
        <div className="modal-content">
          <h2>Step 2: Login with nostr</h2>
          <button onClick={handleSignIn}>Login with Alby / Nos2x</button>
          <button onClick={() => setStep(1)}>Back</button>

          <button
            disabled={!keyPair?.npub}
            onClick={() => setStep("confirm-connect")}
          >
            Next
          </button>
        </div>
      )}
      {step === "create" && (
        <div className="modal-content">
          <h2>Step 2: Choose your username</h2>
          <input type="text" placeholder="username" />
          {keyPair && (
            <div>
              <p>NPUB: {keyPair.npub}</p>
              <p>NSEC: {keyPair.nsec}</p>
            </div>
          )}
          <button onClick={() => setStep(1)}>Back</button>
          <button
            onClick={() => {
              setStep("confirm-new");
            }}
          >
            Next
          </button>
        </div>
      )}
      {step === "confirm-connect" && (
        <div className="modal-content">
          <h2>Step 3: Confirm your information</h2>
          <p>NPUB: {keyPair.npub}</p>
          <p>GitHub username: {session.session.user.name.replace(/\s/g, "")}</p>
          <p>
            If you confirm and press submit below we will post a verification
            gist on your behalf which will link this nostr public key to your
            Github profile
          </p>
          <button onClick={() => setStep(1)}>Back</button>
          <button onClick={handleUpdateSubmit}>Submit</button>
        </div>
      )}
      {step === "confirm-new" && (
        <div className="modal-content">
          <h2>Step 3: Confirm your information</h2>
          <p>NPUB: {keyPair.npub}</p>
          <p>GitHub username: {session.session.user.name.replace(/\s/g, "")}</p>
          <p>
            If you confirm and press submit below we will post a verification
            gist on your behalf which will link this newly created nostr public
            key to your Github profile
          </p>
          <button onClick={() => setStep(1)}>Back</button>
          <button onClick={handleNewSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default OnboardingModal;
