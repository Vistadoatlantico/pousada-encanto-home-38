import { Button } from "@/components/ui/button";
import InteractiveMap from "@/components/InteractiveMap";

const LocationSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-paradise-light-blue/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-paradise-blue mb-8">
            Nossa Localização
          </h2>
          
          <Button 
            variant="paradise" 
            size="lg" 
            className="mb-8"
            onClick={() => window.open('https://www.google.com/maps/place/Paradise+Vista+do+Atl%C3%A2ntico/data=!4m2!3m1!1s0x0:0x3f033a2b86a6f41b?sa=X&ved=1t:2428&ictx=111', '_blank')}
          >
            VEJA COMO CHEGAR →
          </Button>

          {/* Interactive Map */}
          <div className="mb-8">
            <InteractiveMap 
              latitude={-9.617832}
              longitude={-35.699257}
              zoom={16}
              height="400px"
            />
          </div>
          
          {/* Location Info */}
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-paradise-blue mb-2">
              Paradise Vista do Atlântico
            </h3>
            <p className="text-muted-foreground">
              R. Vista do Atlântico, Quadra 02, Tv<br/>
              09, Jacarecica, Maceió - AL, 57038<br/>
              4.2 ⭐⭐⭐⭐ • 1.204 avaliações
            </p>
          </div>

          <div className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            <p>
              Pousada Paradise Vista do Atlântico oferece acomodação, restaurante, piscina ao ar livre, 
              jardim e bar. Praia de Jacarecica fica a 2,5 km de distância. Pousada Paradise Vista do Atlântico 
              disponibiliza Wi-Fi e estacionamento privativo de graça. Existe um espaço kids que oferece 
              diversas atividades, bem como um parquinho infantil. Pousada Paradise Vista do Atlântico fica 
              a 6,3 km do Terminal Rodoviário de Maceió e a 8,1 km de Piscinas Naturais da Praia de 
              Pajuçara. O Aeroporto de Aeroporto Internacional de Maceió - Zumbi Dos Palmares fica a 21 
              km de acomodação.
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-paradise-blue font-semibold">E-mail:</p>
            <p className="text-muted-foreground">diretoria@pousadavistadoatlantico.com.br</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;