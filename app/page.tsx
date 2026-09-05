import { Hero } from "@/components/sections/Hero";
import { HowIGotHere } from "@/components/sections/HowIGotHere";
import { Tracks } from "@/components/sections/Tracks";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Graph } from "@/components/sections/Graph";
import { RabbitHoles } from "@/components/sections/RabbitHoles";
import { Relevance } from "@/components/sections/Relevance";
import { Footer } from "@/components/Footer";

/* Reading order of the sheet: Fig. 1 (hero), Table 1, Fig. 2, prose, Fig. 3, Table 2, Fig. 4, Table 3, Fig. 5. */
export default function Home() {
  return (
    <main>
      <Hero />
      <HowIGotHere />
      <Tracks />
      <About />
      <Experience />
      <Projects />
      <Graph />
      <Relevance />
      <RabbitHoles />
      <Footer />
    </main>
  );
}
