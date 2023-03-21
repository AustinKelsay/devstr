import { Button, Menu, MenuList, MenuButton, MenuItem, IconButton, Card, Heading } from "@chakra-ui/react";
import Image from "next/image";
import styles from "./styles.module.css";
import Link from "next/link";
import Login from "../Onboarding/GithubLogin";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import devstrIcon from "../../../public/devstr-icon.png"

const Navbar = () => {

  const { data: session, status } = useSession();
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <div className={styles.navbar}>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label='Options'
          variant='outline'
        ><svg
          className={styles.icon}
          viewBox="0 0 100 80"
          width="40"
          height="40"
        >
            <rect width="100" height="20" rx="10"></rect>
            <rect y="30" width="100" height="20" rx="10"></rect>
            <rect y="60" width="100" height="20" rx="10"></rect>
          </svg></MenuButton>
        <MenuList bg="gray.50" >
          <MenuItem color="black"><Link href="/">Home</Link></MenuItem>
          <MenuItem color="black"><Link href="/profile">Profile</Link></MenuItem>
          <MenuItem color="black"><Link href="/chat">Chat</Link></MenuItem>
        </MenuList>
      </Menu>
      <h1 className={styles.title} fontSize={"xl"}><Image src={devstrIcon} width={30}
      height={30}/>devstr</h1>
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
              {session.token.login}
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
