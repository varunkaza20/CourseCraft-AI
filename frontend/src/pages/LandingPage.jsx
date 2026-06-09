import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import StatsBar from '../components/landing/StatsBar';
import ProblemVsSolution from '../components/landing/ProblemVsSolution';
import FeaturesSection from '../components/landing/FeaturesSection';
import CtaStrip from '../components/landing/CtaStrip';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
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
