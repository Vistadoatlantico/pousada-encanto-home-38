import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  location?: string;
}

interface DepoimentosContent {
  title: string;
  subtitle: string;
  description: string;
  background_image?: string;
  testimonials: Testimonial[];
}

const Depoimentos = () => {
  const [content, setContent] = useState<DepoimentosContent>({
    title: "Depoimentos",
    subtitle: "O que nossos hóspedes dizem",
    description: "Confira as experiências de quem já viveu momentos especiais conosco",
    testimonials: []
  });

  useEffect(() => {
    // Content will be added later when needed
  }, []);


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

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

      {/* Testimonials Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          {content.testimonials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {content.testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="h-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-1 mb-3 sm:mb-4">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-muted-foreground mb-3 sm:mb-4 italic text-sm sm:text-base">
                      "{testimonial.comment}"
                    </p>
                    <div className="border-t pt-3 sm:pt-4">
                      <p className="font-semibold text-paradise-blue text-sm sm:text-base">{testimonial.name}</p>
                      {testimonial.location && (
                        <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.location}</p>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.date}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-paradise-blue mb-3 sm:mb-4">
                Em breve você verá aqui os depoimentos dos nossos hóspedes
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Estamos coletando as experiências de quem já viveu momentos especiais conosco.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Depoimentos;