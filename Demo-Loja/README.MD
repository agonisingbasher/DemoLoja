# TechStore — Loja Gamer Demonstrativa

A TechStore é um projeto de e-commerce demonstrativo desenvolvido para praticar e apresentar habilidades de desenvolvimento frontend. O catálogo reúne consoles, periféricos e acessórios gamer. Não é uma loja comercial e não realiza pagamentos reais.

## Tecnologias

- **React 18** — construção da interface.
- **TypeScript** — tipagem estática.
- **Vite** — ambiente de desenvolvimento e build.
- **Tailwind CSS** — estilização responsiva.
- **Lucide React** — biblioteca de ícones.
- **Supabase** — serviços e estrutura preparados para uma futura integração com banco de dados.

## Funcionalidades

- Catálogo de produtos com imagens, preços, avaliações, descontos e estoque.
- Busca de produtos por nome e descrição.
- Filtro por categoria.
- Ordenação por destaque, preço, avaliação e nome.
- Lista de favoritos salva no armazenamento local do navegador.
- Carrinho com adição, remoção e alteração de quantidades.
- Validação da quantidade de acordo com o estoque cadastrado.
- Cálculo demonstrativo de subtotal, entrega e total.
- Frete grátis em compras demonstrativas a partir de R$ 499,00.
- Formulário de entrega e confirmação de pedido demonstrativo.
- Persistência do carrinho e dos favoritos após atualizar a página.
- Layout responsivo para dispositivos móveis e desktop.

## Como executar localmente

1. Instale o [Node.js](https://nodejs.org/).
2. Entre na pasta do projeto:
   `cd Demo-Loja`
3. Instale as dependências:
   `npm install`
4. Inicie o servidor:
   `npm run dev`
5. Para validar os tipos e gerar a versão de produção:
   `npm run typecheck`
   `npm run build`

## Limitações da demonstração

O catálogo utilizado atualmente está definido localmente em `src/lib/catalogProducts.ts`. Carrinho e favoritos são armazenados no navegador com `localStorage`. A finalização gera apenas uma confirmação visual e um código fictício: não há cobrança, envio de e-mail, processamento de pagamento, autenticação de usuário ou registro real de pedidos. A integração Supabase está preparada em serviços separados, mas depende de configuração e conexão para ser utilizada.

---

Projeto desenvolvido por **Felipe Alexandre (AgonisingBasher)**.

GitHub: https://github.com/agonisingbasher
