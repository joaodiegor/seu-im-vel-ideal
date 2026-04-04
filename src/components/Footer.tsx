import { Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/logo.png" alt="SLZ Imóveis" />
            </div>
            <p className="text-background/60 text-sm leading-relaxed">
              A plataforma que inverte o jogo imobiliário em São Luís. Você diz o que quer, corretores competem para
              entregar.
            </p>
          </div>

          <div>
            <h4 className="text-background font-semibold mb-4 font-display">Links</h4>
            <ul className="space-y-2 text-background/60 text-sm">
              <li>
                <a href="/#como-funciona" className="hover:text-coral transition-colors">
                  Como funciona
                </a>
              </li>
              <li>
                <a href="/#publicar" className="hover:text-coral transition-colors">
                  Publicar pedido
                </a>
              </li>
              <li>
                <a href="/corretores" className="hover:text-coral transition-colors">
                  Corretores
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-background font-semibold mb-4 font-display">Contato</h4>
            <div className="space-y-3 text-background/60 text-sm">
              <a
                href="mailto:contato@slzimoveis.com.br"
                className="flex items-center gap-2 hover:text-coral transition-colors"
              >
                <Mail className="h-4 w-4" /> contato@slzimoveis.com.br
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-coral transition-colors">
                <Instagram className="h-4 w-4" /> @slzimoveis
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/40 text-sm">
              © {new Date().getFullYear()} SLZ Imóveis. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-background/60 text-sm">
              <a href="/politica-de-privacidade" className="hover:text-coral transition-colors">
                Política de Privacidade
              </a>
              <a href="/termos-de-uso" className="hover:text-coral transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
