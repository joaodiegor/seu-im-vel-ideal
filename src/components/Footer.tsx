import { Instagram, Mail, ShieldAlert } from "lucide-react";

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
                <a href="#como-funciona" className="hover:text-coral transition-colors">
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#publicar" className="hover:text-coral transition-colors">
                  Publicar pedido
                </a>
              </li>
              <li>
                <a href="#corretores" className="hover:text-coral transition-colors">
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

        {/* Aviso Legal */}
        <div className="border-t border-background/10 mt-12 pt-8">
          <div className="flex items-start gap-3 mb-6 p-4 rounded-lg bg-background/5 border border-background/10">
            <ShieldAlert className="h-5 w-5 text-coral mt-0.5 shrink-0" />
            <div className="text-background/60 text-xs leading-relaxed space-y-2">
              <p>
                As propostas enviadas por corretores são de inteira responsabilidade dos próprios profissionais. A plataforma atua apenas como intermediadora de contato e não se responsabiliza pela veracidade, condições ou cumprimento das ofertas apresentadas.
              </p>
              <p>
                Recomendamos que o comprador verifique atentamente todas as informações antes de qualquer negociação, incluindo a regularidade do corretor responsável. Para sua segurança, consulte o registro do corretor no site oficial do{" "}
                <a href="https://www.crecima.gov.br/2025/10/14/buscar-por-corretor/" target="_blank" rel="noopener noreferrer" className="text-coral underline hover:text-coral/80 transition-colors">
                  CRECI-MA
                </a>.
              </p>
              <p>Ao utilizar a plataforma, você declara estar ciente e de acordo com essas condições.</p>
            </div>
          </div>
          <p className="text-center text-background/40 text-sm">
            © {new Date().getFullYear()} SLZ Imóveis. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
