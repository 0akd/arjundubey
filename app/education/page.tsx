"use client"



import ExperienceShowcaseList from "./list";
import { EXPERIENCE } from "./experience";
import { EDUCATION } from "./education";


export default function About() {
  return (
    <>
<div className="pt-10">

      <ExperienceShowcaseList title="Experience" details={EXPERIENCE} />
      <ExperienceShowcaseList title="Education" details={EDUCATION} /></div>
    </>
  );
}