import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PagesEditor from '@/components/admin/PagesEditor';
import ServicesManager from '@/components/admin/ServicesManager';
import ServicesPageManager from '@/components/admin/ServicesPageManager';
import DayUseManager from '@/components/admin/DayUseManager';
import CarouselManager from '@/components/admin/CarouselManager';
import BirthdayReservationsManager from '@/components/admin/BirthdayReservationsManager';
import BirthdayModalManager from '@/components/admin/BirthdayModalManager';
import LocationManager from '@/components/admin/LocationManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import ProductsManager from '@/components/admin/ProductsManager';
import RoomsManager from '@/components/admin/RoomsManager';
import HospedagemManager from '@/components/admin/HospedagemManager';
import PageBackgroundManager from '@/components/admin/PageBackgroundManager';
import SpaManager from '@/components/admin/SpaManager';
import AreaVipManager from '@/components/admin/AreaVipManager';
import MainGalleryManager from '@/components/admin/MainGalleryManager';
import BarRestauranteManager from '@/components/admin/BarRestauranteManager';
import StoreConfigManager from '@/components/admin/StoreConfigManager';
import { VisitorAnalytics } from '@/components/admin/VisitorAnalytics';

const AdminHeader = ({ onSignOut }) => (
  <header 
    className="mb-8 p-6 rounded-lg shadow-lg" 
  >
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-black">Painel Administrativo</h1>
        <p className="text-black/90">Gerencie o conteúdo do site Paradise Vista do Atlântico.</p>
      </div>
      <div className="flex space-x-4">
        <Button variant="outline" onClick={() => window.open('/', '_blank')}>Ver Site</Button>
        <Button variant="destructive" onClick={onSignOut}>Sair</Button>
      </div>
    </div>
  </header>
);

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <AdminHeader onSignOut={handleSignOut} />

        <Tabs defaultValue="birthday" className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7">
              <TabsTrigger value="birthday">Aniversários</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="accommodation">Hospedagem</TabsTrigger>
              <TabsTrigger value="store">Loja</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
          </div>

          {/* Sub-tabs for each main tab are now inside their respective cards for better organization */}
          <TabsContent value="birthday">
            <Card>
              <CardHeader>
                <CardTitle>Promoção de Aniversariantes</CardTitle>
                <CardDescription>Gerencie as reservas e o modal da promoção.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="reservations">
                  <TabsList>
                    <TabsTrigger value="reservations">Reservas</TabsTrigger>
                    <TabsTrigger value="modal-config">Config. Modal</TabsTrigger>
                  </TabsList>
                  <TabsContent value="reservations" className="pt-4"><BirthdayReservationsManager /></TabsContent>
                  <TabsContent value="modal-config" className="pt-4"><BirthdayModalManager /></TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Estatísticas de visitantes por estado.</CardDescription>
              </CardHeader>
              <CardContent><VisitorAnalytics /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Conteúdo</CardTitle>
                <CardDescription>Gerencie páginas, carrossel e mídias.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pages">
                   <TabsList className="grid grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="pages">Páginas</TabsTrigger>
                    <TabsTrigger value="gallery">Galeria</TabsTrigger>
                    <TabsTrigger value="carousel">Carrossel</TabsTrigger>
                    <TabsTrigger value="backgrounds">Fundos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pages" className="pt-4"><PagesEditor /></TabsContent>
                  <TabsContent value="gallery" className="pt-4"><MainGalleryManager /></TabsContent>
                  <TabsContent value="carousel" className="pt-4"><CarouselManager /></TabsContent>
                  <TabsContent value="backgrounds" className="pt-4"><PageBackgroundManager /></TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Serviços</CardTitle>
                <CardDescription>Gerencie todos os serviços e áreas especiais.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="services-list">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
                    <TabsTrigger value="services-list">Serviços</TabsTrigger>
                    <TabsTrigger value="services-page">Pág. Serviços</TabsTrigger>
                    <TabsTrigger value="spa">SPA</TabsTrigger>
                    <TabsTrigger value="area-vip">Área VIP</TabsTrigger>
                    <TabsTrigger value="bar-restaurante">Bar/Restaurante</TabsTrigger>
                    <TabsTrigger value="dayuse">Day Use</TabsTrigger>
                  </TabsList>
                  <TabsContent value="services-list" className="pt-4"><ServicesManager /></TabsContent>
                  <TabsContent value="services-page" className="pt-4"><ServicesPageManager /></TabsContent>
                  <TabsContent value="spa" className="pt-4"><SpaManager /></TabsContent>
                  <TabsContent value="area-vip" className="pt-4"><AreaVipManager /></TabsContent>
                  <TabsContent value="bar-restaurante" className="pt-4"><BarRestauranteManager /></TabsContent>
                  <TabsContent value="dayuse" className="pt-4"><DayUseManager /></TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accommodation">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Hospedagem</CardTitle>
                <CardDescription>Gerencie os quartos e o conteúdo da página.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="rooms">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="rooms">Quartos</TabsTrigger>
                    <TabsTrigger value="hospedagem-content">Conteúdo Página</TabsTrigger>
                  </TabsList>
                  <TabsContent value="rooms" className="pt-4"><RoomsManager /></TabsContent>
                  <TabsContent value="hospedagem-content" className="pt-4"><HospedagemManager /></TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Gestão da Loja Virtual</CardTitle>
                <CardDescription>Gerencie configurações, categorias e produtos.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="config">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="config">Configurações</TabsTrigger>
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="products">Produtos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="config" className="pt-4"><StoreConfigManager /></TabsContent>
                  <TabsContent value="categories" className="pt-4"><CategoriesManager /></TabsContent>
                  <TabsContent value="products" className="pt-4"><ProductsManager /></TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Ajustes de localização e outras configurações globais.</CardDescription>
              </CardHeader>
              <CardContent><LocationManager /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
