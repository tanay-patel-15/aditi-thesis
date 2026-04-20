import { useEffect } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3300);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-heritage-cream"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.img
        src={logo}
        alt="Pol Experience Logo"
        className="w-64 h-64 object-contain"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.p
        className="mt-4 text-muted-foreground font-body text-sm tracking-[0.3em] uppercase"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        Heritage · Culture · Discovery
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
