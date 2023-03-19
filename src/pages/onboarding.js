import { useState } from "react";
import { Button, Box } from "@chakra-ui/react";
import OnboardingModal from "../../src/components/Onboarding/OnboardingModal";

const Onboarding = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <OnboardingModal />
    </Box>
  );
};

export default Onboarding;
