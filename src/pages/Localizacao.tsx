import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InteractiveMap from "@/components/InteractiveMap";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Car } from "lucide-react";

interface LocationContent {
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  directions: string[];
  landmarks: string[];
}

const Localizacao = () => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [content, setContent] = useState<LocationContent>({
    title: "Localização",
    subtitle: "Fácil acesso e vista privilegiada",
    address: "Rua da Praia, 123 - Beira Mar, Cidade - Estado",
    phone: "(11) 99999-9999",
    email: "contato@paradise.com.br",
    hours: "Todos os dias das 7h às 22h",
    directions: [
      "Pela BR-101, saia no km 125",
      "Siga por 5km até a orla",
      "Vire à direita na Rua da Praia",
      "O Paradise Vista do Atlântico estará à sua esquerda"
    ],
    landmarks: [
      "Próximo ao Farol da Cidade",
      "500m da Praça Central",
      "1km do Shopping Mar Azul",
      "Em frente à Praia dos Coqueiros"
    ]
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Buscar conteúdo da página
        const { data } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_name', 'localizacao')
          .maybeSingle();
        
        if (data?.content && typeof data.content === 'object') {
          const content = data.content as any;
          setContent(prev => ({ ...prev, ...content as Partial<LocationContent> }));
          
          // Buscar imagem de fundo
          if (content.heroImage || content.background_image) {
            setBackgroundImage(content.heroImage || content.background_image);
          }
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section 
          className="relative h-96 bg-cover bg-center bg-gray-300 flex items-center justify-center"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{content.title}</h1>
            <p className="text-xl">{content.subtitle}</p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-paradise-blue mb-4">
                      Informações de Contato
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-paradise-blue mt-0.5" />
                        <div>
                          <p className="font-medium">Endereço</p>
                          <p className="text-muted-foreground">{content.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-paradise-blue mt-0.5" />
                        <div>
                          <p className="font-medium">Telefone</p>
                          <p className="text-muted-foreground">{content.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-paradise-blue mt-0.5" />
                        <div>
                          <p className="font-medium">Horário de Funcionamento</p>
                          <p className="text-muted-foreground">{content.hours}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Map and Landmarks */}
              <div className="space-y-8">
                {/* Interactive Map */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-paradise-blue mb-4">
                      Mapa Interativo
                    </h3>
                    <InteractiveMap 
                      latitude={-9.617832}
                      longitude={-35.699257}
                      zoom={16}
                      height="300px"
                    />
                  </CardContent>
                </Card>

                {/* Landmarks */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-paradise-blue mb-4">
                      Pontos de Referência
                    </h3>
                    
                    <ul className="space-y-3">
                      {content.landmarks.map((landmark, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <span className="w-2 h-2 bg-paradise-blue rounded-full"></span>
                          <span className="text-muted-foreground">{landmark}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Localizacao;