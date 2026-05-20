# Architecture Auth Examples

Repositório de estudo incremental de autenticação e autorização simulando um e-commerce real.  
Cada branch implementa um padrão de autenticação diferente, com segurança escalada progressivamente.

---

## Objetivo

Ir além do "fazer login funcionar". O projeto modela autenticação e autorização como em sistemas de produção reais:

- Roles e Authorities granulares desde a primeira branch
- Controle de acesso real nos endpoints (não só autenticação, mas autorização)
- Fluxos completos: registro, login, logout, refresh, expiração, revogação
- Proteção progressiva contra ataques conhecidos a cada branch
- Domínio de e-commerce como contexto realista

**Stack:** Spring Boot 4.0.6 / Java 21 (back) · React 19 + TypeScript + Vite (front) · PostgreSQL

---

## Estrutura de Branches

```
main  ──────────────────────────────────────────── base compartilhada (entidades, configs)
  │
  ├── feature/refresh-token          Refresh Token com persistência, rotação, logout
  ├── feature/auth-server            Monolito modular com auth-server dedicado
  ├── feature/gateway                Spring Cloud Gateway como ponto de entrada
  └── feature/oauth2-keycloak        OAuth2 + OIDC com Keycloak
```

> Feature branches nunca fazem merge de volta para `main`. São independentes e voltadas para estudo.

---

## Estrutura de Pacotes

Organização por domínio. Cada módulo contém: `entity`, `repository`, `service`, `dto`, `controller`.

```
com.souzs.back
├── domain
│   ├── auth          → User, Role, Authority
│   ├── customer      → Customer, Address
│   ├── catalog       → Category, Product
│   ├── stock         → Stock, StockCount
│   └── commerce      → Order, OrderItem, Payment, Delivery
└── infrastructure
    ├── security      → filters, handlers, configuração Spring Security
    ├── config        → beans globais
    └── exception     → handlers e exceptions customizadas
```

> Domínios isolados facilitam a evolução para monolito modular (`feature/auth-server`) e eventual extração de serviços.

---

## Domínio — Entidades

### Diagrama de Entidades

```
┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│    User     │ 1   1 │   Customer   │ 1   N │    Address    │
│─────────────│───────│──────────────│───────│───────────────│
│ id          │       │ id           │       │ id            │
│ email       │       │ user         │       │ customer      │
│ password    │       │ cpf          │       │ street        │
│ name        │       │ phone        │       │ number        │
│ enabled     │       └──────────────┘       │ complement    │
│ locked      │                              │ city          │
│ createdAt   │                              │ state         │
└──────┬──────┘                              │ zipCode       │
       │ N                                   └───────────────┘
       │
       │ N
┌──────▼──────┐       ┌──────────────┐
│    Role     │ N   N │  Authority   │
│─────────────│───────│──────────────│
│ id          │       │ id           │
│ name        │       │ name         │
└─────────────┘       └──────────────┘


┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│  Category   │ 1   N │   Product    │ 1   1 │    Stock      │
│─────────────│───────│──────────────│───────│───────────────│
│ id          │       │ id           │       │ id            │
│ name        │       │ name         │       │ product       │
│ description │       │ description  │       │ quantity      │
└─────────────┘       │ price        │       │ minQuantity   │
                      │ status       │       │ status        │
                      └──────────────┘       │ updatedAt     │
                                             └───────────────┘
                                                     │ 1
                                                     │ N
                                             ┌───────▼───────┐
                                             │  StockCount   │
                                             │───────────────│
                                             │ id            │
                                             │ stock         │
                                             │ countedBy     │
                                             │ countedQty    │
                                             │ countedAt     │
                                             └───────────────┘


┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│  Customer   │ 1   N │    Order     │ 1   N │   OrderItem   │
│─────────────│───────│──────────────│───────│───────────────│
│ ...         │       │ id           │       │ id            │
└─────────────┘       │ customer     │       │ order         │
                      │ status       │       │ product       │
                      │ totalAmount  │       │ quantity      │
                      │ createdAt    │       │ unitPrice     │
                      └──────┬───────┘       └───────────────┘
                             │ 1
                    ┌────────┴────────┐
                    │ 1               │ 1
             ┌──────▼──────┐  ┌──────▼──────┐
             │   Payment   │  │  Delivery   │
             │─────────────│  │─────────────│
             │ id          │  │ id          │
             │ order       │  │ order       │
             │ status      │  │ status      │
             │ method      │  │ address     │
             │ amount      │  │ trackingCode│
             │ transId     │  │ estDelivery │
             └─────────────┘  └─────────────┘
                [MOCKED]           [MOCKED]
```

