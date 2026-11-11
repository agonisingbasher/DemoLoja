# TechStore — como ativar contas reais e e-mail de boas-vindas

A TechStore está hospedada no GitHub Pages (frontend estático). O cadastro e o envio de e-mail **não são habilitados automaticamente** pelo deploy. A página de conta oferece um perfil LOCAL claramente demonstrativo enquanto não houver autenticação configurada.

## 1. Criar projeto Supabase Auth

No painel Supabase, crie um projeto e habilite **Authentication > Providers > Email**. Ative **Confirm email**. Não desative a verificação em produção.

Em **Authentication > URL Configuration**, defina o Site URL como:

`https://agonisingbasher.github.io/DemoLoja/`

Inclua essa URL na lista de Redirect URLs permitidas.

## 2. Conectar ao build da TechStore

Em GitHub > repositório **DemoLoja** > Settings > Secrets and variables > Actions > **Variables**, crie:

- `TECHSTORE_SUPABASE_URL`: URL pública do projeto Supabase (ex.: `https://[projeto].supabase.co`)
- `TECHSTORE_SUPABASE_PUBLISHABLE_KEY`: chave pública **publishable** do projeto. A antiga `anon` também funciona, mas prefira publishable.

**Nunca** use `service_role`, `secret` ou chaves administrativas no Vite/GitHub Pages. Tudo que começa com `VITE_` vira dado público no JavaScript do site.

Um push para `main` ou reexecução manual do GitHub Actions após definir as variáveis publica um frontend com login, cadastro, logout e endereço salvo em `auth.users.user_metadata` para o usuário autenticado.

O histórico de pedidos da TechStore permanece somente neste navegador. Para sincronizar pedidos reais entre dispositivos será necessário um banco de dados com **Row Level Security (RLS)**.

## 3. Ativar ENVIO REAL de e-mail

**O GitHub Pages não envia e-mails.** A confirmação de cadastro depende do serviço de e-mail Supabase.

Em Supabase > Authentication > Email Templates > **Confirm sign up**, cole o HTML do arquivo `supabase/confirmation-email.html`. Assunto sugerido: **“Bem-vindo à TechStore — confirme seu e-mail”**.

Em Supabase > Project Settings / Authentication > SMTP, configure um provedor de SMTP externo verificado para enviar e-mails a pessoas fora da equipe. O SMTP padrão de teste do Supabase tem restrições e NÃO atende ao envio amplo.

Teste cadastro com e-mail de teste, recepção da mensagem, clique no link e login. **Somente depois desses testes** considere a função de e-mail efetivamente ativa.

A mensagem de agradecimento é integrada ao e-mail de confirmação. Enviar um *segundo* e-mail autônomo de boas-vindas exige um backend/Edge Function e provedor transacional, além de proteção contra spam e abuso.

## 4. Segurança / privacidade

- Nenhum CPF é enviado ao Supabase ou salvo no histórico do pedido demonstrativo.
- No modo sem Supabase, conta e endereço fictícios ficam **apenas no localStorage**; e-mails não são enviados.
- O painel `admin/admin` é exclusivamente educativo e **não concede privilégio administrativo real**; uma aplicação comercial exige autenticação de administrador no backend.
- Não solicite CPF ou outros dados reais para testar a TechStore.
- A edição de banners no painel é local ao navegador; para banners globais use storage e permissões de administrador com validação no servidor.
- Use HTTPS, regras de acesso, políticas de privacidade e consentimento apropriados antes de operar uma loja de verdade.

Referências: https://supabase.com/docs/reference/javascript/auth-signup e https://supabase.com/docs/guides/auth/auth-email-templates e https://supabase.com/docs/guides/auth/auth-smtp
