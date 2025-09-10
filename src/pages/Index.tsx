import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesGrid from "@/components/ServicesGrid";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";
import BirthdayModal from "@/components/BirthdayModal";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

const Index = () => {
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  
  // Track visitor analytics for homepage
  useVisitorTracking('/');

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        <HeroSection onBirthdayPromoClick={() => setIsBirthdayModalOpen(true)} />
        <AboutSection />
        <ServicesGrid />
        <LocationSection />
      </main>
      <Footer />

      <BirthdayModal 
        isOpen={isBirthdayModalOpen}
        onClose={() => setIsBirthdayModalOpen(false)}
      />
    </div>
  );
};

export default Index;
