"use client"



import ExperienceShowcaseList from "./list";
import { EXPERIENCE } from "./experience";
import { EDUCATION } from "./education";


export default function About() {
  return (
    <>


      <ExperienceShowcaseList title="Experience" details={EXPERIENCE} />
      <ExperienceShowcaseList title="Education" details={EDUCATION} />
    </>
  );
}