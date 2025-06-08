import React, { ReactNode } from "react";
import { motion } from "framer-motion";

const variants = {
  default: { width: 0 },
  active: { width: "calc(100% - 0.75rem)" },
};

interface TabButtonProps {
  active: boolean;
  selectTab: () => void;
  children: ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, selectTab, children }) => {
  return (
    <button onClick={selectTab}>
      <p className={`mr-5 font-semibold ${active ? 'text-blue-600' : 'text-gray-600'}`}>
        {children}
      </p>
      <motion.div
        animate={active ? "active" : "default"}
        variants={variants}
        className="h-1 bg-blue-500 mt-2 mr-3"
      />
    </button>
  );
};

export default TabButton;