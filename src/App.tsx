import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WhatsAppButton from "@/components/WhatsAppButton";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import CafeDaManha from "./pages/CafeDaManha";
import Hospedagem from "./pages/Hospedagem";
import DayUse from "./pages/DayUse";
import AreaVip from "./pages/AreaVip";
import Localizacao from "./pages/Localizacao";
import LojaVirtual from "./pages/LojaVirtual";
import Duvidas from "./pages/Duvidas";
import Depoimentos from "./pages/Depoimentos";
import Galeria from "./pages/Galeria";
import BarRestaurante from "./pages/BarRestaurante";
import Spa from "./pages/Spa";
import Servicos from "./pages/Servicos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cafe-da-manha" element={<CafeDaManha />} />
          <Route path="/hospedagem" element={<Hospedagem />} />
          <Route path="/day-use" element={<DayUse />} />
          <Route path="/area-vip" element={<AreaVip />} />
          <Route path="/localizacao" element={<Localizacao />} />
          <Route path="/loja-virtual" element={<LojaVirtual />} />
          <Route path="/duvidas" element={<Duvidas />} />
          <Route path="/depoimentos" element={<Depoimentos />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/bar-restaurante" element={<BarRestaurante />} />
          <Route path="/spa" element={<Spa />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsAppButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
