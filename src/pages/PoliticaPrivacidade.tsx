const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold font-display text-foreground mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-sm text-foreground/80 space-y-6">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <h2 className="text-xl font-semibold text-foreground">1. Informações que coletamos</h2>
          <p>Coletamos informações fornecidas diretamente por você ao se cadastrar na plataforma, como nome, e-mail, telefone, tipo de usuário (comprador ou corretor), CRECI (para corretores) e demais dados inseridos no perfil.</p>

          <h2 className="text-xl font-semibold text-foreground">2. Como usamos suas informações</h2>
          <p>Utilizamos seus dados para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Permitir o funcionamento da plataforma e a conexão entre compradores e corretores;</li>
            <li>Enviar notificações push sobre novos pedidos e propostas;</li>
            <li>Melhorar a experiência do usuário;</li>
            <li>Garantir a segurança da plataforma.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">3. Compartilhamento de dados</h2>
          <p>Seus dados pessoais não são vendidos a terceiros. Informações como nome e telefone podem ser exibidas a outros usuários da plataforma conforme suas configurações de visibilidade ao publicar pedidos.</p>

          <h2 className="text-xl font-semibold text-foreground">4. Armazenamento e segurança</h2>
          <p>Seus dados são armazenados em servidores seguros com criptografia. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado.</p>

          <h2 className="text-xl font-semibold text-foreground">5. Seus direitos</h2>
          <p>Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento entrando em contato conosco pelo e-mail contato@slzimoveis.com.br.</p>

          <h2 className="text-xl font-semibold text-foreground">6. Cookies e notificações</h2>
          <p>A plataforma pode utilizar cookies para melhorar a navegação. As notificações push são opcionais e podem ser desativadas nas configurações do navegador ou dispositivo.</p>

          <h2 className="text-xl font-semibold text-foreground">7. Alterações nesta política</h2>
          <p>Esta política pode ser atualizada periodicamente. Recomendamos que você a consulte regularmente.</p>

          <h2 className="text-xl font-semibold text-foreground">8. Contato</h2>
          <p>Para dúvidas sobre esta política, entre em contato: contato@slzimoveis.com.br</p>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidade;