### Entidades — Resumo

| Entidade | Descrição |
|---|---|
| `User` | Usuário do sistema (base de autenticação) |
| `Role` | Papel do usuário (ADMIN, MANAGER, CUSTOMER, STOCK_MANAGER, STOCK_INTERN) |
| `Authority` | Permissão granular (ex: `product:read`, `order:write`) |
| `Customer` | Perfil do cliente, vinculado a um `User` |
| `Address` | Endereço do cliente |
| `Category` | Categoria de produtos |
| `Product` | Produto do catálogo |
| `Stock` | Controle de estoque separado do produto |
| `StockCount` | Registro de contagem física feita por intern |
| `Order` | Pedido do cliente |
| `OrderItem` | Item de um pedido |
| `Payment` | Pagamento do pedido *(mocked)* |
| `Delivery` | Entrega do pedido *(mocked)* |

---

## Autorização — Roles e Authorities

### Roles

| Role | Descrição |
|---|---|
| `ADMIN` | Acesso total à plataforma |
| `MANAGER` | Gestão de catálogo, pedidos e relatórios |
| `CUSTOMER` | Opera apenas sobre seus próprios dados |
| `STOCK_MANAGER` | Gestão de estoque e catálogo; valida contagens |
| `STOCK_INTERN` | Visualiza produtos e submete contagem física |

### Authorities

| Domínio | Authorities |
|---|---|
| Usuários | `user:read` `user:write` `user:delete` |
| Produtos | `product:read` `product:write` `product:delete` |
| Categorias | `category:read` `category:write` `category:delete` |
| Pedidos | `order:read` `order:write` `order:cancel` `order:manage` |
| Pagamentos | `payment:read` `payment:manage` |
| Entregas | `delivery:read` `delivery:manage` |
| Clientes | `customer:read` `customer:write` `customer:delete` |
| Estoque | `stock:read` `stock:write` `stock:count` `stock:validate` |
| Relatórios | `report:read` |

### Mapeamento Role → Authorities

| Authority | ADMIN | MANAGER | CUSTOMER | STOCK_MANAGER | STOCK_INTERN |
|---|:---:|:---:|:---:|:---:|:---:|
| `user:read` | X | | | | |
| `user:write` | X | | | | |
| `user:delete` | X | | | | |
| `product:read` | X | X | X | X | X |
| `product:write` | X | X | | X | |
| `product:delete` | X | X | | X | |
| `category:read` | X | X | X | X | X |
| `category:write` | X | X | | X | |
| `category:delete` | X | X | | X | |
| `order:read` | X | X | próprio | | |
| `order:write` | X | | X | | |
| `order:cancel` | X | | próprio | | |
| `order:manage` | X | X | | | |
| `payment:read` | X | X | próprio | | |
| `payment:manage` | X | X | | | |
| `delivery:read` | X | X | próprio | | |
| `delivery:manage` | X | X | | | |
| `customer:read` | X | X | próprio | | |
| `customer:write` | X | | próprio | | |
| `customer:delete` | X | | | | |
| `stock:read` | X | X | | X | X |
| `stock:write` | X | | | X | |
| `stock:count` | X | | | | X |
| `stock:validate` | X | | | X | |
| `report:read` | X | X | | | |

> **"próprio"** = acesso restrito ao recurso do próprio usuário autenticado, validado no back-end.  
> Nunca confiar no cliente para definir escopo de acesso.

---

## Regras de Negócio e Status

### Order Status

