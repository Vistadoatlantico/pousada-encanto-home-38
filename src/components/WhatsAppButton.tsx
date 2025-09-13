import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const message = "Olá! Gostaria de saber mais informações sobre os serviços do Paradise Vista do Atlântico.";
    const phoneNumber = "5582982235336";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center px-4 animate-bounce"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle size={24} className="mr-2" />
      <span className="font-semibold">Chame no WhatsApp</span>
    </Button>
  );
};

export default WhatsAppButton;
