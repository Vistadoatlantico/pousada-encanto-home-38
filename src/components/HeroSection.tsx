import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface HeroContent {
  logo_text: string;
  subtitle: string;
  main_title: string;
  cta_text: string;
  background_image_url: string | null;
}

interface CarouselImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_active: boolean;
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
    background_image_url: null
  });

  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_name', 'hero')
          .maybeSingle();
        
        if (data?.content && typeof data.content === 'object') {
          setContent(prevContent => ({ ...prevContent, ...data.content as Partial<HeroContent> }));
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
      }
    };

    const fetchCarouselImages = async () => {
      try {
        const { data, error } = await supabase
          .from('carousel_images')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCarouselImages(data);
        }
      } catch (error) {
        console.error('Error fetching carousel images:', error);
      }
    };

    fetchContent();
    fetchCarouselImages();
  }, []);

  // Carrossel automático
  useEffect(() => {
    if (carouselImages.length === 0) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % carouselImages.length
        );
        setIsTransitioning(false);
      }, 300);
    }, 4000); // Muda a imagem a cada 4 segundos

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        {carouselImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
              index === currentImageIndex 
                ? `opacity-100 ${isTransitioning ? 'animate-fade-out' : 'animate-fade-in'}` 
                : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image.image_url})` }}
          />
        ))}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-paradise-blue/60 via-paradise-blue/70 to-accent/60" />
      
      {/* Indicadores do Carrossel */}
      {carouselImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white shadow-lg scale-110' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 w-full max-w-5xl mx-auto flex flex-col justify-center min-h-screen py-8">
        {/* Logo */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/b526d49c-2269-4e7f-bc59-7add60a51acd.png" 
              alt="Paradise Vista do Atlântico Pousada" 
              className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto"
            />
          </div>
        </div>

        {/* Main Title */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {content.main_title}
          </h2>
          <Button 
            variant="paradise" 
            size="default" 
            className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto hover-scale animate-fade-in transition-all duration-300 hover:shadow-lg" 
            onClick={() => setIsReservationModalOpen(true)}
          >
            {content.cta_text}
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-2 sm:space-y-3 w-full max-w-4xl mx-auto">
          {/* Top Button */}
          <Button 
            variant="service" 
            className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold hover-scale animate-fade-in transition-all duration-300 hover:shadow-md" 
            onClick={onBirthdayPromoClick}
          >
            Promoção Aniversariante
          </Button>
          
          {/* Middle Row - 4 Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <Button 
              variant="service" 
              className="h-9 sm:h-10 flex flex-col justify-center hover-scale animate-fade-in transition-all duration-300 hover:shadow-sm" 
              onClick={() => navigate('/loja-virtual')}
            >
              <span className="font-semibold text-xs sm:text-sm">Loja Virtual</span>
            </Button>
            <Button 
              variant="service" 
              className="h-9 sm:h-10 flex flex-col justify-center hover-scale animate-fade-in transition-all duration-300 hover:shadow-sm" 
              onClick={() => navigate('/depoimentos')}
            >
              <span className="font-semibold text-xs sm:text-sm">Depoimentos</span>
            </Button>
            <Button 
              variant="service" 
              className="h-9 sm:h-10 flex flex-col justify-center hover-scale animate-fade-in transition-all duration-300 hover:shadow-sm" 
              onClick={() => navigate('/galeria')}
            >
              <span className="font-semibold text-xs sm:text-sm">Galeria</span>
            </Button>
            <Button 
              variant="service" 
              className="h-9 sm:h-10 flex flex-col justify-center hover-scale animate-fade-in transition-all duration-300 hover:shadow-sm" 
              onClick={() => navigate('/bar-restaurante')}
            >
              <span className="font-semibold text-xs sm:text-sm">Bar e Restaurante</span>
            </Button>
          </div>
          
          {/* Bottom Button */}
          <Button 
            variant="service" 
            className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold hover-scale animate-fade-in transition-all duration-300 hover:shadow-md" 
            onClick={() => navigate('/servicos')}
          >
            Serviços
          </Button>
        </div>
      </div>

      {/* Modal de Reservas */}
      <Dialog open={isReservationModalOpen} onOpenChange={setIsReservationModalOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          <DialogTitle className="sr-only">Sistema de Reservas</DialogTitle>
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
              onClick={() => setIsReservationModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
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