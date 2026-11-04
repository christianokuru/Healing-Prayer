import { Divider } from "@/components/ui";
import { About, FindUs, Hero, HowItWorks, Ministries, VerseBand } from "./Sections";
import { Sessions } from "./Sessions";

/** Section order: UI.md section 6.1. */
export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Divider />
      <Sessions />
      <HowItWorks />
      <VerseBand />
      <Ministries />
      <FindUs />
    </>
  );
}
