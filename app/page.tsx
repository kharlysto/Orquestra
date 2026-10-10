import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import Preview from "@/components/landing/Preview";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Preview />
      <Pricing />
      <Footer />
    </main>
  );
}
