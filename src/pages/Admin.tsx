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

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-paradise-blue/20 via-paradise-light-blue/10 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-paradise-blue">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie o conteúdo do site Paradise Vista do Atlântico</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Ver Site
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              Sair
            </Button>
          </div>
        </div>

        <Tabs defaultValue="birthday" className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="birthday">Aniversariantes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="accommodation">Hospedagem</TabsTrigger>
              <TabsTrigger value="store">Loja Virtual</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="birthday" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reservas de Aniversariantes</CardTitle>
                <CardDescription>Gerencie as reservas especiais para aniversariantes</CardDescription>
              </CardHeader>
              <CardContent>
                <BirthdayReservationsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics de Visitantes</CardTitle>
                <CardDescription>Veja estatísticas de visitantes por estado baseado no IP</CardDescription>
              </CardHeader>
              <CardContent>
                <VisitorAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Conteúdo</CardTitle>
                <CardDescription>Gerencie páginas, carrossel e imagens de fundo</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pages" className="space-y-4">
                  <div className="overflow-x-auto pb-2">
                    <TabsList>
                      <TabsTrigger value="pages">Editor de Páginas</TabsTrigger>
                      <TabsTrigger value="gallery">Galeria</TabsTrigger>
                      <TabsTrigger value="carousel">Carrossel</TabsTrigger>
                      <TabsTrigger value="backgrounds">Imagens de Fundo</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="pages">
                    <PagesEditor />
                  </TabsContent>
                  
                  <TabsContent value="gallery">
                    <MainGalleryManager />
                  </TabsContent>
                  
                  <TabsContent value="carousel">
                    <CarouselManager />
                  </TabsContent>
                  
                  <TabsContent value="backgrounds">
                    <PageBackgroundManager />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Serviços</CardTitle>
                <CardDescription>Gerencie serviços, Day Use e reservas especiais</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="services-list" className="space-y-4">
                  <div className="overflow-x-auto pb-2">
                    <TabsList>
                      <TabsTrigger value="services-list">Lista de Serviços</TabsTrigger>
                      <TabsTrigger value="services-page">Página de Serviços</TabsTrigger>
                      <TabsTrigger value="spa">SPA</TabsTrigger>
                      <TabsTrigger value="area-vip">Área VIP</TabsTrigger>
                      <TabsTrigger value="bar-restaurante">Bar & Restaurante</TabsTrigger>
                      <TabsTrigger value="dayuse">Day Use</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="services-list">
                    <ServicesManager />
                  </TabsContent>
                  
                  <TabsContent value="services-page">
                    <ServicesPageManager />
                  </TabsContent>
                  
                  <TabsContent value="spa">
                    <SpaManager />
                  </TabsContent>
                  
                  <TabsContent value="area-vip">
                    <AreaVipManager />
                  </TabsContent>
                  
                  <TabsContent value="bar-restaurante">
                    <BarRestauranteManager />
                  </TabsContent>
                  
                  <TabsContent value="dayuse">
                    <DayUseManager />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accommodation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hospedagem</CardTitle>
                <CardDescription>Gerencie quartos e conteúdo de hospedagem</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="rooms" className="space-y-4">
                  <div className="overflow-x-auto pb-2">
                    <TabsList>
                      <TabsTrigger value="rooms">Quartos</TabsTrigger>
                      <TabsTrigger value="hospedagem-content">Conteúdo da Página</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="rooms">
                    <RoomsManager />
                  </TabsContent>
                  
                  <TabsContent value="hospedagem-content">
                    <HospedagemManager />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Loja Virtual</CardTitle>
                <CardDescription>Gerencie categorias e produtos da loja</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="config" className="space-y-4">
                  <div className="overflow-x-auto pb-2">
                    <TabsList>
                      <TabsTrigger value="config">Configurações</TabsTrigger>
                      <TabsTrigger value="categories">Categorias</TabsTrigger>
                      <TabsTrigger value="products">Produtos</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="config">
                    <StoreConfigManager />
                  </TabsContent>
                  
                  <TabsContent value="categories">
                    <CategoriesManager />
                  </TabsContent>
                  
                  <TabsContent value="products">
                    <ProductsManager />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>Configurações gerais e localização</CardDescription>
              </CardHeader>
              <CardContent>
                <LocationManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
