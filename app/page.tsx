"use client"
import { useTheme } from 'next-themes'
import Stats from './stats/page'
import Nav from './nav'

export default function Home(){
return(
  <div>
   <Nav/>
    <Stats/>
  </div>
);
}