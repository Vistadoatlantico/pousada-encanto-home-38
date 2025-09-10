import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Mail } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface PageContent {
  title?: string;
  subtitle?: string;
  faq_description?: string;
  contact_title?: string;
  contact_description?: string;
  contact_email?: string;
  whatsapp?: string;
  phone?: string;
  background_image_url?: string;
  heroImage?: string;
  background_image?: string;
  faqs?: FAQ[];
}

const Duvidas = () => {
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_name', 'duvidas')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching content:', error);
        } else if (data?.content && typeof data.content === 'object') {
          setContent(data.content as PageContent);
        } else {
          // Set default content if none exists
          setContent({
            title: 'Dúvidas',
            subtitle: 'Encontre respostas para as perguntas mais frequentes',
            faq_description: 'Tire suas dúvidas antes de sua visita ao Paradise Vista do Atlântico',
            contact_title: 'Não encontrou sua resposta?',
            contact_description: 'Entre em contato conosco e teremos prazer em ajudá-lo',
            contact_email: 'diretoria@pousadavistadoatlantico.com.br',
            whatsapp: '5582982235336',
            phone: '5582982235336',
            faqs: [
              {
                id: "1",
                question: "Qual é o horário de funcionamento?",
                answer: "Funcionamos das 8h às 22h todos os dias da semana.",
                category: "geral"
              },
              {
                id: "2", 
                question: "Preciso fazer reserva?",
                answer: "Recomendamos fazer reserva, especialmente em finais de semana e feriados.",
                category: "reservas"
              },
              {
                id: "3",
                question: "Qual é a política de cancelamento?",
                answer: "Cancelamentos podem ser feitos até 24h antes sem cobrança de taxa.",
                category: "reservas"
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const faqs = content.faqs || [];
  const groupedFAQs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const categoryLabels: Record<string, string> = {
    geral: 'Geral',
    reservas: 'Reservas',
    hospedagem: 'Hospedagem',
    servicos: 'Serviços',
    dayuse: 'Day Use',
    pagamento: 'Pagamento'
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section 
          className="relative h-96 bg-cover bg-center bg-gray-300 flex items-center justify-center"
          style={{
            backgroundImage: (content.heroImage || content.background_image || content.background_image_url) ? 
              `url(${content.heroImage || content.background_image || content.background_image_url})` : undefined
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{content.title || 'Dúvidas'}</h1>
            <p className="text-xl">{content.subtitle || 'Encontre respostas para as perguntas mais frequentes'}</p>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-paradise-blue mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-muted-foreground">
                {content.faq_description || 'Tire suas dúvidas antes de sua visita ao Paradise Vista do Atlântico'}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando perguntas...</p>
              </div>
            ) : Object.keys(groupedFAQs).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma pergunta disponível no momento.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
                  <Card key={category}>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-paradise-blue mb-4 capitalize">
                        {categoryLabels[category] || category}
                      </h3>
                      <Accordion type="single" collapsible className="space-y-2">
                        {categoryFAQs.map((faq) => (
                          <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger className="text-left hover:text-paradise-blue">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Contact Section */}
            <Card className="mt-12">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-paradise-blue mb-4">
                    {content.contact_title || 'Não encontrou sua resposta?'}
                  </h3>
                  <p className="text-muted-foreground">
                    {content.contact_description || 'Entre em contato conosco e teremos prazer em ajudá-lo'}
                  </p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-paradise-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-paradise-blue" />
                    </div>
                    <h4 className="font-semibold mb-2">WhatsApp</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Resposta rápida e direta
                    </p>
                    <Button 
                      variant="paradise" 
                      size="sm"
                      onClick={() => window.open(`https://wa.me/${content.whatsapp || '5582982235336'}?text=Olá! Gostaria de tirar algumas dúvidas sobre os serviços do Paradise Vista do Atlântico.`, '_blank')}
                    >
                      Chamar no WhatsApp
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-paradise-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-8 h-8 text-paradise-blue" />
                    </div>
                    <h4 className="font-semibold mb-2">Telefone</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {content.phone ? `(${content.phone.slice(2, 4)}) ${content.phone.slice(4, 9)}-${content.phone.slice(9)}` : '(82) 98223-5336'}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`tel:${content.phone || '5582982235336'}`, '_self')}
                    >
                      Ligar Agora
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-paradise-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-paradise-blue" />
                    </div>
                    <h4 className="font-semibold mb-2">E-mail</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {content.contact_email || 'diretoria@pousadavistadoatlantico.com.br'}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`mailto:${content.contact_email || 'diretoria@pousadavistadoatlantico.com.br'}`, '_self')}
                    >
                      Enviar E-mail
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Duvidas;