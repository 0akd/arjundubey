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
      <div className="md:grid md:grid-cols-2 gap-8 items-center py-8  xl:gap-16 sm:py-16 xl:px-16">
    <Image/>
        <div className="mt-4 px-4 md:mt-0 text-left flex flex-col h-full">
          <h2 className="text-4xl font-bold  mb-4">About Me</h2>
          <p className="text-base lg:text-lg">
            I am a full stack web developer with a passion for creating
            interactive and responsive web applications. I have experience
            working with JavaScript, React, Redux, Node.js, Express, PostgreSQL,
            Sequelize, HTML, CSS, and Git. I am a quick learner and I am always
            looking to expand my knowledge and skill set. I am a team player and
            I am excited to work with others to create amazing applications.
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
