"use client";
import React, { useTransition, useState } from "react";
import Image from 'next/image'
import TabButton from "./tabbutton";
import Images from '../3d/gallery/page'
import Skill from '../skills/page'

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

        <div className="py-8 lg:px-32 sm:px-3 sm:py-16  mt-4 px-4 md:mt-0 text-left flex flex-col h-full">
          <h2 className="text-4xl font-bold  mb-4">About Me</h2>
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
          <div className="flex flex-row justify-start mt-8">
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
