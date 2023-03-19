import {
  Card,
  Heading,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Button,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import Image from "next/image";
import styles from "./styles.module.css";
import Link from "next/link";
import Login from "../Onboarding/GithubLogin";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <div className={styles.navbar}>
      <IconButton
        colorScheme="whiteAlpha"
        aria-label="open drawer"
        onClick={onOpen}
        color={"whiteAlpha.100"}
        bg="purple.600"
        hover="background: purple.500"
      >
        <svg
          className={styles.icon}
          viewBox="0 0 100 80"
          width="40"
          height="40"
        >
          <rect width="100" height="20" rx="10"></rect>
          <rect y="30" width="100" height="20" rx="10"></rect>
          <rect y="60" width="100" height="20" rx="10"></rect>
        </svg>
      </IconButton>
      <Drawer
        placement="left"
        onClose={onClose}
        isOpen={isOpen}
        className="drawer-header"
      >
        <DrawerOverlay />
        <DrawerContent bg="gray.900" color="gray.50">
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <p>
              <Link href="/">Home</Link>
            </p>
            <p>
              <Link href="/profile">Profile</Link>
            </p>
            <p>
              <Link href="/chat">Chat</Link>
            </p>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Text className={styles.title} fontSize={"xl"}>
        Devstr
      </Text>
      <div className={styles.navbarRight}>
        {status === "authenticated" && (
          <Card
            direction={"row"}
            overflow="hidden"
            variant="outline"
            align={"center"}
            bg={"whiteAlpha.900"}
            py={1}
            px={2}
            _hover={{ cursor: "pointer", opacity: 0.6 }}
            onClick={handleProfileClick}
          >
            <Image
              src={session.session.user.image}
              width={40}
              height={40}
              style={{ borderRadius: "5px" }}
              alt="profile-banner"
            />
            <Heading ml={2} size="sm">
              {session.session.user.name.replace(/\s/g, "")}
            </Heading>
          </Card>
        )}
        <Button bg="purple.600">
          <Login />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
