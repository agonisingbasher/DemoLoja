# TechStore — E-commerce Gamer Demonstrativo

**Site:** https://agonisingbasher.github.io/DemoLoja/  
**Apresentação técnica completa:** [Rushingwind](APRESENTACAO-TECHSTORE-RUSHINGWIND.md)  
**Configuração de conta/e-mail/2FA:** [Guia Supabase](CONFIGURAR-CONTAS-E-EMAIL.md)

A TechStore é um projeto **educacional e de portfólio**: reproduz interfaces e interações de uma loja gamer, mas não processa pagamentos reais, não entrega mercadorias, não emite documentos fiscais e não integra transportadoras.

## Tecnologias confirmadas

- React 18, TypeScript e JavaScript — componentes e lógica.
- HTML5, CSS3 e Tailwind CSS 3 — estrutura visual e responsividade.
- Vite 5 — desenvolvimento e build.
- Lucide React — ícones.
- Supabase JS 2, Supabase Auth e PostgreSQL — autenticação e persistência das informações que já foram integradas.
- SQL/PLpgSQL e Row Level Security (RLS) — modelagem, validação e proteção de dados.
- Supabase MFA TOTP — autenticação opcional em dois fatores por aplicativo.
- pg_cron — limpeza de dados demonstrativos em sete dias.
- GitHub Actions + GitHub Pages — integração/entrega contínua e hospedagem do frontend.

A aplicação é um **frontend React estático com Backend-as-a-Service (Supabase)**, e não um projeto de Next.js, .NET ou Express.

## Funcionalidades

Catálogo de 40 produtos, categorias com ícones, ofertas, favoritos, busca, paginação, detalhes de produto e ficha técnica, cupons, montagem de PC com validações básicas, checkout em seis etapas, área do cliente, pedidos simulados registrados no Supabase para contas autenticadas, avaliações de compradores demonstrativos, rastreamento ilustrativo de pedidos, painel administrativo visual local, templates personalizados de e-mail e 2FA TOTP.

O carrinho, preferências e parte da administração continuam armazenados no navegador. Cadastro e login reais usam Supabase Auth. O HTML do novo e-mail de confirmação foi preparado, mas precisa ser aplicado em Authentication > Email Templates, e um provedor SMTP externo deve ser configurado para envio confiável a visitantes externos.

## Executar

Use Node.js e npm:

1. Entre no diretório Demo-Loja.
2. Execute npm ci.
3. Execute npm run dev para desenvolvimento local.
4. Execute npm run typecheck e npm run build antes de publicar.
5. Execute npm run lint para inspecionar regras de lint.

No GitHub, o workflow deploy-pages.yml executa npm ci, TypeScript typecheck e build Vite com Node.js 22, publicando o diretório dist no GitHub Pages.

## Limitações e próximos passos

Os pedidos são simulações, sem transações financeiras, NF-e ou entregas. A administração por admin/admin não é autenticação real de administrador e só deve ser usada na demonstração. O acompanhamento de pedidos utiliza uma linha do tempo fictícia, não eventos de transportadora.

Próximos passos: aplicar o e-mail personalizado e configurar Site URL/SMTP no Supabase; validar 2FA e confirmação com uma conta de teste; adicionar testes automatizados e administração de banco com papéis e auditoria.

Projeto desenvolvido por Felipe Alexandre (AgonisingBasher).