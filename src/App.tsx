// src/components/AppWrapper.tsx
import React, { useEffect, useState } from "react";
import Loader from "./components/loader";

const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingFinished, setLoadingFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingFinished(true);
    }, 2000); // ⏱️ igual que tu lógica original

    return () => clearTimeout(timer);
  }, []);

  if (!loadingFinished) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default AppWrapper;
