import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import StatsCounter from "../components/landing/StatsCounter";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import RolesShowcase from "../components/landing/RolesShowcase";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <Navbar />
      <Hero />
      <StatsCounter />
      <Features />
      <HowItWorks />
      <RolesShowcase />
      <CTASection />
      <Footer />
    </div>
  );
}
