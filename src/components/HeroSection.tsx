import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

const BackgroundMedia = ({ item }: { item: MediaItem }) => {
  if (item.type === 'video') {
    return (
      <video
        key={item.url}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={item.url} type="video/mp4" />
      </video>
    );
  }

  return (
    <div
      key={item.url}
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${item.url})` }}
    />
  );
};


interface HeroContent {
  logo_text: string;
  subtitle: string;
  main_title: string;
  cta_text: string;
}

interface HeroSectionProps {
  onBirthdayPromoClick?: () => void;
}

const HeroSection = ({ onBirthdayPromoClick }: HeroSectionProps) => {
  const navigate = useNavigate();
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [content, setContent] = useState<HeroContent>({
    logo_text: "Paradise",
    subtitle: "Vista do Atlântico", 
    main_title: "CONFIRA NOSSAS OFERTAS",
    cta_text: "Reserve agora!",
  });
  const [carouselMedia, setCarouselMedia] = useState<string[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch hero text content
        const { data: heroData } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_name', 'hero')
          .single();

        if (heroData && heroData.content && typeof heroData.content === 'object') {
            setContent(prev => ({ ...prev, ...(heroData.content as Partial<HeroContent>) }));
        }

        // Fetch carousel media
        const { data: carouselData } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_name', 'carousel')
          .single();

        if (carouselData && carouselData.content && Array.isArray((carouselData.content as any).media)) {
          setCarouselMedia((carouselData.content as any).media);
        }

      } catch (error) {
        console.error('Error fetching page content:', error);
      }
    };
    fetchContent();
  }, []);

  const mediaItems: MediaItem[] = useMemo(() => 
    carouselMedia.map(url => ({
      url,
      type: url.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
    })),
    [carouselMedia]
  );

  useEffect(() => {
    if (mediaItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMediaIndex(prevIndex => (prevIndex + 1) % mediaItems.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [mediaItems.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {mediaItems.map((item, index) => (
          <div
            key={item.url}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentMediaIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <BackgroundMedia item={item} />
          </div>
        ))}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-paradise-blue/60 via-paradise-blue/70 to-accent/60" />
      
      {mediaItems.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {mediaItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentMediaIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentMediaIndex ? 'bg-white shadow-lg scale-110' : 'bg-white/50 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
      
      <div className="relative z-10 text-center text-white px-4 w-full max-w-5xl mx-auto flex flex-col justify-center min-h-screen py-8">
        <div className="mb-6">
          <img 
            src="/lovable-uploads/b526d49c-2269-4e7f-bc59-7add60a51acd.png" 
            alt="Paradise Vista do Atlântico Pousada" 
            className="h-24 md:h-32 w-auto mx-auto"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{content.main_title}</h2>
          <Button 
            variant="paradise" 
            size="lg"
            onClick={() => setIsReservationModalOpen(true)}
          >
            {content.cta_text}
          </Button>
        </div>

        <div className="space-y-3 w-full max-w-4xl mx-auto">
          <Button variant="service" className="w-full" onClick={onBirthdayPromoClick}>Promoção Aniversariante</Button>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="service" onClick={() => navigate('/loja-virtual')}>Loja Virtual</Button>
            <Button variant="service" onClick={() => navigate('/depoimentos')}>Depoimentos</Button>
            <Button variant="service" onClick={() => navigate('/galeria')}>Galeria</Button>
            <Button variant="service" onClick={() => navigate('/bar-restaurante')}>Bar e Restaurante</Button>
          </div>
          <Button variant="service" className="w-full" onClick={() => navigate('/servicos')}>Serviços</Button>
        </div>
      </div>

      <Dialog open={isReservationModalOpen} onOpenChange={setIsReservationModalOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          <DialogTitle className="sr-only">Sistema de Reservas</DialogTitle>
          <div className="relative w-full h-full">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={() => setIsReservationModalOpen(false)}><X className="h-5 w-5" /></Button>
            <iframe
              src="https://reservations3.fasthotel.com.br/162/185#cotacao"
              className="w-full h-full border-0 rounded-lg"
              title="Sistema de Reservas Paradise Vista do Atlântico"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
