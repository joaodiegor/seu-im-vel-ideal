const TermosUso = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold font-display text-foreground mb-8">Termos de Uso</h1>
        
        <div className="prose prose-sm text-foreground/80 space-y-6">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
          <p>Ao utilizar a plataforma Brazuka Imóveis, você concorda com estes Termos de Uso. Caso não concorde, não utilize a plataforma.</p>

          <h2 className="text-xl font-semibold text-foreground">2. Descrição do Serviço</h2>
          <p>A Brazuka Imóveis é uma plataforma que conecta compradores de imóveis a corretores em todo o Brasil. Compradores publicam pedidos com suas necessidades e corretores enviam propostas de imóveis compatíveis.</p>

          <h2 className="text-xl font-semibold text-foreground">3. Responsabilidades da Plataforma</h2>
          <p>A plataforma atua exclusivamente como intermediadora de contato. Não nos responsabilizamos pela veracidade, condições ou cumprimento das propostas enviadas por corretores. As propostas são de inteira responsabilidade dos profissionais que as enviam.</p>

          <h2 className="text-xl font-semibold text-foreground">4. Responsabilidades do Usuário</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fornecer informações verdadeiras e atualizadas;</li>
            <li>Não utilizar a plataforma para fins ilegais ou fraudulentos;</li>
            <li>Verificar a regularidade do corretor junto ao CRECI-MA antes de qualquer negociação;</li>
            <li>Manter a confidencialidade de suas credenciais de acesso.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">5. Cadastro de Corretores</h2>
          <p>Corretores devem possuir registro válido no CRECI para utilizar a plataforma. A plataforma reserva-se o direito de suspender ou excluir contas que não atendam a este requisito.</p>

          <h2 className="text-xl font-semibold text-foreground">6. Limite de Propostas</h2>
          <p>Cada pedido aceita no máximo 20 propostas simultâneas. Propostas descartadas liberam vagas para novas submissões.</p>

          <h2 className="text-xl font-semibold text-foreground">7. Verificação de Corretores</h2>
          <p>
            Recomendamos que compradores consultem o registro do corretor no site oficial do{" "}
            <a href="https://www.crecima.gov.br/2025/10/14/buscar-por-corretor/" target="_blank" rel="noopener noreferrer" className="text-coral underline hover:text-coral/80">
              CRECI-MA
            </a>{" "}
            antes de qualquer negociação.
          </p>

          <h2 className="text-xl font-semibold text-foreground">8. Exclusão de Conta</h2>
          <p>O usuário pode solicitar a exclusão de sua conta a qualquer momento. A administração também pode excluir contas que violem estes termos.</p>

          <h2 className="text-xl font-semibold text-foreground">9. Alterações nos Termos</h2>
          <p>Estes termos podem ser atualizados a qualquer momento. O uso continuado da plataforma após alterações implica aceitação dos novos termos.</p>

          <h2 className="text-xl font-semibold text-foreground">10. Contato</h2>
          <p>Para dúvidas, entre em contato: contato@brazukaimoveis.com.br</p>
        </div>
      </div>
    </div>
  );
};

export default TermosUso;
