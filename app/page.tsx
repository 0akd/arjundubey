"use client"
import { useTheme } from 'next-themes'
import Stats from './stats/page'
import Nav from './nav/page'
import Hero from './Hero/page'

export default function Home(){
return(
  <div>
   <Nav/>
   <Hero/>
    <Stats/>
  </div>
);
}