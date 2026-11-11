# TechStore — Dossiê técnico para apresentação à Rushingwind

**Tipo:** e-commerce gamer demonstrativo para portfólio de desenvolvimento Full-Stack  
**Responsável:** Felipe Alexandre / AgonisingBasher  
**Site:** https://agonisingbasher.github.io/DemoLoja/  
**Código:** https://github.com/agonisingbasher/DemoLoja  
**Última revisão:** 11 de novembro de 2026

## 1. Pitch de 30 segundos

> Desenvolvi a TechStore, uma aplicação web demonstrativa de e-commerce voltada a tecnologia e jogos. O objetivo não é vender produtos, mas demonstrar uma experiência de compra completa: catálogo, pesquisa e filtros, detalhes técnicos, carrinho, cupons, checkout em seis etapas, montador de PC, área do cliente, avaliações e acompanhamento visual de pedidos. O frontend usa React e TypeScript com Tailwind CSS; para autenticação e persistência de pedidos e avaliações, integrei Supabase com PostgreSQL e políticas de acesso RLS. A publicação é automatizada com GitHub Actions e GitHub Pages.

## 2. Stack tecnológica — o que é cada item

| Tecnologia | Categoria | Para que serve na TechStore |
|---|---|---|
| **HTML5** | Linguagem de marcação | Estrutura semântica da página, formulários e elementos acessíveis. |
| **CSS3** | Linguagem de estilo | Estilo, temas, layouts, responsividade e animação da linha no checkout. |
| **JavaScript** | Linguagem de programação | Regras de interação que o navegador executa. |
| **TypeScript** | JavaScript com tipos | Tipos de produto, conta, pedido, cupom e propriedades de componentes; reduz erros de integração. |
| **React 18** | Biblioteca de interface | Cria componentes reutilizáveis e atualiza dinamicamente as telas conforme o estado. |
| **Tailwind CSS 3** | Framework de CSS | Classes utilitárias para espaçamento, grades, cores, breakpoints e visual responsivo. |
| **Vite 5** | Ferramenta de desenvolvimento/build | Inicializa o servidor local e gera a versão otimizada para publicação. |
| **Lucide React** | Biblioteca de ícones | Ícones SVG de carrinho, cupom, usuário, rastreamento, monitor, etc. |
| **Supabase JS 2** | SDK de backend | Conecta o frontend aos serviços de autenticação e à API do banco, usando chave pública e sessão do cliente. |
| **Supabase Auth** | Serviço de autenticação | Cadastro, login, confirmação de e-mail, gerenciamento de sessão e autenticação em dois fatores por aplicativo (TOTP). |
| **PostgreSQL** | Banco relacional SQL | Armazena tabelas de produtos, categorias, cupons, contas, endereços, pedidos, itens e avaliações. |
| **SQL / PLpgSQL** | Linguagens de consulta / rotinas de banco | Esquema, consultas, regras, índices, procedimentos de pedido e políticas de autorização. |
| **Row Level Security (RLS)** | Segurança no PostgreSQL | Limita acesso por conta; com 2FA ativado, exige sessão que tenha validado o segundo fator nas tabelas protegidas. |
| **pg_cron** | Agendador no PostgreSQL | Remove registros de teste antigos (pedidos e avaliações) após sete dias. |
| **localStorage / sessionStorage** | Armazenamento do navegador | Mantém carrinho, preferências, configurações e dados locais demonstrativos; guarda temporariamente o e-mail pendente durante a verificação. |
| **Git e GitHub** | Controle de versão e hospedagem de código | Histórico de mudanças, colaboração e rastreabilidade. |
| **GitHub Actions** | CI/CD | Instala dependências, executa a verificação TypeScript, compila e publica a aplicação. |
| **GitHub Pages** | Hospedagem estática | Hospeda o frontend público da TechStore via HTTPS. |
| **Node.js e npm** | Ambiente e gerenciador de pacotes | Executam ferramentas de build, scripts e instalações de dependências. |
| **ESLint** | Analisador estático | Identifica problemas de padrões e qualidade do código. |

**Não fazem parte do projeto atual:** Next.js, Angular, Vue, Java/Spring, ASP.NET/.NET, backend Node.js/Express próprio, Python como backend, gateway de pagamento ou sistema real de transportadora. Não apresente essas tecnologias como implementadas.

