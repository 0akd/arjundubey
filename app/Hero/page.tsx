"use client";
import React from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="flex items-center justify-center">
      <div className="sm:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="col-span-8 place-self-center text-center sm:text-left justify-self-start flex flex-col space-y-6"
        >
          {/* Static greeting - completely separate div */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center">
              Hello, I&apos;m
            </h1>
          </div>
          
          {/* Animated text - completely separate div */}
          <div>
            <TypeAnimation
              sequence={[
                // Typing Arjun Dubey
                "A",
                100,
                "Ar",
                100,
                "Arj",
                150,
                "Arjun",
                200,
                "Arjun ",
                100,
                "Arjun D",
                150,
                "Arjun Du",
                100,
                "Arjun Dub",
                150,
                "Arjun Dube",
                100,
                "Arjun Dubey",
                2500, // Pause to read
                
                // Backspace and type full name
                "Arjun Dube",
                100,
                "Arjun Dub",
                100,
                "Arjun Du",
                100,
                "Arjun D",
                100,
                "Arjun ",
                100,
                "Arjun K",
                150,
                "Arjun Ku",
                100,
                "Arjun Kum",
                150,
                "Arjun Kuma",
                100,
                "Arjun Kumar",
                150,
                "Arjun Kumar ",
                100,
                "Arjun Kumar D",
                150,
                "Arjun Kumar Du",
                100,
                "Arjun Kumar Dub",
                150,
                "Arjun Kumar Dube",
                100,
                "Arjun Kumar Dubey",
                2000, // Pause
                
                // Clear and type role
                "",
                300,
                "S",
                150,
                "So",
                100,
                "Sof",
                150,
                "Soft",
                100,
                "Softw",
                150,
                "Softwa",
                100,
                "Softwar",
                150,
                "Software",
                200,
                "Software ",
                100,
                "Software D",
                150,
                "Software De",
                100,
                "Software Dev",
                150,
                "Software Deve",
                100,
                "Software Devel",
                150,
                "Software Develo",
                100,
                "Software Develop",
                150,
                "Software Develope",
                100,
                "Software Developer",
                2000,
                
                // Clear and type next role
                "",
                300,
                "U",
                150,
                "UI",
                200,
                "UI/",
                150,
                "UI/U",
                100,
                "UI/UX",
                200,
                "UI/UX ",
                100,
                "UI/UX D",
                150,
                "UI/UX De",
                100,
                "UI/UX Des",
                150,
                "UI/UX Desi",
                100,
                "UI/UX Desig",
                150,
                "UI/UX Design",
                100,
                "UI/UX Designe",
                100,
                "UI/UX Designer",
                2000,
                
                // Clear and type final role
                "",
                300,
                "T",
                150,
                "Tu",
                100,
                "Tut",
                150,
                "Tuto",
                100,
                "Tutor",
                2000,
              ]}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-center block"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;