const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-paradise-blue to-paradise-deep-blue text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Contact */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Paradise</h3>
                <p className="text-sm opacity-90">Sua experiência única em Maceió!</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p>📧 diretoria@pousadavistadoatlantico.com.br</p>
              <p>📞 (82) 982235336</p>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-paradise-light-blue transition-colors">Início</a></li>
              <li><a href="#" className="hover:text-paradise-light-blue transition-colors">Quartos</a></li>
              <li><a href="#" className="hover:text-paradise-light-blue transition-colors">Galeria</a></li>
              <li><a href="#" className="hover:text-paradise-light-blue transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-4">Serviços</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-paradise-light-blue transition-colors">Hospedagem</a></li>
              <li><a href="#" className="hover:text-paradise-light-blue transition-colors">Day Use</a></li>
              <li><a href="#" className="hover:text-paradise-light-blue transition-colors">Restaurante / Bar</a></li>
              <li><a href="#" className="hover:text-paradise-light-blue transition-colors">Área Vip</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm opacity-75">
          <p>© 2024 Paradise Vista do Atlântico. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;