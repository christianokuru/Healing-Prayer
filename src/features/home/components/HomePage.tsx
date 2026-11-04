import { About, Contact, Hero, HowItWorks, Services } from "./Sections";
import { Sessions } from "./Sessions";

export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Sessions />
      <HowItWorks />
      <Services />
      <Contact />
    </>
  );
}
