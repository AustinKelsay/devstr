import React from "react";
import useRelay from "@/hooks/useRelay";

const RelayWrapper = ({ children }) => {
  useRelay("ws://18.220.89.39:8006/");

  return <>{children}</>;
};

export default RelayWrapper;
