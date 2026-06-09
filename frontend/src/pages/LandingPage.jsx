import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import StatsBar from '../components/landing/StatsBar';
import ProblemVsSolution from '../components/landing/ProblemVsSolution';
import FeaturesSection from '../components/landing/FeaturesSection';
import CtaStrip from '../components/landing/CtaStrip';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("scrollTo") === "features") {
      setTimeout(() =>
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }), 100
      );
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsBar />
        <ProblemVsSolution />
        <FeaturesSection />
        <CtaStrip />
      </main>
      <Footer />
    </div>
  );
}