## 3. Arquitetura em alto nível

\`\`\`text
Navegador web
  └─ React + TypeScript + Tailwind CSS (TechStore)
       ├─ Catálogo, busca, filtros, favoritos, montador de PC
       ├─ Carrinho + checkout demonstrativo + cupons
       ├─ Área do cliente + 2FA
       ├─ localStorage (dados de demonstração)
       └─ Supabase JS (cliente público)
            ├─ Supabase Auth (e-mail/senha, sessão, confirmação, TOTP)
            ├─ PostgreSQL com RLS (dados do próprio usuário)
            ├─ RPC SQL create_demo_order (pedidos simulados)
            └─ pg_cron (limpeza de dados de teste)
GitHub Actions (typecheck e build) → GitHub Pages (frontend público)
\`\`\`

A arquitetura é **frontend estático + Backend-as-a-Service (BaaS)**. O Supabase oferece os serviços de backend; não existe um servidor de aplicação tradicional implementado em .NET ou Express.

## 4. Experiências implementadas

1. **Vitrine gamer:** destaques, ofertas, recomendações e campanha conceitual de Nintendo Switch 2.
2. **Catálogo:** 40 produtos de demonstração com paginação, busca, filtro por categoria, ordenação, favoritos e imagens locais para evitar produtos incorretos.
3. **Página de produto:** resumo informativo, abas de descrição e ficha técnica, recomendações, simulação de frete, parcelamento e avaliações.
4. **Central de Cupons:** página com banner, códigos promocionais, regras por categoria ou valor mínimo, cópia e seleção de cupons.
5. **Montador de PC:** escolha passo a passo de CPU, placa-mãe, RAM, GPU, SSD, fonte, gabinete, cooler e periféricos; alertas básicos de socket/DDR e total demonstrativo.
6. **Checkout em seis etapas:** Carrinho, Endereço, Entrega, Pagamento, Revisão e Concluir; dados de teste, fretes e opções de pagamento ilustrativas.
7. **Conta do cliente:** login e cadastro com Supabase Auth, confirmação por código quando o template for habilitado, endereço cadastrado e pedidos.
8. **2FA por aplicativo autenticador:** configuração por QR Code, validação de códigos TOTP, exigência no acesso para contas que ativaram 2FA e suporte à desativação após verificação.
9. **Acompanhamento de pedidos:** linha do tempo com preparação, nota fiscal pendente, emissão ilustrativa, despacho, transporte e entrega fictícios; simulação acelerada.
10. **Avaliações:** para contas com pedidos demonstrativos registrados, uma avaliação por produto; PostgreSQL valida propriedade e período elegível.
11. **Painel administrativo de demonstração:** métricas, produtos, estoque, status, cupons, editor visual de banners e relatórios CSV — **opera localmente**, não é um painel de produção autorizado pelo backend.
12. **Expiração de dados demonstrativos:** limpeza de registros locais e rotina PostgreSQL para pedidos/avaliações de teste após sete dias.

## 5. Segurança e seus limites

- Chave pública do Supabase no navegador; não publicar chave secret/service_role.
- RLS restringe dados pessoais ao usuário autenticado.
- 2FA usa TOTP (código gerado por um aplicativo autenticador); o backend exige AAL2 em dados de clientes que tenham fatores verificados.
- Procedimento de pedido busca preços e dados dos itens do catálogo no servidor; não aceita preços arbitrários fornecidos pelo navegador.
- Senha do usuário fica sob gestão do Supabase Auth; o aplicativo não armazena senhas de clientes.
- A confirmação de e-mail pode falhar por reutilização/expiração do link; a página alternativa aceita OTP e permite solicitar outra confirmação. **É necessário aplicar o template HTML no Supabase.**
- **SMTP externo e remetente verificado ainda precisam ser configurados para envio confiável a visitantes externos.**
- A proteção de senhas vazadas precisa ser ativada no painel do Supabase (aviso atual da ferramenta de segurança).
- O acesso \`admin/admin\` e o ajuste de status no painel são simulações **somente locais**; não concedem privilégios de administrador no banco.

## 6. O que é simulado e o que é real?

| Funcionalidade | Situação |
|---|---|
| Página pública e navegação | **Real:** site publicado, React respondendo a interações. |
| Cadastro/login Supabase | **Real:** conectado ao projeto Supabase, condicionado às políticas de e-mail. |
| Autenticação em dois fatores | **Real na implementação:** Supabase TOTP/AAL2; precisa de teste funcional com uma conta e aplicativo autenticador. |
| Banco de dados PostgreSQL/RLS | **Real:** tabelas, políticas e rotinas criadas no Supabase. |
| Pedido de conta autenticada | **Registro real de um pedido de demonstração:** API SQL, sem cobrança. |
| Compra, frete, NF-e, rastreamento | **Simulado:** não há pagamento, nota fiscal ou transportadora. |
| Editor de banner/admin | **Local:** alterações no navegador, não sincronizadas globalmente. |
| Comentário da conta autenticada | **Persistência real:** avaliação demonstrativa no banco, uma por produto. |
| Envio do e-mail de confirmação personalizado | **Pendente de configuração:** template deve ser aplicado no Supabase e SMTP próprio instalado. |
| IA dentro do site | **Não há chamada a modelo de IA em tempo real:** o resumo informativo usa características do catálogo; não afirme que existe um motor de IA generativa funcionando no backend. |

## 7. Como executar / conferir

\`\`\`bash
cd Demo-Loja
npm ci
npm run dev
npm run typecheck
npm run build
npm run lint
\`\`\`

Build de produção: GitHub Actions executa Node.js 22, \`npm ci\`, typecheck, Vite build e deploy do diretório \`dist\` no GitHub Pages. Base do Vite: \`/DemoLoja/\`. As versões acima descrevem as dependências declaradas no \`package.json\` do repositório.

## 8. Decisões de engenharia que vale destacar

- **Camadas de responsabilidade:** UI em componentes React, tipos TypeScript, dados e regras de promoção separados, banco protegendo operações sensíveis.
- **Defesa em profundidade:** validação de formulário no React + autenticação + RLS em PostgreSQL + validação de preços dos pedidos no banco.
- **BaaS como decisão de MVP:** utilizar Supabase economiza tempo e infraestrutura sem abrir mão de modelagem SQL e autenticação.
- **CI/CD:** cada alteração passa por verificação TypeScript e build antes da publicação, reduzindo regressões.
- **Honestidade do ambiente de testes:** rótulos explícitos de produtos/preços ilustrativos; nenhuma promessa de entrega ou pagamento real.
- **Controle de dados:** retenção de registros demonstrativos de sete dias com \`pg_cron\`; as contas reais não são excluídas nessa rotina.
- **Design responsivo:** interface azul-marinho/laranja, formulários, cards, abas, timeline e feedback de ações.

## 9. Próximas etapas para evoluir

1. Configurar **Site URL/Redirect URLs**, template de confirmação e provedor de **SMTP transacional**, validar o recebimento de e-mails.
2. Testar o fluxo TOTP ponta a ponta (cadastrar, ativar, sair, logar, validar, desativar e recuperar conta).
3. Criar painel administrativo real com autenticação, papéis e operações server-side seguras.
4. Migrar produtos, cupons e banners locais para gestão global no banco e no Supabase Storage.
5. Implementar testes automáticos de unidade, integração e e2e; observabilidade e alertas.
6. Somente se virar operação comercial: avaliar PSP, tratamento de dados pessoais/LGPD, conciliação, controle de estoque e emissão fiscal real.

## 10. Perguntas que a Rushingwind pode fazer

**Por que React?** Componentização e estado tornam catálogo, carrinho e checkout mais fáceis de manter.  
**Por que TypeScript?** Para detectar erros de tipo e manter contratos claros entre módulos.  
**Por que Vite?** Build e desenvolvimento rápidos para uma SPA.  
**Por que Supabase?** Permite aprender PostgreSQL, autenticação e segurança enquanto acelera o MVP.  
**O que é RLS?** Regras implementadas no banco que filtram linhas conforme quem está autenticado.  
**O que é 2FA/TOTP?** Uma segunda etapa de login usando códigos temporários de um aplicativo no celular.  
**O que é CI/CD?** Fluxo automatizado de verificação, compilação e publicação a cada alteração.  
**O que falta para vender de verdade?** Segurança operacional, backend administrativo, pagamentos, dados e políticas legais, logística e emissão fiscal — atualmente não existem.
