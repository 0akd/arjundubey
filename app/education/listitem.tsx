"use client"
import { RefObject, useRef } from "react";
import Link from "next/link";

import { motion, useScroll } from "framer-motion";

export interface ExperienceListIconProps {
  iconRef: RefObject<HTMLElement | null>;
}

function ShowCaseLiIcon(props: ExperienceListIconProps) {
  const { scrollYProgress } = useScroll({
    target: props.iconRef,
    offset: ["center end", "center center"],
    layoutEffect: false,
  });
  return (
    <figure className="absolute left-0 ">
     <svg width="75" height="75" viewBox="0 0 100 100">
  {/* Blurred background rectangle */}
  <defs>
    <filter id="blur">
      <feGaussianBlur stdDeviation="5" />
    </filter>
  </defs>
  <rect
    x="30"
    y="5"
    width="40"
    height="45"
    rx="10"
    fill="rgba(255, 255, 255, 0.6)"
    filter="url(#blur)"
  />
  {/* Your circles */}
  <circle cx="50" cy="27" r="20" className="fill-white/5" />
  <motion.circle
    style={{ pathLength: scrollYProgress }}
    cx="50"
    cy="27"
    r="20"
    className="stroke-[10px] fill-transparent rounded-xl stroke-cyan-600"
  />
  <circle cx="50" cy="27" r="10" className="fill-white/5 stroke-1" />
</svg>

    </figure>
  );
}

export interface ExperienceShowcaseListItemProps {
  title: string;
  organisation: {
    name: string;
    href: string;
  };
  date: string;
  location: string;
  description: string;
}

export default function ExperienceShowcaseListItem(
  props: ExperienceShowcaseListItemProps,
) {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li ref={ref} className="mx-auto mb-14 flex w-[60%] flex-col gap-1">
      <ShowCaseLiIcon iconRef={ref} />
      <motion.div
        initial={{ y: 50 }}
        whileInView={{ y: 0 }}
        transition={{
          type: "spring",
          duration: 0.4,
        }}
      >
        <h3 className="text-xl font-bold text-foreground mb-3">
          {props.title}{" "}
          <Link
            href={props.organisation.href}
             style={{ textDecoration: "underline" }}
            className="cursor-pointer text-accent"
            target="_blank"
            rel="nofollow"
          >
            @{props.organisation.name}
          </Link>
        </h3>
        <span className="text-sm  font-medium  text-foreground xs:text-base">
          {props.date} | {props.location}
        </span>
   {props.description.includes('|') ? (() => {
  const parts = props.description.split('|').map(p => p.trim());
  const [first, ...rest] = parts;
  return (
    <div className="text-sm mt-2 ml-4 font-medium text-muted-foreground xs:text-base space-y-1">
      <p>{first}</p>
      {rest.length > 0 && (
        <ul className="list-disc pl-5">
          {rest.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
})() : (
  <p className="text-sm mt-2  ml-4 font-medium text-muted-foreground xs:text-base">
    {props.description}
  </p>
)}

      </motion.div>
    </li>
  );
}