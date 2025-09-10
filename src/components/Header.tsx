import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, User, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  const navItems = [
    { label: "INÍCIO", path: "/" },
    { label: "CAFÉ DA MANHÃ", path: "/cafe-da-manha" },
    { label: "HOSPEDAGEM", path: "/hospedagem" },
    { label: "DAY USE", path: "/day-use" },
    { label: "ÁREA VIP", path: "/area-vip" },
    { label: "LOCALIZAÇÃO", path: "/localizacao" },
    { label: "LOJA VIRTUAL", path: "/loja-virtual" },
    { label: "DÚVIDAS", path: "/duvidas" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/lovable-uploads/daa1aeef-50b9-4d65-a7cf-5bbf3ed5851e.png" 
              alt="Paradise Vista do Atlântico Pousada" 
              className="h-12 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="text-sm text-foreground hover:text-paradise-blue transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            {/* Admin Panel Button */}
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            
            {/* Auth Button */}
            <Button 
              variant={user ? "outline" : "paradise"} 
              size="sm"
              onClick={handleAuthClick}
            >
              <User className="w-4 h-4 mr-2" />
              {user ? 'Sair' : 'Entrar'}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-paradise-blue" />
            ) : (
              <Menu className="w-6 h-6 text-paradise-blue" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className="text-sm text-foreground hover:text-paradise-blue transition-colors py-2 text-left"
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Admin Panel Button */}
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit"
                  onClick={() => navigate('/admin')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              
              {/* Mobile Auth Button */}
              <Button 
                variant={user ? "outline" : "paradise"} 
                size="sm" 
                className="w-fit"
                onClick={handleAuthClick}
              >
                <User className="w-4 h-4 mr-2" />
                {user ? 'Sair' : 'Entrar'}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;