import QR from "../QR/QR"
import React, { useEffect, useState } from "react";
import { setUser } from "../../redux/userReducer/userReducer";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/profile.module.css"
import { relayInit } from "nostr-tools";
// import NostrCard from "../components/nostrCard/nostrCard"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'

const ShowQrButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  // const [profileCard, setProfileCard] = useState(true)
  const [qr, setQr] = useState('')

  const toggleQrDisplay = (e) => {
    setIsVisible((prev) => !prev);
  };
  const { isOpen, onOpen, onClose } = useDisclosure(toggleQrDisplay)

  const nostrUser = useSelector((state) => state.users.user);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchKind0 = async () => {
      const relay = relayInit("wss://relay.damus.io");
      relay.on("connect", () => {
        console.log(`connected to ${relay.url}`);
      });
      relay.on("error", () => {
        console.log(`failed to connect to ${relay.url}`);
      });

      await relay.connect();

      const pubkey = await window.nostr.getPublicKey();

      let sub = relay.sub([
        {
          kinds: [0],
          authors: [pubkey],
        },
      ]);

      console.log("sub", sub);

      sub.on("event", (event) => {
        console.log("we got the event we wanted:", event);

        const profile = JSON.parse(event.content);
        const parsedProfile = {
          about: profile.about,
          displayName: profile.display_name,
          name: profile.name,
          nip05: profile.nip05,
          picture: profile.picture,
          lnAddress: profile.lud16
        }
        setQr(parsedProfile.lnAddress)
        dispatch(setUser(profile));
      });

      // For when there are no more events from subscription
      sub.on("eose", () => {
        console.log("no more events");
        sub.unsub();
      });
    };
    fetchKind0();
  }, []);

  return (
    <div className={styles.qrButton} onClick={onOpen}>
      {isVisible ? "" : (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-qr-code" viewBox="0 0 16 16">
        <path d="M2 2h2v2H2V2Z" />
        <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z" />
        <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z" />
        <path d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z" />
        <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z" />
      </svg>)}
      <Modal onClose={onClose} isOpen={isOpen} isCentered >
        <ModalOverlay />
        <ModalContent bg="#242424" borderRadius="30">
          <ModalHeader textAlign="center" color="white">{qr}</ModalHeader>
          <ModalBody>
            <QR value={qr} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default ShowQrButton;