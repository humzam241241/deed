import React from 'react';
import Hero from '../components/Hero';
import Steps from '../components/Steps';
import MeetingStrip from '../components/MeetingStrip';
import TrustedBy from '../components/TrustedBy';
import MiniGallery from '../components/MiniGallery';
import DesignStudioCTA from '../components/DesignStudioCTA';
import MarketplaceSection from '../components/MarketplaceSection';
import SocialBar from '../components/SocialBar';
import FloatingSocial from '../components/FloatingSocial';
import ChatBot from '../components/ChatBot';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Steps />
      <MarketplaceSection />
      <MeetingStrip />
      <TrustedBy />
      <MiniGallery />
      <DesignStudioCTA />
      <SocialBar />
      <FloatingSocial />
      <ChatBot />
    </div>
  );
}
