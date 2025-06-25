"use client";
import React, { useEffect, useState } from "react";
import { skills } from "./skills";
import { motion } from "framer-motion";

// Animation variants for fade in effect
const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
      duration: 0.6,
    },
  }),
};

// Category header animation
const categoryHeaderVariants = {
  initial: {
    opacity: 0,
    x: -50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
    },
  },
};

// Container animation for staggered children
const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function Skills() {
  const [autoAnimateIndex, setAutoAnimateIndex] = useState(0);
  
  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  // Define category order for consistent display
  const categoryOrder = [
    "Languages",
    "Framework and Libraries", 
    "Backend",
    "Database and ORMs",
    "Tools and Technologies"
  ];

  // Calculate total number of skills for auto animation
  const totalSkills = categoryOrder.reduce((total, category) => {
    const categorySkills = groupedSkills[category];
    return total + (categorySkills ? categorySkills.length : 0);
  }, 0);

  // Auto-animate effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoAnimateIndex((prev) => (prev + 1) % totalSkills);
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSkills]);

  // Keep track of global index for staggered animations
  let globalIndex = 0;

  return (
    <motion.div 
      className="flex flex-col space-y-8 sm:space-y-10 md:space-y-12  "
      variants={containerVariants}
      initial="initial"
      whileInView="animate"
      viewport={{
        once: true,
        amount: 0.1,
      }}
    >
      {categoryOrder.map((category, categoryIndex) => {
        const categorySkills = groupedSkills[category];
        if (!categorySkills || categorySkills.length === 0) return null;
        
        return (
          <div key={category} className="w-full">
            {/* Category Header */}
            <motion.div 
              className="mb-1"
              variants={categoryHeaderVariants}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              transition={{ delay: categoryIndex * 0.2 }}
            >
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-fun-gray">
                {category}
              </h3>
              <motion.div 
                className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-cyan-300 to bg-transparent  rounded-full mt-2"
                initial={{ width: 0 }}
                whileInView={{ width: "auto" }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.2 + 0.3, duration: 0.8 }}
              />
            </motion.div>
            
            {/* Skills Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-20">
              {categorySkills.map((skill, index) => {
                const currentIndex = globalIndex++;
                const isAutoAnimating = currentIndex === autoAnimateIndex;
                
                return (
                  <motion.div
                    key={`${category}-${index}`}
                    title={skill.title}
                    className="group flex flex-col items-center justify-center p-3 sm:p-4 md:p-5 rounded-lg hover:bg-gray-500  transition-colors duration-300"
                    variants={fadeInAnimationVariants}
                    initial="initial"
                    whileInView="animate"
                    viewport={{
                      once: true,
                    }}
                    custom={currentIndex}
                    animate={isAutoAnimating ? {
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    } : {
                      scale: 1,
                      transition: { duration: 0.3 }
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.div 
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center mb-2"
                      animate={isAutoAnimating ? {
                        rotate: 10,
                        transition: { duration: 0.3 }
                      } : {
                        rotate: 0,
                        transition: { duration: 0.3 }
                      }}
                      whileHover={{ rotate: 15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img 
                        src={skill.icon} 
                        alt={skill.title}
                        style={skill.style}
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                    <p className={`text-xs sm:text-sm md:text-base text-fun-gray font-semibold text-center transition-opacity duration-300 leading-tight ${
                      isAutoAnimating ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                    }`}>
                      {skill.title}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

export default Skills;