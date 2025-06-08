"use client";
import React, { useTransition, useState } from "react";

import TabButton from "./tabbutton";
import Image from '../3d/gallery/page'
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
    title: "Education",
    id: "education",
    content: (
      <ul className="list-disc pl-2">
        <li>Fullstack Academy of Code</li>
        <li>University of California, Santa Cruz</li>
      </ul>
    ),
  },
  {
    title: "Certifications",
    id: "certifications",
    content: (
      <ul className="list-disc pl-2">
        <li>AWS Cloud Practitioner</li>
        <li>Google Professional Cloud Developer</li>
      </ul>
    ),
  },
];

const AboutSection: React.FC = () => {
  const [tab, setTab] = useState<string>("certifications");
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
    <Image/>
        <div className="py-8 lg:px-32 sm:px-3 sm:py-16  mt-4 px-4 md:mt-0 text-left flex flex-col h-full">
          <h2 className="text-4xl font-bold  mb-4">About Me</h2>
          <p className="text-base px-4 lg:text-lg">
     I am a software developer specializing in building high-performance, user-focused web applications. Skilled in ReactJS, NextJS, SolidJS, and an expert in JavaScript, HTML and CSS
          </p>
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
