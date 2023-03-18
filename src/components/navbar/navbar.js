import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Button,
  IconButton
} from "@chakra-ui/react";
import { useDisclosure } from '@chakra-ui/react'
import styles from "./styles.module.css";
import Link from 'next/link'
import Login from "../Onboarding/GithubLogin"


const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()


  return (
   <div className={styles.navbar}>
      <IconButton aria-label='open drawer' onClick={onOpen} bg="purple.600" hover="background: purple.500"><svg className={styles.icon} viewBox="0 0 100 80" width="40" height="40">
  <rect width="100" height="20" rx="10"></rect>
  <rect y="30" width="100" height="20" rx="10"></rect>
  <rect y="60" width="100" height="20" rx="10"></rect>
</svg></IconButton>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen} className="drawer-header">
        <DrawerOverlay />
        <DrawerContent bg="gray.900" color="gray.50">
          <DrawerHeader borderBottomWidth='1px'>Menu</DrawerHeader>
          <DrawerBody>
            <p><Link href="/">Home</Link></p>
            <p><Link href="/profile">Profile</Link></p>
            <p><Link href="/chat">Chat</Link></p>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Button 
      bg="purple.600"
      >
        <Login/>
      </Button>
      </div> 
    
  )
}

export default Navbar;