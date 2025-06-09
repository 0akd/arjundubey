"use client"
import { useTheme } from 'next-themes'
import Stats from './stats/page'
import Nav from './nav/page'
import Hero from './Hero/page'
import About from './about/page'
import Expedu from './education/page'
import Projects from './projects/page'
import Blog from './blog/page'
import LLm from './llm/page'

export default function Home(){
return(
  <div>
   <Nav/>
   <Hero/>
   <About/>
   <Expedu/>
   <Projects/>
   <Blog/>
   <LLm/>
    <Stats/>
  </div>
);
}