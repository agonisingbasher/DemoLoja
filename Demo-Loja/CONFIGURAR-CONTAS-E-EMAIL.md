# TechStore — cadastro real, confirmação por e-mail e segurança

## Já está configurado (11/11/2026)
- Projeto **TechStore** no Supabase, região São Paulo, ID: `akcwdobzjffoaqyudurc`.
- O frontend GitHub Pages usa a URL do projeto e a **chave pública publishable**; não há chave secreta no navegador.
- Login/cadastro usam `supabase.auth.signUp` e `signInWithPassword`, com confirmação de e-mail quando o remetente estiver configurado.
- Catálogo de 40 produtos no banco; pedidos de contas autenticadas são registrados pelo RPC `create_demo_order` usando preços do banco, com limite de 20 por conta/24h.
- Tabela `store_reviews` com RLS: só é possível publicar avaliação de item presente em pedido demonstrativo registrado pela conta; apenas uma por conta e produto.
- Supabase Cron `techstore-cleanup-7d`: diariamente às 03:15 UTC remove pedidos e avaliações demonstrativos com mais de sete dias. **Não exclui contas reais de autenticação nem endereços de usuários autenticados.**
- Perfil local continua opcional para testes enquanto o e-mail transacional não estiver pronto. Perfis locais, carrinhos e histórico de demonstração são limpos após sete dias ao reabrir o site.

## Ainda precisa ser habilitado pelo proprietário: envio de e-mail real para qualquer pessoa

O SMTP de testes do Supabase **só envia mensagens a e-mails previamente autorizados da equipe**. Para visitantes externos é obrigatório conectar um provedor SMTP e validar um remetente.

1. Abra **[Supabase → Authentication → SMTP](https://supabase.com/dashboard/project/akcwdobzjffoaqyudurc/auth/smtp)**.
2. Em um provedor transacional como Resend, Brevo ou Postmark, crie/valide seu remetente. Dependendo do serviço, é necessário possuir um domínio próprio e configurar DNS SPF/DKIM/DMARC.
3. No Supabase, habilite **Custom SMTP** e informe **host, porta, usuário SMTP, senha SMTP, e-mail remetente e nome "TechStore"**, obtidos diretamente no provedor. **Nunca comite, envie no chat ou exponha a senha SMTP no GitHub Pages.**
4. Em **[Authentication → URL Configuration](https://supabase.com/dashboard/project/akcwdobzjffoaqyudurc/auth/url-configuration)**, configure Site URL e Redirect URLs com `https://agonisingbasher.github.io/DemoLoja/`.
5. Em **[Authentication → Providers → Email](https://supabase.com/dashboard/project/akcwdobzjffoaqyudurc/auth/providers)**, mantenha **Confirm email** habilitado.
6. Em **[Authentication → Email Templates](https://supabase.com/dashboard/project/akcwdobzjffoaqyudurc/auth/templates)**, selecione **Confirm signup**, use o assunto `Bem-vindo à TechStore — confirme seu e-mail` e cole o conteúdo de `Demo-Loja/supabase/confirmation-email.html`.
7. Faça um cadastro com caixa de entrada de teste **fora da equipe Supabase**, confirme o recebimento e clique no link de ativação. Consulte Auth logs para conferir erros, bloqueios, SPF/DKIM e limites de envio.
8. Para liberar cadastros publicamente, configure proteção anti-bot e limites de envio em **Authentication → Rate Limits/CAPTCHA**, evitando abuso e spam.

O e-mail de confirmação já inclui o agradecimento pelo cadastro. Para enviar uma **segunda mensagem independente de boas-vindas**, além da confirmação, será necessária uma Edge Function ou outro backend associado ao serviço de e-mail.

## Observações essenciais

- O checkout continua 100% **simulado**, sem pagamentos nem nota fiscal.
- A avaliação vinculada ao pedido Supabase atesta apenas que a conta registrou uma **compra de demonstração**, não que fez pagamento ou recebeu mercadoria.
- Não execute limpeza automática em `auth.users`: isso destruiria contas reais. A política de sete dias se aplica somente aos dados de teste.
- O painel `admin/admin` é uma **demonstração visual local**, não uma permissão administrativa válida no banco.
- Nunca coloque chave `service_role`, `secret` ou senha SMTP no código Vite ou em configurações públicas.

Fontes: https://supabase.com/docs/guides/auth/auth-smtp e https://supabase.com/docs/guides/auth/passwords e https://supabase.com/docs/guides/cron
