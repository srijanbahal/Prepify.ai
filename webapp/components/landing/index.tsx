"use client";

import Hero from "./Hero";
import NeuralNetwork from "./NeuralNetwork";
import RealTimeVoice from "./RealTimeVoice";
import FeedbackLoop from "./FeedbackLoop";
import Pricing from "./Pricing";
import LandingNavbar from "./Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <LandingNavbar />
      <main>
        <Hero />
        <NeuralNetwork />
        <RealTimeVoice />
        <FeedbackLoop />
        <Pricing />
      </main>
      
      <footer className="py-12 px-4 border-t border-white/10 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-gray-500 text-sm">
            © 2024 Prepify.ai. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Terms</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
