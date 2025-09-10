import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ChevronDown, ChevronUp } from "lucide-react";
import ReservationModal from "@/components/ReservationModal";

interface HospedagemContent {
  title: string;
  subtitle: string;
  description: string;
  heroImage?: string;
  features: string[];
}

interface Room {
  id: string;
  name: string;
  description: string;
  price: string;
  amenities: string[];
  images: string[];
  is_active: boolean;
}

const Hospedagem = () => {
  const [content, setContent] = useState<HospedagemContent>({
    title: "Hospedagem",
    subtitle: "Conforto e tranquilidade com vista para o mar",
    description: "Quartos aconchegantes com todas as comodidades para uma estadia perfeita.",
    features: ["Vista para o mar", "Ar condicionado", "Wi-Fi gratuito", "TV a cabo"]
  });
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'hospedagem')
        .single();
      
      if (data?.content && typeof data.content === 'object') {
        setContent(prev => ({ ...prev, ...data.content as Partial<HospedagemContent> }));
      }
    };

    const fetchRooms = async () => {
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (data) {
        setRooms(data);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchContent(), fetchRooms()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const toggleRoomExpansion = (roomId: string) => {
    const newExpandedRooms = new Set(expandedRooms);
    if (newExpandedRooms.has(roomId)) {
      newExpandedRooms.delete(roomId);
    } else {
      newExpandedRooms.add(roomId);
    }
    setExpandedRooms(newExpandedRooms);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section 
          className="relative h-96 bg-cover bg-center bg-gray-300 flex items-center justify-center"
          style={{
            backgroundImage: content.heroImage 
              ? `url(${content.heroImage})` 
              : undefined
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{content.title}</h1>
            <p className="text-xl">{content.subtitle}</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-paradise-blue mb-4">
                Nossas Acomodações
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {content.description}
              </p>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-12">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <Skeleton className="aspect-video rounded-lg mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="mb-4">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-2/3" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                rooms.map((room) => {
                  const isExpanded = expandedRooms.has(room.id);
                  const visibleAmenities = isExpanded ? room.amenities : room.amenities.slice(0, 3);
                  const hasMoreAmenities = room.amenities.length > 3;
                  
                  return (
                    <Card key={room.id} className="h-full">
                      <CardContent className="p-3 sm:p-4 h-full flex flex-col">
                        {/* Room Image - Carousel */}
                        {room.images.length > 0 ? (
                          <div className="aspect-[4/3] sm:aspect-[4/2.5] rounded-lg mb-3 overflow-hidden">
                            {room.images.length === 1 ? (
                              <img 
                                src={room.images[0]} 
                                alt={room.name}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setSelectedImage(room.images[0])}
                              />
                            ) : (
                              <Carousel 
                                className="w-full h-full"
                                plugins={[Autoplay({ delay: 3000 })]}
                                opts={{
                                  align: "start",
                                  loop: true,
                                }}
                              >
                                <CarouselContent>
                                  {room.images.map((image, idx) => (
                                    <CarouselItem key={idx}>
                                      <img 
                                        src={image} 
                                        alt={`${room.name} - Foto ${idx + 1}`}
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => setSelectedImage(image)}
                                      />
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-1 w-6 h-6" />
                                <CarouselNext className="right-1 w-6 h-6" />
                              </Carousel>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-[4/3] sm:aspect-[4/2.5] bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">{room.name}</span>
                          </div>
                        )}
                        
                        {/* Room Name - Smaller */}
                        <h3 className="text-xs sm:text-sm font-bold text-paradise-blue mb-2 text-center">
                          {room.name}
                        </h3>
                        
                        {/* Room Description - Brief */}
                        <p className="text-xs text-muted-foreground mb-3 text-center line-clamp-2">
                          {room.description}
                        </p>
                        
                        {/* Amenities - Expandable */}
                        <div className="mb-3 flex-grow">
                          <h4 className="font-semibold mb-2 text-xs">Comodidades:</h4>
                          <ul className="space-y-1">
                            {visibleAmenities.map((amenity, idx) => (
                              <li key={idx} className="flex items-center text-xs">
                                <span className="w-1 h-1 bg-paradise-blue rounded-full mr-2 flex-shrink-0"></span>
                                <span className="break-words">{amenity}</span>
                              </li>
                            ))}
                          </ul>
                          
                          {/* Ver mais button */}
                          {hasMoreAmenities && (
                            <button
                              onClick={() => toggleRoomExpansion(room.id)}
                              className="flex items-center text-xs text-paradise-blue mt-2 hover:underline"
                            >
                              {isExpanded ? (
                                <>
                                  <span>Ver menos</span>
                                  <ChevronUp className="w-3 h-3 ml-1" />
                                </>
                              ) : (
                                <>
                                  <span>+{room.amenities.length - 3} mais</span>
                                  <ChevronDown className="w-3 h-3 ml-1" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {/* Price and Button */}
                        <div className="mt-auto">
                          <div className="text-center mb-2">
                            <span className="text-sm font-bold text-paradise-blue">
                              {room.price}
                            </span>
                          </div>
                          <Button 
                            variant="paradise" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => setIsReservationModalOpen(true)}
                          >
                            Ver Disponibilidade
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* General Features */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-paradise-blue mb-6 text-center">
                  Facilidades Incluídas
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  {content.features.map((feature, index) => (
                    <div key={index} className="text-center p-2 sm:p-4 border rounded-lg">
                      <span className="text-paradise-blue font-medium text-xs sm:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Fullscreen Image Modal */}
        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 border-0">
              <div className="relative w-full h-full flex items-center justify-center bg-black/90">
                <img 
                  src={selectedImage} 
                  alt="Imagem em tela cheia"
                  className="max-w-full max-h-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                  onClick={() => setSelectedImage(null)}
                >
                  ✕
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Reservation Modal */}
        <ReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          title="Consultar Disponibilidade"
          reservationUrl="https://reservations3.fasthotel.com.br/162/185"
        />
      </main>
      <Footer />
    </div>
  );
};

export default Hospedagem;