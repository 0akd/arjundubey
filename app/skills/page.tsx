import React from "react";
import { skills } from "./skills";

function Skills() {
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

  return (
    <div className="flex flex-col space-y-12">
      {categoryOrder.map((category) => {
        const categorySkills = groupedSkills[category];
        if (!categorySkills || categorySkills.length === 0) return null;
        
        return (
          <div key={category} className="w-full">
            {/* Category Header */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-fun-gray mb-2">
                {category}
              </h3>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            </div>
            
            {/* Skills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
              {categorySkills.map((skill, index) => (
                <div
                  key={`${category}-${index}`}
                  title={skill.title}
                  className="group flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-3">
                    <img 
                      src={skill.icon} 
                      alt={skill.title}
                      style={skill.style}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <p className="text-xs md:text-sm text-fun-gray font-semibold text-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    {skill.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Skills;