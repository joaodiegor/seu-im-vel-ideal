# Memory: index.md
Updated: now

# Project Memory

## Core
- **Project**: Brazuka Imóveis (brazukaimoveis.com.br) - Reverse real estate auction in Brazil (national).
- **Stack**: React, Tailwind CSS, Framer Motion, Lucide, Supabase (Cloud, RLS, Storage, Realtime).
- **Design**: Teal & coral, off-white bg (HSL 200 15% 98%). White logo (h-20).
- **Typography**: Playfair Display (headings), DM Sans (body).
- **UX**: PWA enabled. Absolute anchor links (e.g., /#como-funciona) for global nav smooth scroll.
- **Privacy**: Buyers can hide name/phone (enforced via SQL security_invoker views).
- **Proposals**: Private to buyer. Max 20 active per request. Max 10 images.
- **Roles**: Buyer vs Broker (requires CRECI). Admin role at /admin.

## Memories
- [Conceito do Projeto](mem://projeto/conceito) — Plataforma de leilão reverso imobiliário no Brasil.
- [Identidade Visual](mem://estilo/identidade-visual) — Cores (azul-petróleo/coral), fundo e logo.
- [Tipografia](mem://estilo/tipografia) — Fontes Playfair Display e DM Sans.
- [Propostas Privadas](mem://funcionalidades/propostas-privadas) — Propostas visíveis apenas ao comprador.
- [Avaliação de Corretores](mem://funcionalidades/avaliacao-corretores) — Sistema de notas (1-5 estrelas) após aceite.
- [Corretores Cadastrados](mem://funcionalidades/corretores-cadastrados) — Interação restrita a corretores registrados.
- [Perfis de Usuários](mem://funcionalidades/perfis-usuarios) — Regras para CRECI, telefone e troca de conta.
- [Publicação de Pedidos](mem://funcionalidades/publicacao-pedidos) — Formulário, tipos de imóveis, bairros e máscaras.
- [Storage](mem://tecnologias/storage) — Buckets para avatares e imagens de propostas com RLS.
- [Detalhes da Proposta](mem://funcionalidades/detalhes-proposta) — Regras de envio, limite de imagens e propostas ativas.
- [Painel do Corretor](mem://funcionalidades/painel-corretor) — Filtros, gestão de propostas e chat.
- [Contato Direto](mem://funcionalidades/contato-direto) — Botão de WhatsApp nas propostas.
- [Chat Pós-Aceite](mem://funcionalidades/chat-pos-aceite) — Chat em tempo real após aceite da proposta.
- [Visualização de Propostas](mem://ux/visualizacao-propostas) — Carrossel inline, proporção 4:3 e lightbox.
- [Privacidade de Contato](mem://funcionalidades/privacidade-contato) — Ocultação de nome e WhatsApp do comprador.
- [Navegação Landing Page](mem://ux/navegacao-landing-page) — Rolagem suave e contagem de corretores.
- [Gestão de Pedidos](mem://funcionalidades/gestao-pedidos) — Aceite/recusa de propostas e exclusão de pedidos.
- [Fluxo do Vendedor](mem://funcionalidades/fluxo-vendedor) — Busca qualificada na home para vendedores.
- [Busca de Corretores](mem://funcionalidades/busca-corretores) — Listagem de profissionais por ranking.
- [Chat Direto](mem://funcionalidades/chat-direto) — Chat independente entre usuários e corretores.
- [Onboarding Corretor](mem://auth/onboarding-corretor) — Exigência de foto de perfil após login.
- [Novos Corretores](mem://ux/secao-novos-corretores) — Destaque de corretores recentes na home.
- [Identidade de Marca](mem://branding/identidade) — Domínio brazukaimoveis.com.br, logo com bandeira do Brasil.
- [Notificações PWA](mem://funcionalidades/notificacoes-pwa) — Alertas Web Push sobre pedidos e propostas.
- [Painel Admin](mem://auth/admin-panel) — Dashboard e gestão de usuários/pedidos para admins.
- [PWA Features](mem://ux/pwa-features) — Manifest, modo standalone e banner de instalação.
- [Navegação Global](mem://ux/navegacao-global) — Uso de caminhos absolutos em links de âncora.
- [Políticas Legais](mem://funcionalidades/politicas-legais) — Privacidade, termos e links do CRECI.
- [Privacidade Dados SQL](mem://seguranca/privacidade-dados) — Uso de views com security_invoker = true.
- [Contraste Logo Auth](mem://estilo/contraste-logo-auth) — Fundo azul para a logomarca no login.
- [Google Login](mem://auth/google-login) — Escolha de tipo de conta sincronizada com o perfil.
- [Auto Confirm](mem://auth/auto-confirm) — Supabase configurado com auto_confirm_email: true.
- [Password Recovery](mem://auth/password-recovery) — Fluxo de reset de senha via e-mail.
