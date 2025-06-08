import React, { ReactNode } from "react";
import { motion } from "framer-motion";

const variants = {
  default: { width: 0 },
  active: { width: "100%" },
};

const arrowVariants = {
  default: { opacity: 0, y: -5 },
  active: { opacity: 1, y: 0 },
};

interface TabButtonProps {
  active: boolean;
  selectTab: () => void;
  children: ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, selectTab, children }) => {
  return (
    <div className="mr-5 relative">
      {/* Downward Arrow */}
      <motion.div
        animate={active ? "active" : "default"}
        variants={arrowVariants}
        className="absolute -top-3 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-500"></div>
      </motion.div>
      
      {/* Tab Button */}
      <button onClick={selectTab}>
        <p className={`border-1 px-2 py-1 font-bold border-blue-500  ${active ? 'text-blue-600' : 'text-gray-600'}`}>
          {children}
        </p>
        <motion.div
          animate={active ? "active" : "default"}
          variants={variants}
          className="h-2 bg-blue-500 mt-2 "
        />
      </button>
    </div>
  );
};

export default TabButton;