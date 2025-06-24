"use client"
import { useRef } from "react";

import { motion, useScroll } from "framer-motion";

import ExperienceShowcaseListItem, {
  type ExperienceShowcaseListItemProps,
} from "./listitem";

export interface ExperienceShowcaseListProps {
  title: string;
  details: ExperienceShowcaseListItemProps[];
}

export default function ExperienceShowcaseList(
  props: ExperienceShowcaseListProps,
) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
  });
  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-14 ">
<h1 
  className="md:mb-20 mb-16 w-full text-center text-4xl font-extrabold"
  style={{
    background: 'linear-gradient(to right, #67e8f9, #2563eb)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent'
  }}
>
  {props.title}
</h1>
      <div ref={ref} className="relative w-full md:mx-auto md:w-[80%]">
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute left-9 top-5 h-full w-[5px] origin-top rounded-lg bg-cyan-300"
        ></motion.div>
        <ul className="ml-4 w-full items-center">
          {props.details.map((_details, index) => (
            <ExperienceShowcaseListItem key={index} {..._details} />
          ))}
        </ul>
      </div>
    </div>
  );
}