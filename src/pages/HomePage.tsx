import React from 'react';
import { Hero } from '../components/home/Hero';
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
      {/* 1. HERO */}
      <Hero />

      {/* 2. TRUST SECTION */}
      <TrustSection />

      {/* 3. HOW IT WORKS */}
      <HowItWorksSection />

      {/* 4. FEATURED PROFILES */}
      <FeaturedProfilesSection />

      {/* 5. WHY CHOOSE US */}
      <WhyChooseUsSection />

      {/* 6. MEMBERSHIP PREVIEW */}
      <MembershipSection />

      {/* 7. SUCCESS STORIES */}
      <SuccessStoriesSection />

      {/* 8. SAFETY SECTION */}
      <SafetySection />

      {/* 9. FAQ */}
      <FAQSection />

      {/* 10. FINAL CTA */}
      <FinalCTASection />
    </div>
  );
};
