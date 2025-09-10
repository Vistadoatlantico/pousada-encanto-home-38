import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReservationModal from "@/components/ReservationModal";

interface AreaVipContent {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  packages: Array<{
    name: string;
    description: string;
    price: string;
    capacity: string;
    includes: string[];
  }>;
  heroImage?: string;
  galleryImages?: string[];
}

const AreaVip = () => {
  const [content, setContent] = useState<AreaVipContent>({
    title: "Área VIP",
    subtitle: "Exclusividade e conforto para momentos especiais",
    description: "Desfrute de um espaço reservado com serviços premium e atendimento personalizado.",
    features: ["Área privativa", "Serviço de garçom", "Som ambiente", "Decoração especial"],
    packages: [
      {
        name: "VIP Família",
        description: "Perfeito para celebrações familiares",
        price: "R$ 300,00",
        capacity: "Até 8 pessoas",
        includes: ["Área reservada", "Bebidas inclusas", "Petiscos", "4 horas"]
      },
      {
        name: "VIP Premium",
        description: "Para ocasiões ainda mais especiais",
        price: "R$ 500,00", 
        capacity: "Até 12 pessoas",
        includes: ["Área exclusiva", "Open bar", "Buffet completo", "6 horas", "Decoração"]
      }
    ],
    heroImage: "/src/assets/area-vip.jpg",
    galleryImages: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log('Fetching area VIP content...');
        const { data, error } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_name', 'area_vip')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching area vip content:', error);
          return;
        }
        
        console.log('Fetched data:', data);
        
        if (data?.content && typeof data.content === 'object') {
          const fetchedContent = data.content as unknown as Partial<AreaVipContent>;
          console.log('Parsed content:', fetchedContent);
          
          setContent(prev => {
            const newContent = {
              ...prev,
              ...fetchedContent,
              features: Array.isArray(fetchedContent.features) ? fetchedContent.features : prev.features,
              packages: Array.isArray(fetchedContent.packages) ? fetchedContent.packages : prev.packages,
              galleryImages: Array.isArray(fetchedContent.galleryImages) ? fetchedContent.galleryImages : prev.galleryImages
            };
            console.log('Updated content:', newContent);
            return newContent;
          });
        } else {
          console.log('No content found or invalid format');
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
            backgroundImage: content.heroImage 
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
                    Área VIP - Paradise Vista do Atlântico
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                    {content.description}
                  </p>
                </div>

                {/* Features */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-paradise-blue mb-3 sm:mb-4">
                      Experiência VIP inclui:
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {content.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-paradise-blue rounded-full"></div>
                          <span className="text-muted-foreground text-sm sm:text-base">{feature}</span>
                        </div>
                      ))}
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
                            <p className="text-muted-foreground text-xs sm:text-sm mb-1">{pkg.description}</p>
                            <p className="text-xs text-muted-foreground">{pkg.capacity}</p>
                          </div>
                          <div className="sm:text-right">
                            <span className="text-lg sm:text-2xl font-bold text-paradise-blue">{pkg.price}</span>
                          </div>
                        </div>
                        
                        {/* Package includes */}
                        <div className="mb-3 sm:mb-4">
                          <div className="grid grid-cols-1 gap-1">
                            {pkg.includes.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-paradise-blue rounded-full"></div>
                                <span className="text-xs sm:text-sm text-muted-foreground">{item}</span>
                              </div>
                            ))}
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
                  Reservar Área VIP
                </Button>
                
                {/* Additional Info */}
                <div className="text-center p-3 sm:p-4 bg-paradise-blue/10 rounded-lg">
                  <p className="text-base sm:text-lg font-semibold text-paradise-blue mb-1">
                    Atendimento Personalizado
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm">Nossa equipe dedicada garante que sua experiência seja única e inesquecível</p>
                </div>
              </div>

              {/* Right Side - Images */}
              <div className="space-y-4 sm:space-y-6">
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={content.galleryImages && content.galleryImages.length > 0 
                      ? content.galleryImages[0] 
                      : "/lovable-uploads/e2bc494a-15f9-447b-8463-1eb48d459b3b.png"
                    } 
                    alt="Área VIP - Paradise Vista do Atlântico" 
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
                          alt={`Área VIP ${index + 2}`} 
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
                          <p className="text-xs sm:text-sm font-medium">Vídeo da Área VIP</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">Conheça nossa estrutura exclusiva</p>
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
        title="Reservar Área VIP"
        reservationUrl="https://reservations3.fasthotel.com.br/162/185"
      />
      
      <Footer />
    </div>
  );
};

export default AreaVip;