import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PlatformStrip from "@/components/PlatformStrip";
import Feature1 from "@/components/Feature1";
import Feature2 from "@/components/Feature2";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import LaunchOffer from "@/components/LaunchOffer";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <PlatformStrip />
      <Feature1 />
      <Feature2 />
      <HowItWorks />
      <Testimonials />
      <LaunchOffer />
      <Pricing />
      <FinalCTA />
      <FAQ />
      <Footer />
    </main>
  );
}
