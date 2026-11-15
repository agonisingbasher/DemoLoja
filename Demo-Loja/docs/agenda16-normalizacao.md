# Agenda 16 — Projeto lógico: normalização

**Projeto estudado:** TechStore | **SGBD:** PostgreSQL / Supabase  
**Data de análise:** 15/11/2026.

## O que mudou em relação à Agenda 15?

A Agenda 15 documentou o mapeamento do MER para tabelas e aplicou restrições, chaves estrangeiras e índices no banco existente. A Agenda 16 analisa **dependências funcionais e possíveis redundâncias** com foco nas três primeiras formas normais (1FN, 2FN, 3FN).

A Agenda 16 apresentada pelo professor **não exige explicitamente criar uma aplicação nova**. Foi aplicada como uma revisão de modelagem no sistema TechStore já existente. Não foi necessário reestruturar tabelas em produção para demonstrar os conceitos, evitando perda de dados e regressões.

## Primeira forma normal (1FN)

Cada coluna de uma relação deve conter um valor lógico único e não grupos repetidos de atributos.

**Exemplo no TechStore:** em vez de inserir colunas `produto_1`, `produto_2`, `produto_3` dentro de `customer_orders`, o sistema já usa `customer_order_items`: **uma linha por item** e uma FK `order_id` que aponta para o pedido. Os dados de endereço também são separados em campos como `street`, `house_number`, `city` e `postal_code` dentro de `customer_addresses`.

**Ressalva:** `store_products.features` usa `JSONB` com lista de características. É uma escolha de implementação semiestruturada, útil ao catálogo, mas para uma interpretação estrita de modelo relacional clássico em 1FN recomenda-se uma relação filha `product_features(product_id, position, feature)`. Tal refatoração é **proposta**, não aplicada.

## Segunda forma normal (2FN)

Uma relação em 1FN deve impedir dependência de atributos não-chave de apenas **parte** de uma chave candidata composta.

**Exemplo:** `customer_favorites` tem PK composta `(user_id, product_id)`. A única coluna não-chave, `created_at`, identifica **quando aquela pessoa favoritou aquele produto**. Ela depende da associação completa, não só do usuário nem só do produto.

Os nomes de usuário ficam em `customer_profiles` e os nomes de produto em `store_products`, não na tabela de favoritos.

## Terceira forma normal (3FN)

Uma relação na 2FN não deve ter dependência transitiva de atributos não-chave por outros atributos não-chave (na formulação didática usual).

**Exemplo:** `store_products` armazena `category_id`, enquanto o nome da categoria está na relação `store_categories`. Assim, uma mudança no nome da categoria ocorre **uma vez**, sem atualizar todos os produtos da mesma categoria.

**Consulta de demonstração:**

```sql
SELECT p.id, p.name AS produto, c.name AS categoria
FROM public.store_products p
LEFT JOIN public.store_categories c ON c.id = p.category_id;
```

## A redundância histórica nem sempre é erro

A tabela `customer_order_items` armazena `product_name` e `unit_price`, além de `product_id`. Esses campos preservam **a descrição e o preço registrados no instante da compra simulada**. Não devem mudar automaticamente quando o nome ou preço atual do catálogo mudar. Trata-se de **desnormalização intencional de dados históricos**, e não de falha a corrigir cegamente.

A tabela `store_reviews` também mantém `nickname` como nome exibido no momento da avaliação. Esse dado deve ser avaliado conforme o requisito de histórico, evitando assumir que deve sempre refletir o perfil atual.

## Proposta opcional: características normalizadas (não executada)

Uma alternativa para a coluna `features JSONB` seria:

```sql
-- EXEMPLO DIDÁTICO — NÃO APLICADO EM PRODUÇÃO.
CREATE TABLE public.product_features (
    product_id TEXT NOT NULL REFERENCES public.store_products(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    feature TEXT NOT NULL CHECK (length(trim(feature)) > 0),
    PRIMARY KEY (product_id, position)
);
```

Migrar exigiria adaptar a leitura/escrita no frontend e decidir o formato de ordenação das características. Como o projeto atual depende da coluna JSONB, **não foi realizada alteração destrutiva**.

## Resultados e conclusão

- Identificadas estruturas coerentes com 1FN/2FN/3FN nos fluxos centrais de catálogo, categorias, favoritos e pedidos.
- Explicadas as relações entre chaves primárias, estrangeiras e dependências funcionais.
- Documentados casos reais de armazenamento semiestruturado (`features JSONB`) e snapshots históricos, que impedem afirmar que **todo o banco** está estritamente em 3FN sem auditoria completa.
- Preservadas todas as tabelas, registros, APIs e interface existentes para esta etapa.

**Resultado da Agenda 16:** análise e documentação de normalização do TechStore; nenhuma nova migração SQL foi exigida nem aplicada especificamente para a Agenda 16.
