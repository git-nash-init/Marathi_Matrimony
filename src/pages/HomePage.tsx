import React from 'react';
import { Hero } from '../components/home/Hero';
import { QuickSearchPhoneSection } from '../components/home/QuickSearchPhoneSection';
import { TrustSection } from '../components/home/TrustSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { FeaturedProfilesSection } from '../components/home/FeaturedProfilesSection';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';
import { MembershipSection } from '../components/home/MembershipSection';
import { SuccessStoriesSection } from '../components/home/SuccessStoriesSection';
import { SafetySection } from '../components/home/SafetySection';
import { FAQSection } from '../components/home/FAQSection';
import { FinalCTASection } from '../components/home/FinalCTASection';

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* 1. HERO - Fullscreen cinematic visuals, glass navbar overlay */}
      <Hero />

      {/* 2. DEDICATED IPHONE MATCH FINDER SECTION */}
      <QuickSearchPhoneSection />

      {/* 3. TRUST SECTION */}
      <TrustSection />

      {/* 4. HOW IT WORKS */}
      <HowItWorksSection />

      {/* 5. FEATURED PROFILES */}
      <FeaturedProfilesSection />

      {/* 6. WHY CHOOSE US */}
      <WhyChooseUsSection />

      {/* 7. MEMBERSHIP PREVIEW */}
      <MembershipSection />

      {/* 8. SUCCESS STORIES */}
      <SuccessStoriesSection />

      {/* 9. SAFETY SECTION */}
      <SafetySection />

      {/* 10. FAQ */}
      <FAQSection />

      {/* 11. FINAL CTA */}
      <FinalCTASection />
    </div>
  );
};
