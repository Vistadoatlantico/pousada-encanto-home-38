import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: 'photo' | 'video';
  category: string;
  display_order: number;
  is_active: boolean;
}

interface GaleriaContent {
  title: string;
  subtitle: string;
  description: string;
  background_image?: string;
}

const Galeria = () => {
  const [content, setContent] = useState<GaleriaContent>({
    title: "Galeria",
    subtitle: "Conheça nossos espaços",
    description: "Explore as belezas e comodidades que o Hotel Paradise tem a oferecer"
  });
  
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'photo' | 'video' } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchContent(), fetchGalleryItems()]).finally(() => setIsLoading(false));
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_name', 'galeria')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.content && typeof data.content === 'object') {
        const fetchedContent = data.content as any;
        setContent(prev => ({
          ...prev,
          title: fetchedContent.title || prev.title,
          subtitle: fetchedContent.subtitle || prev.subtitle,
          description: fetchedContent.description || prev.description,
          background_image: fetchedContent.background_image || prev.background_image
        }));
      }
    } catch (error) {
      console.error('Error fetching galeria content:', error);
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setGalleryItems((data || []) as GalleryItem[]);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    }
  };

  const getFilteredItems = () => {
    if (selectedCategory === "Todas") {
      return galleryItems;
    }
    return galleryItems.filter(item => item.category === selectedCategory);
  };

  const categories = ["Todas", ...Array.from(new Set(galleryItems.map(item => item.category)))];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-paradise-blue">Carregando galeria...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 md:pb-24 bg-gradient-to-r from-paradise-blue to-accent">
        {content.background_image && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${content.background_image})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        )}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">{content.title}</h1>
          <p className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4">{content.subtitle}</p>
          <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto">{content.description}</p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-6 sm:py-8 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 text-xs sm:text-sm ${
                  selectedCategory === category
                    ? "bg-paradise-blue text-white shadow-lg"
                    : "bg-white border border-paradise-blue text-paradise-blue hover:bg-paradise-blue hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-8 sm:py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          {getFilteredItems().length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {getFilteredItems().map((item, index) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group shadow-card hover:shadow-lg transition-all duration-300"
                  onClick={() => setSelectedMedia({ url: item.media_url, type: item.media_type })}
                >
                  {item.media_type === 'photo' ? (
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.media_type === 'photo' ? (
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm5 3a2 2 0 11-4 0 2 2 0 014 0zm4.5 6.5L9.5 10 8 11.5 6.5 10 3 13.5h14l-4.5-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.category}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-paradise-blue mb-3 sm:mb-4">
                Em breve nossa galeria estará completa
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Estamos preparando as melhores imagens dos nossos espaços para você.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Media Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-0">
          {selectedMedia && (
            selectedMedia.type === 'photo' ? (
              <img
                src={selectedMedia.url}
                alt="Imagem ampliada"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain rounded-lg"
              />
            )
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Galeria;