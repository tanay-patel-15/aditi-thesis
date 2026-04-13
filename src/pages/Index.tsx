import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";
import MainMenu from "@/components/MainMenu";

const Index = () => {
  const hasSeenSplash = sessionStorage.getItem("splashShown") === "true";
  const [showSplash, setShowSplash] = useState(!hasSeenSplash);

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShown", "true");
    setShowSplash(false);
  };

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" onComplete={handleSplashComplete} />
      ) : (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <MainMenu />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
