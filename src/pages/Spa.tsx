import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SpaService {
  name: string;
  description: string;
  duration: string;
  price: string;
  image?: string;
  video?: string;
}

interface SpaContent {
  title: string;
  subtitle: string;
  description: string;
  services: SpaService[];
  packages: Array<{
    name: string;
    description: string;
    price: string;
    includes: string[];
  }>;
  heroImage?: string;
  galleryImages?: string[];
  hours: string;
  benefits: string[];
}

const Spa = () => {
  const [content, setContent] = useState<SpaContent>({
    title: "SPA",
    subtitle: "Relaxamento e bem-estar",
    description: "Desconecte-se da rotina e conecte-se com o seu bem-estar em nosso spa exclusivo.",
    services: [
      {
        name: "Massagem Relaxante",
        description: "Técnicas especiais para alívio do stress",
        duration: "60 minutos",
        price: "R$ 180,00"
      },
      {
        name: "Tratamento Facial",
        description: "Limpeza e hidratação profunda",
        duration: "45 minutos", 
        price: "R$ 150,00"
      }
    ],
    packages: [],
    heroImage: "",
    galleryImages: [],
    hours: "Das 9h às 19h",
    benefits: ["Ambiente tranquilo", "Profissionais qualificados", "Produtos premium", "Vista relaxante"]
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_name', 'spa')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching spa content:', error);
          return;
        }
        
        if (data?.content && typeof data.content === 'object') {
          const fetchedContent = data.content as unknown as Partial<SpaContent>;
          setContent(prev => ({
            ...prev,
            ...fetchedContent,
            services: Array.isArray(fetchedContent.services) ? fetchedContent.services : prev.services,
            packages: Array.isArray(fetchedContent.packages) ? fetchedContent.packages : prev.packages,
            galleryImages: Array.isArray(fetchedContent.galleryImages) ? fetchedContent.galleryImages : prev.galleryImages,
            benefits: Array.isArray(fetchedContent.benefits) ? fetchedContent.benefits : prev.benefits
          }));
        }
      } catch (error) {
        console.error('Error in fetchContent:', error);
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
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-paradise-blue mb-3 sm:mb-4">
                    SPA - Paradise Vista do Atlântico
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                    {content.description}
                  </p>
                </div>

                {/* Benefits */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-paradise-blue mb-3 sm:mb-4">
                      Por que escolher nosso SPA:
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {content.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-paradise-blue rounded-full"></div>
                          <span className="text-muted-foreground text-sm sm:text-base">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Services */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-paradise-blue">Nossos Serviços</h3>
                {content.services.map((service, index) => (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm border-2 hover:border-paradise-blue transition-colors">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4">
                          {/* Service Image */}
                          {service.image && (
                            <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                              <img 
                                src={service.image} 
                                alt={service.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Service Video */}
                          {service.video && (
                            <div className="w-full aspect-video rounded-lg overflow-hidden">
                              <video
                                width="100%"
                                height="100%"
                                src={service.video}
                                autoPlay
                                muted
                                loop
                                playsInline
                                controls
                                className="rounded-lg w-full h-full object-cover"
                              >
                                Seu navegador não suporta vídeos.
                              </video>
                            </div>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                            <div className="flex-1">
                              <h4 className="text-base sm:text-lg font-bold text-paradise-blue mb-1 sm:mb-2">{service.name}</h4>
                              <p className="text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2">{service.description}</p>
                              <p className="text-xs text-muted-foreground">Duração: {service.duration}</p>
                            </div>
                            <div className="sm:text-right">
                              <span className="text-lg sm:text-2xl font-bold text-paradise-blue">{service.price}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Packages */}
                {content.packages.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-bold text-paradise-blue">Pacotes Especiais</h3>
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
                            </div>
                          </div>
                          
                          {/* Package includes */}
                          <div className="mb-3 sm:mb-4">
                            <h5 className="font-medium text-xs sm:text-sm mb-2">Incluso no pacote:</h5>
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
                )}

                <Button 
                  variant="paradise" 
                  size="lg" 
                  className="w-full text-sm sm:text-base"
                  onClick={() => window.open('https://wa.me/5582982235336?text=Olá! Gostaria de agendar uma sessão no SPA do Paradise Vista do Atlântico. Poderia me enviar mais informações sobre os tratamentos e horários disponíveis?', '_blank')}
                >
                  Agendar Sessão
                </Button>
                
                {/* Hours */}
                <div className="text-center p-3 sm:p-4 bg-paradise-blue/10 rounded-lg">
                  <p className="text-base sm:text-lg font-semibold text-paradise-blue mb-1">
                    Horário de Funcionamento
                  </p>
                  <p className="text-muted-foreground text-sm sm:text-base">{content.hours}</p>
                </div>
                </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Spa;