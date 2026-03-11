import { Home, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-6 w-6 text-coral" />
              <span className="text-xl font-bold text-background font-display">ImovelJá</span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed">
              A plataforma que inverte o jogo imobiliário em São Luís. Você diz o que quer, corretores competem para entregar.
            </p>
          </div>

          <div>
            <h4 className="text-background font-semibold mb-4 font-display">Links</h4>
            <ul className="space-y-2 text-background/60 text-sm">
              <li><a href="#como-funciona" className="hover:text-coral transition-colors">Como funciona</a></li>
              <li><a href="#publicar" className="hover:text-coral transition-colors">Publicar pedido</a></li>
              <li><a href="#corretores" className="hover:text-coral transition-colors">Corretores</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-background font-semibold mb-4 font-display">Contato</h4>
            <div className="space-y-3 text-background/60 text-sm">
              <a href="mailto:contato@imoveljaslz.com" className="flex items-center gap-2 hover:text-coral transition-colors">
                <Mail className="h-4 w-4" /> contato@imoveljaslz.com
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-coral transition-colors">
                <Instagram className="h-4 w-4" /> @imoveljaslz
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center text-background/40 text-sm">
          © {new Date().getFullYear()} ImovelJá São Luís. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
