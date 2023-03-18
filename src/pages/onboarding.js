import { useState } from "react";
import OnboardingModal from "../../src/components/Onboarding/OnboardingModal";

const MyPage = () => {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <button onClick={handleShowModal}>Start Onboarding</button>
      {showModal && <OnboardingModal handleClose={handleCloseModal} />}
    </div>
  );
};

export default MyPage;