```
                    ┌─────────┐
               ┌───▶│CANCELLED│
               │    └─────────┘
               │         ▲
┌─────────┐    │    ┌─────┴───────────┐
│ PENDING │────┘    │PAYMENT_CONFIRMED│────▶ PROCESSING ────▶ SHIPPED ────▶ DELIVERED
└─────────┘         └─────────────────┘                                         │
                             │                                                   │
                             └───────────────────────────────────────────────────┘
                                                                      REFUNDED ◀─┘
```

| Status | Descrição |
|---|---|
| `PENDING` | Pedido criado, aguardando pagamento |
| `PAYMENT_CONFIRMED` | Pagamento aprovado |
| `PROCESSING` | Em separação/preparação |
| `SHIPPED` | Enviado para entrega |
| `DELIVERED` | Entregue ao cliente |
| `CANCELLED` | Cancelado |
| `REFUNDED` | Estornado |

**Transições válidas:**
- `PENDING` → `PAYMENT_CONFIRMED` ou `CANCELLED`
- `PAYMENT_CONFIRMED` → `PROCESSING` ou `CANCELLED` → `REFUNDED`
- `PROCESSING` → `SHIPPED`
- `SHIPPED` → `DELIVERED`
- `DELIVERED` → `REFUNDED`

### Product Status

| Status | Descrição |
|---|---|
| `ACTIVE` | Disponível para venda |
| `INACTIVE` | Fora de venda (desativado manualmente) |
| `DISCONTINUED` | Descontinuado permanentemente |

> `OUT_OF_STOCK` não é status de produto — é derivado de `Stock.quantity == 0`.

### Stock Status

| Status | Descrição |
|---|---|
| `REGULAR` | Contagem física bate com o sistema |
| `DIVERGENT` | Contagem física diverge do sistema |
| `PENDING_COUNT` | Aguardando contagem do intern |
| `LOW_STOCK` | Quantidade abaixo de `minQuantity` |

**Fluxo de contagem de estoque:**

```
STOCK_MANAGER cadastra quantidade
        │
        ▼
  Stock.status = PENDING_COUNT
        │
        ▼
STOCK_INTERN submete StockCount (contagem física)
        │
        ▼
Sistema compara StockCount.countedQty vs Stock.quantity
        │
   ┌────┴────┐
   │         │
  OK      DIVERGE
   │         │
   ▼         ▼
REGULAR   DIVERGENT
              │
              ▼
   STOCK_MANAGER usa stock:validate para resolver
```

---

## Segurança

### Ataques e Mitigações (escalados por branch)

| Ameaça | Mitigação |
|---|---|
| Brute force / credential stuffing | Rate limiting, bloqueio de conta |
| Token theft | Refresh token rotation, detecção de reuso |
| JWT tampering | RS256/ES256, validação rigorosa de claims + JTI |
| CSRF | SameSite cookies, tokens anti-CSRF |
| XSS → token leak | HttpOnly cookies para refresh token |
| Replay attack | JTI (JWT ID) + blacklist de tokens revogados |
| Privilege escalation | Validação de roles/authorities sempre no servidor |
| Timing attacks | Comparação de hashes em tempo constante |
| Enumeration | Respostas genéricas em falhas de login/registro |

### Boas Práticas (todas as branches)

- Senhas com **BCrypt** (fator de custo adequado)
- HTTPS obrigatório; cookies com `Secure` + `HttpOnly` + `SameSite=Strict`
- Logs de eventos de segurança sem expor dados sensíveis
- Secrets externalizados, nunca hardcoded
- Erros de autenticação/autorização com respostas padronizadas (401/403)

---

## Branches — System Design

> Em construção. Cada branch terá seu design detalhado aqui e um arquivo dedicado em `/docs`.

| Branch | Doc |
|---|---|
| `feature/refresh-token` | [docs/feature-refresh-token.md](docs/feature-refresh-token.md) |
| `feature/auth-server` | [docs/feature-auth-server.md](docs/feature-auth-server.md) |
| `feature/gateway` | [docs/feature-gateway.md](docs/feature-gateway.md) |
| `feature/oauth2-keycloak` | [docs/feature-oauth2-keycloak.md](docs/feature-oauth2-keycloak.md) |
