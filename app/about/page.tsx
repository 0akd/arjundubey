"use client";
import React, { useTransition, useState } from "react";
import Image from 'next/image'
import TabButton from "./tabbutton";
import dynamic from 'next/dynamic';
import Skill from '../skills/page'


// Dynamically import the 3D gallery with no SSR to avoid hydration issues
const Images = dynamic(() => import('../3d/gallery/page'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-48 flex items-center justify-center  rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading 3D Gallery...</p>
      </div>
    </div>
  )
});

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
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
    md: 'w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48', 
    lg: 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-80 xl:h-80',
    xl: 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96'
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className={`bg-transparent ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full border-2 border-blue-500 sm:border-4 overflow-hidden bg-transparent relative`}>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
            <span className="text-sm">Image not found</span>
          </div>
        ) : (
          <img 
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            style={{ filter: `brightness(${brightness}%)` }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
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
    content: <Skill/>,
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
      <div className="items-center">
       <div className=" px-10 flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between lg:px-32  gap-8">
  {/* Profile Picture */}
  <div className="flex justify-center lg:justify-start">
    <CircularPfp 
      src="/images/arjun.png"
      alt="User profile"
      size="lg"
      brightness={85}
    />
  </div>

  {/* About Me Section */}
  <div className="flex flex-col text-left py-8">
    <h2 className="text-4xl font-bold mb-4">About Me</h2>
    <p className="text-base lg:text-lg max-w-xl">
      I am a software developer specializing in building high-performance, user-focused web applications. Skilled in ReactJS, NextJS, SolidJS, and an expert in JavaScript, HTML and CSS.
    </p>

    {/* Location */}
    <div className="mt-8 flex items-center gap-4">
      <div className="relative flex w-6 h-6 overflow-hidden rounded-md">
        <Image
          className="object-cover"
          alt="Indian flag"
          src="https://flagcdn.com/in.svg"
          width={24}
          height={24}
        />
      </div>
      <span className="text-lg font-medium text-foreground">Delhi, India</span>
    </div>
  </div>
</div>

        <div className="">
         
         
          
          {/* 3D Gallery with error boundary */}
          <div className="mt-8">
            <React.Suspense fallback={
              <div className="w-full h-48 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"></div>
                  <p className="text-sm">Loading 3D Gallery...</p>
                </div>
              </div>
            }><div className="relative">      {/* Left overlay */}
        <div className="absolute top-0 left-0 h-full w-[25%] z-50" />

      {/* Right overlay: blocks interaction */}
      <div className="absolute top-0 right-0 h-full w-[25%] z-50" />
              <Images /></div>
            </React.Suspense>
          </div>
          
          <div className="flex px-10 flex-row justify-start mb-9">
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
          <div className=" px-15">{currentTabContent}</div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;