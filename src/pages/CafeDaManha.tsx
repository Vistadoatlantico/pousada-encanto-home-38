import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CafeContent {
  title: string;
  subtitle: string;
  description: string;
  hours: string;
  includes: string[];
  price: string;
  image_url: string;
  background_image_url: string | null;
  gallery_images: string[];
}

const CafeDaManha = () => {
  const [content, setContent] = useState<CafeContent>({
    title: "Café da Manhã",
    subtitle: "Comece o dia com sabor",
    description: "Desfrute de um delicioso café da manhã com vista para o mar. Nosso buffet oferece uma variedade de opções frescas e saborosas.",
    hours: "Servido das 7h às 10h",
    includes: ["Frutas frescas", "Pães artesanais", "Café premium", "Sucos naturais"],
    price: "R$ 25,00 por pessoa",
    image_url: "",
    background_image_url: null,
    gallery_images: []
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'cafe_da_manha')
        .maybeSingle();
      
      if (data?.content && typeof data.content === 'object') {
        setContent(prev => ({ ...prev, ...data.content as Partial<CafeContent> }));
      }
      setIsLoading(false);
    };

    fetchContent();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16 sm:pt-20">
        {/* Hero Section with Background Image */}
        <section 
          className="relative h-64 sm:h-80 md:h-96 bg-cover bg-center flex items-center justify-center"
          style={{ 
            backgroundImage: content.background_image_url 
              ? `url(${content.background_image_url})` 
              : 'linear-gradient(135deg, #006994 0%, #00acc1 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4">{content.title}</h1>
            <p className="text-base sm:text-lg md:text-xl">{content.subtitle}</p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 sm:py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            {isLoading ? (
              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start">
                {/* Left Column Skeleton */}
                <Card className="lg:sticky lg:top-24">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    <Skeleton className="h-6 sm:h-8 w-3/4 mb-4 sm:mb-6" />
                    <Skeleton className="h-16 sm:h-20 w-full mb-6 sm:mb-8" />
                    <Skeleton className="h-5 sm:h-6 w-1/2 mb-3 sm:mb-4" />
                    <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                      <Skeleton className="h-3 sm:h-4 w-full" />
                      <Skeleton className="h-3 sm:h-4 w-3/4" />
                      <Skeleton className="h-3 sm:h-4 w-5/6" />
                      <Skeleton className="h-3 sm:h-4 w-2/3" />
                    </div>
                    <div className="border-t pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                      <Skeleton className="h-5 sm:h-6 w-1/2" />
                      <Skeleton className="h-6 sm:h-8 w-1/3" />
                    </div>
                  </CardContent>
                </Card>
                {/* Right Column Skeleton */}
                <div className="space-y-4 sm:space-y-6">
                  <Skeleton className="h-6 sm:h-8 w-1/2" />
                  <Skeleton className="h-64 sm:h-80 md:h-96 w-full" />
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start">
                {/* Left Column - Information */}
                <Card className="lg:sticky lg:top-24">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-paradise-blue mb-4 sm:mb-6">
                      Uma Experiência Completa
                    </h2>
                    <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base md:text-lg leading-relaxed">
                      {content.description}
                    </p>
                    
                    <div className="mb-6 sm:mb-8">
                      <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-paradise-blue">Inclui:</h3>
                      <ul className="space-y-2 sm:space-y-3">
                        {content.includes.map((item, index) => (
                          <li key={index} className="flex items-start sm:items-center">
                            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-paradise-blue rounded-full mr-3 sm:mr-4 flex-shrink-0 mt-1.5 sm:mt-0"></span>
                            <span className="text-sm sm:text-base md:text-lg">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                      <p className="font-semibold text-paradise-blue text-sm sm:text-base md:text-lg flex items-center">
                        <span className="text-base sm:text-lg mr-2">🕐</span>
                        {content.hours}
                      </p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-paradise-blue flex items-center">
                        <span className="text-base sm:text-lg mr-2">💰</span>
                        {content.price}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Right Column - Gallery */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-paradise-blue mb-3 sm:mb-4">
                    Galeria de Fotos
                  </h3>
                  
                  {content.gallery_images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      {content.gallery_images.map((imageUrl, index) => (
                        <div 
                          key={index} 
                          className={`relative overflow-hidden rounded-lg ${
                            index === 0 && content.gallery_images.length > 1 
                              ? 'col-span-2 sm:col-span-2 lg:col-span-2 h-48 sm:h-64 md:h-80 lg:h-96' 
                              : 'h-32 sm:h-40 md:h-48'
                          }`}
                        >
                          <img 
                            src={imageUrl} 
                            alt={`Café da Manhã ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="h-48 sm:h-64 md:h-80 lg:h-96">
                      <CardContent className="h-full flex items-center justify-center p-4">
                        <div className="text-muted-foreground text-center">
                          <span className="block text-3xl sm:text-4xl md:text-6xl mb-2 sm:mb-4">📷</span>
                          <p className="text-sm sm:text-base">
                            Nenhuma imagem disponível ainda.
                          </p>
                          <p className="text-xs sm:text-sm mt-1 sm:mt-2">
                            As imagens podem ser adicionadas pelo painel administrativo.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CafeDaManha;