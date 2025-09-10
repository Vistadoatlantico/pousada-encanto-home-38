import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReservationModal from "@/components/ReservationModal";
import dayUseImage from "@/assets/day-use.jpg";

interface DayUseContent {
  title: string;
  subtitle: string;
  description: string;
  hours: string;
  price: string;
  includes: string[];
  packages: Array<{
    name: string;
    description: string;
    price: string;
    duration: string;
  }>;
  heroImage?: string;
  galleryImages?: string[];
}

const DayUse = () => {
  const [content, setContent] = useState<DayUseContent>({
    title: "Day Use",
    subtitle: "Desfrute de um dia completo de lazer",
    description: "Aproveite todas as nossas facilidades durante o dia, sem necessidade de hospedagem.",
    hours: "Das 8h às 18h",
    price: "R$ 80,00 por pessoa",
    includes: ["Piscina", "Área de lazer", "Estacionamento", "Wi-Fi"],
    packages: [
      {
        name: "Day Use Simples",
        description: "Acesso às áreas comuns e piscina",
        price: "R$ 80,00",
        duration: "8h às 18h"
      },
      {
        name: "Day Use Premium",
        description: "Inclui almoço e bebidas",
        price: "R$ 150,00",
        duration: "8h às 18h"
      }
    ],
    heroImage: dayUseImage,
    galleryImages: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_name', 'day_use')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching day use content:', error);
          return;
        }
        
        if (data?.content && typeof data.content === 'object') {
          const fetchedContent = data.content as unknown as Partial<DayUseContent>;
          setContent(prev => ({
            ...prev,
            ...fetchedContent,
            includes: Array.isArray(fetchedContent.includes) ? fetchedContent.includes : prev.includes,
            packages: Array.isArray(fetchedContent.packages) ? fetchedContent.packages : prev.packages,
            galleryImages: Array.isArray(fetchedContent.galleryImages) ? fetchedContent.galleryImages : prev.galleryImages
          }));
        }
      } catch (error) {
        console.error('Error in fetchContent:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <section 
          className="relative h-64 sm:h-80 md:h-96 bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: content.heroImage && content.heroImage.trim() !== "" 
              ? `url(${content.heroImage})` 
              : 'none'
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4">{content.title}</h1>
            <p className="text-base sm:text-lg md:text-xl">{content.subtitle}</p>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-br from-paradise-blue/5 to-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start">
              
              {/* Left Side - Information */}
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-paradise-blue mb-3 sm:mb-4">
                    Day Use - Paradise Vista do Atlântico
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                    {content.description}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm">
                    <span>❌</span>
                    <span>Proibido entrada de bebidas, comidas e som</span>
                  </div>
                </div>

                {/* What's Included */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-paradise-blue mb-3 sm:mb-4">
                      O que está incluso:
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {content.includes.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-paradise-blue rounded-full"></div>
                          <span className="text-muted-foreground text-sm sm:text-base">{item}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-paradise-blue rounded-full"></div>
                        <span className="text-muted-foreground text-sm sm:text-base">Área verde e jardins</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-paradise-blue rounded-full"></div>
                        <span className="text-muted-foreground text-sm sm:text-base">Área de Kids</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-paradise-blue rounded-full"></div>
                        <span className="text-muted-foreground text-sm sm:text-base">Acesso ao bar e restaurante</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-paradise-blue rounded-full"></div>
                        <span className="text-muted-foreground text-sm sm:text-base">Vista panorâmica</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-paradise-blue rounded-full"></div>
                        <span className="text-muted-foreground text-sm sm:text-base">Lugares instagramáveis</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Packages */}
                <div className="space-y-3 sm:space-y-4">
                  {content.packages.map((pkg, index) => (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm border-2 hover:border-paradise-blue transition-colors">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-2 sm:gap-4">
                          <div className="flex-1">
                            <h4 className="text-base sm:text-lg font-bold text-paradise-blue mb-1 sm:mb-2">{pkg.name}</h4>
                            <p className="text-muted-foreground text-xs sm:text-sm">{pkg.description}</p>
                          </div>
                          <div className="sm:text-right">
                            <span className="text-lg sm:text-2xl font-bold text-paradise-blue">{pkg.price}</span>
                            <p className="text-xs text-muted-foreground">{pkg.duration}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  variant="paradise" 
                  size="lg" 
                  className="w-full text-sm sm:text-base"
                  onClick={() => setIsReservationModalOpen(true)}
                >
                  Reserve Agora
                </Button>
                
                {/* Hours */}
                <div className="text-center p-3 sm:p-4 bg-paradise-blue/10 rounded-lg">
                  <p className="text-base sm:text-lg font-semibold text-paradise-blue mb-1">
                    Horário de Funcionamento
                  </p>
                  <p className="text-muted-foreground text-sm sm:text-base">{content.hours}</p>
                </div>
              </div>

              {/* Right Side - Images */}
              <div className="space-y-4 sm:space-y-6">
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={content.galleryImages && content.galleryImages.length > 0 
                      ? content.galleryImages[0] 
                      : content.heroImage || ""
                    }
                    alt="Day Use - Paradise Vista do Atlântico" 
                    className="w-full h-48 sm:h-64 md:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                {/* Gallery Images */}
                {content.galleryImages && content.galleryImages.length > 1 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    {content.galleryImages.slice(1, 5).map((image, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden shadow-lg">
                        <img 
                          src={image} 
                          alt={`Day Use ${index + 2}`} 
                          className="w-full h-24 sm:h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Video Placeholder - Only show if no gallery images */}
                {(!content.galleryImages || content.galleryImages.length === 0) && (
                  <Card className="bg-gray-100 border-2 border-dashed border-gray-300">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                        <div className="text-gray-400">
                          <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                          <p className="text-xs sm:text-sm font-medium">Vídeo da estrutura</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">Conheça nossa estrutura para Day Use</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        title="Reservar Day Use"
        reservationUrl="https://reservations3.fasthotel.com.br/162/185"
      />
      
      <Footer />
    </div>
  );
};

export default DayUse;