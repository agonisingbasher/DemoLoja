# TechStore — conclusão do e-mail de confirmação e 2FA

## Diagnóstico confirmado em 11/11/2026

Os logs do Supabase registraram:
- Um cadastro **confirmado** pela rota /verify às 04:43:01 UTC.
- Uma segunda tentativa de usar um token às 04:43:24 UTC, com **403 — Email link is invalid or has expired / One-time token not found**.
- Referências ao endereço de desenvolvimento http://localhost:3000, que não deve ser o Site URL da TechStore publicada.

Isso é compatível com reutilização de link de uso único ou com um sistema de segurança de e-mail que abriu o link antes da pessoa. O motivo exato do segundo acesso não pode ser determinado apenas pelos logs.

O banco registra um usuário com e-mail já confirmado. Se esse for o seu cadastro, **tente entrar normalmente antes de solicitar outra confirmação**.

## Parte já implementada no código

- Página https://agonisingbasher.github.io/DemoLoja/#/confirmar-email.
- Verificação de OTP de e-mail via Supabase Auth.
- Reenvio de confirmação de cadastro.
- Template HTML completamente personalizado com azul-marinho e laranja, texto de boas-vindas, token e botão para abrir a página de confirmação.
- Segurança de conta por **TOTP** (aplicativo autenticador): cadastro via QR Code, verificação do código, login com segundo fator e desativação autenticada.
- RLS de dados pessoais, pedidos e avaliações exige **AAL2** quando o cliente já cadastrou um fator verificado.

## Ainda exige sua ação no painel Supabase

### 1. Corrigir Site URL e redirecionamentos

Abra Authentication > URL Configuration:

https://supabase.com/dashboard/project/akcwdobzjffoaqyudurc/auth/url-configuration

Defina **Site URL** exatamente como:

https://agonisingbasher.github.io/DemoLoja/

Em **Redirect URLs**, autorize também o mesmo endereço:

https://agonisingbasher.github.io/DemoLoja/

Remova localhost:3000 como Site URL da aplicação publicada. Mantenha localhost apenas para desenvolvimento, se precisar.

### 2. Ativar o e-mail com a identidade TechStore

Abra Authentication > Email Templates > Confirm sign up:

https://supabase.com/dashboard/project/akcwdobzjffoaqyudurc/auth/templates

- Assunto: **TechStore | Bem-vindo! Confirme seu e-mail**
- Corpo: copie **todo o HTML** de Demo-Loja/supabase/confirmation-email.html no repositório.
- Salve as alterações.

O template usa a variável de OTP Token para fornecer um código temporário. Ao contrário de um link de uso único, esse método não confirma a conta com um simples acesso automatizado à URL do e-mail.

### 3. SMTP para enviar a qualquer visitante

Abra:

https://supabase.com/dashboard/project/akcwdobzjffoaqyudurc/auth/smtp

Para enviar e-mails a qualquer visitante, configure **Custom SMTP** com serviço como Resend, Brevo ou Postmark e remetente verificado. Dependendo do serviço, é necessário ter domínio próprio e configurar SPF/DKIM.

A conexão atual do ChatGPT com o Supabase **não oferece uma ferramenta para editar o SMTP nem o template do Auth**. Essas duas configurações devem ser feitas no painel. **Não compartilhe senhas SMTP, chaves privadas ou códigos de recuperação no chat.**

### 4. Ativar verificações de senha

O Supabase Security Advisor apontou **Leaked Password Protection Disabled**. Habilite a proteção de senhas comprometidas em Authentication > Settings / Password Security quando o recurso estiver disponível no seu plano.

Confira também CAPTCHA e rate limits para evitar cadastros e disparos abusivos de e-mail.

### 5. Teste real obrigatório

1. Abra a TechStore em uma janela anônima.
2. Faça cadastro com um e-mail de teste novo; não use CPF/endereço real.
3. Confirme o recebimento da mensagem com o visual TechStore.
4. Clique em **Confirmar conta TechStore**, insira e-mail e código.
5. Confira que login funciona.
6. Vá a Minha Conta > Segurança · 2FA, escaneie QR Code em autenticador e valide o código.
7. Saia, entre novamente com e-mail/senha e confira que a TechStore exige o código TOTP.
8. Confira que Meus Pedidos carrega pedidos demonstrativos. Para conta já confirmada, teste login sem reutilizar link antigo.

## Observações de segurança

- 2FA é opcional até ser ativado. Uma vez ativado, a aplicação solicita TOTP nas sessões AAL1.
- RLS do PostgreSQL usa a presença de fatores verificados e o nível de autenticação (AAL2) para proteger dados pessoais, inclusive via API direta.
- Nunca envie para o GitHub Pages uma chave service_role ou secret.
- O procedimento público create_demo_order é um RPC SQL de demonstração, não um pagamento. O Supabase Advisor avisa que ele é SECURITY DEFINER, intencional para este fluxo, mas merece auditoria antes de uso comercial.
- O painel admin/admin é somente uma simulação local, não um privilégio administrativo real.
- Nenhum pedido gera cobrança, entrega, rastreamento ou nota fiscal.
