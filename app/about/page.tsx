"use client";
import React, { useTransition, useState } from "react";
import Image from 'next/image'
import TabButton from "./tabbutton";
import Images from '../3d/gallery/page'
import Skill from '../skills/page'
interface CircularPfpProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  brightness?: number; 
}

const CircularPfp: React.FC<CircularPfpProps> = ({ 
  src, 
  alt = "Profile picture", 
  size = 'md',
  className = '',
   brightness = 100
}) => {
  const sizeClasses = {
    sm: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
    md: 'w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48', 
    lg: 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-80 xl:h-80',
    xl: 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96'
  };

  return (
    <div className={`bg-transparent ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full border-2 border-blue-500 sm:border-4 overflow-hidden bg-transparent`}>
        <img 
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
            style={{ filter: `brightness(${brightness}%)` }}
        />
      </div>
    </div>
  );
};
interface Tab {
  title: string;
  id: string;
  content: React.ReactNode;
}

const TAB_DATA: Tab[] = [
  {
    title: "Skills",
    id: "skills",
    content: (
<Skill/>
    ),
  },
 
  {
    title: "Certifications",
    id: "certifications",
    content: (
      <ul className="list-disc pl-2">
        <li>ToDo</li>
        <li>Every skills showcased per certificate uwu</li>
      </ul>
    ),
  },
];

const AboutSection: React.FC = () => {
  const [tab, setTab] = useState<string>("skills");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (id: string) => {
    startTransition(() => {
      setTab(id);
    });
  };

  const currentTabContent = TAB_DATA.find((t) => t.id === tab)?.content;

  return (
    <section className="" id="about">
      <div className="items-center ">
<div className="flex  justify-center ">
      <CircularPfp 
        src="/images/arjun.png"
        alt="User profile"
        size="lg"
         brightness={85}
      />
    </div>
        <div className=" lg:px-32 sm:px-3 sm:py-16  mt-4  md:mt-0 text-left flex flex-col h-full">
          <h2 className="text-4xl font-bold px-4 mb-4">About Me</h2>
          <p className="text-base px-4 lg:text-lg">
     I am a software developer specializing in building high-performance, user-focused web applications. Skilled in ReactJS, NextJS, SolidJS, and an expert in JavaScript, HTML and CSS
          </p>
          <div       className="mr-0 mt-8 flex items-center justify-center gap-4 lg:mr-8 lg:justify-end">
           <div className="relative flex w-12 gap-4 overflow-hidden rounded-md">
              <Image
                className="-z-10 h-full w-full bg-cover bg-no-repeat"
                alt="Indian flag"
                src="https://flagcdn.com/in.svg"
                width={15}
                height={15}
              />
            </div>
            <span className="text-lg font-medium text-foreground">
              Delhi, India
            </span></div>
              <Images/>
          <div className="flex px-4 flex-row justify-start mt-8">
            {TAB_DATA.map((tabItem) => (
              <TabButton
                key={tabItem.id}
                selectTab={() => handleTabChange(tabItem.id)}
                active={tab === tabItem.id}
              >
                {tabItem.title}
              </TabButton>
            ))}
          </div>
          <div className="mt-8">{currentTabContent}</div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
