# feature/auth-server — Documentação

## Objetivo da branch

Demonstrar separação de responsabilidades num monolito modular Maven com dois serviços independentes:
- **auth-server** (porta 8080): emite JWTs assinados com RSA private key
- **resource-server** (porta 8081): valida JWTs usando apenas a RSA public key

O ponto central de aprendizado **não é o fluxo de login em si** (isso veio na branch refresh-token), mas sim **como dois serviços se comunicam via JWT sem que o resource-server precise confiar no auth-server em tempo real** — basta ter a public key.

---

## Estrutura Maven

```
back/
├── pom.xml                  ← parent (packaging=pom), gerencia dependências
├── shared/                  ← JAR puro (sem @SpringBootApplication)
│   └── src/.../shared/
│       ├── exception/ErrorResponse.java
│       └── security/
│           ├── JwtValidator.java
│           └── UserPrincipal.java
├── auth-server/             ← Spring Boot app, porta 8080
└── resource-server/         ← Spring Boot app, porta 8081
```

`shared` é compilado primeiro (`mvn install -pl shared`) e incluído como dependência local nos outros dois módulos. Não tem `main`, não sobe como servidor.

---

## Fluxo completo de autenticação

```
Cliente
  │
  ├─► POST /auth/login (auth-server:8080)
  │       AuthService.login()
  │         └─ authenticationManager.authenticate(email, password)
  │               └─ UserDetailsServiceImpl.loadUserByUsername(email)
  │                     └─ SELECT users WHERE email = ? (só email + password)
  │         └─ userRepository.findByEmailWithRolesAndAuthorities(email)
  │               └─ SELECT com JOIN FETCH roles + authorities
  │         └─ JwtIssuer.issue(user)
  │               └─ JWT RS256 assinado com private.pem
  │                   claims: sub=userId, email, roles[], authorities[]
  │
  ├─► GET /products (resource-server:8081)
  │       Authorization: Bearer <token>
  │       JwtAuthFilter.doFilterInternal()
  │         └─ JwtValidator.validate(token)
  │               └─ verifica assinatura com public.pem
  │               └─ retorna UserPrincipal(userId, email, roles, authorities)
  │         └─ monta UsernamePasswordAuthenticationToken(principal=UserPrincipal)
  │         └─ SecurityContextHolder.setAuthentication(...)
  │       ProductController.findAll()
  │         └─ @PreAuthorize("hasAuthority('product:read')")
  │         └─ zero chamadas ao banco de auth — autorização vem do JWT
```

---

## Por que dois queries no login?

`UserDetailsService.loadUserByUsername()` retorna `UserDetails` **sem authorities** (lista vazia). Isso é intencional: o Spring Security só precisa de email + senha hash para autenticar. Carregar roles/authorities aqui seria desperdício — esse `UserDetails` é descartado logo depois.

Depois que `AuthenticationManager.authenticate()` retorna com sucesso, `AuthService` faz um segundo query (`findByEmailWithRolesAndAuthorities`) para buscar roles e authorities e embuti-las no JWT. Esse segundo query é necessário porque o primeiro não carregou esses dados.

**Alternativa possível:** carregar roles no próprio `loadUserByUsername` e recuperar via `authentication.getAuthorities()` após o `authenticate()`. Isso economizaria um query, mas acoplaria a lógica de emissão de JWT ao `UserDetailsService`, que tem responsabilidade única de verificar credenciais.

---

## RS256 vs HS256

Na branch `refresh-token`, o JWT usava **HS256** (chave simétrica): quem sabe a chave pode tanto assinar quanto verificar. Qualquer serviço que precisasse validar tokens precisaria da mesma chave secreta — risco de vazamento.

Nessa branch, **RS256** (assimétrico):
- `auth-server` tem `private.pem` → assina tokens
- `resource-server` tem só `public.pem` → verifica tokens, **nunca pode assinar**
- Se o resource-server for comprometido, o atacante não consegue forjar tokens

`private.pem` está no `.gitignore` (`back/.gitignore`: `**/keys/private.pem`). Em produção viria de variável de ambiente ou secrets manager — nunca em disco no repositório.

---

## O que o resource-server sabe sobre o usuário?

**Nada além do que está no JWT.** O resource-server não tem tabela `users`. Toda informação de identidade vem dos claims:

```
sub       → userId (Long)
email     → email do usuário
roles     → ["ADMIN", "MANAGER", ...]
authorities → ["product:read", "order:write", ...]
```

No `SecurityContext`, o principal é um `UserPrincipal` (record do shared). Para acessar nos controllers:

```java
@GetMapping("/me")
public UserInfo me(@AuthenticationPrincipal UserPrincipal principal) {
    // principal.userId(), principal.email(), principal.roles(), principal.authorities()
}
```

---

## customer.user_id sem FK

Na branch `refresh-token`, `customers.user_id` tinha `REFERENCES users(id)` — FK real para a tabela users. Aqui, **não tem FK**:

```sql
-- resource-server V1
CREATE TABLE customers (
    user_id BIGINT NOT NULL UNIQUE,  -- sem REFERENCES users(id)
    ...
);
```

Isso porque `users` está no schema `auth` (auth-server) e `customers` no schema `commerce` (resource-server). O mesmo banco PostgreSQL tem ambos os schemas, mas a integridade referencial entre schemas de módulos diferentes é responsabilidade da aplicação, não do banco.

Mesma lógica para `stock_counts.counted_by_user_id`.

**Implicação:** se um usuário for deletado no auth-server, os registros de customer/stock_count no resource-server ficam órfãos — sem cascade automático. Em produção isso seria resolvido com eventos de domínio (Kafka, por exemplo) ou soft-delete.

---

## Anti-enumeração no login

`AuthService.login()` captura **qualquer** `AuthenticationException` (conta desabilitada, bloqueada, senha errada, usuário inexistente) e relança como `BadCredentialsException("Credenciais inválidas")`. O `GlobalExceptionHandler` trata isso como 401 com mensagem genérica.

O cliente nunca sabe se:
- O email não existe
- A conta está bloqueada (`locked=true`)
- A conta está desabilitada (`enabled=false`)
- A senha está errada

Todos retornam exatamente o mesmo 401.

**Atenção:** para o register, `IllegalStateException("Email já em uso")` é lançado explicitamente. Isso tecnicamente permite enumerar se um email está cadastrado via `/auth/register`. Se quiser eliminar esse vetor também, o register poderia retornar 201 sempre (sem confirmar se criou ou não) — mas isso prejudica muito a UX e raramente vale o trade-off.

---

## @PreAuthorize nos controllers do resource-server

Os controllers do resource-server **não têm `@PreAuthorize` ainda** — foram migrados da main sem anotações de autorização. Esse é o próximo passo natural após a branch estar compilando.

O padrão esperado (igual à branch refresh-token):
```java
@GetMapping
@PreAuthorize("hasAuthority('product:read')")
public List<ProductResponse> findAll() { ... }

@PostMapping
@PreAuthorize("hasAuthority('product:write')")
public ResponseEntity<ProductResponse> create(...) { ... }
```

`@EnableMethodSecurity` já está habilitado no `SecurityConfig` do resource-server.

---

## Pontos de evolução

### 1. Refresh Token (desafio proposto)
Adicionar RT só no auth-server:
- `RefreshToken` entity + migration no schema `auth`
- `login` emite AT + RT (RT em cookie HttpOnly)
- `POST /auth/refresh` com rotação de família
- `logout` revoga família
- Resource-server: zero mudanças

### 2. @PreAuthorize nos controllers do resource-server
Trabalho imediato: anotar todos os endpoints com authorities corretas (mesma matriz da branch refresh-token).

### 3. Propagação de userId para operações de auditoria
`StockCountService.submit()` recebe `countedByUserId` via request body — o cliente informa quem fez a contagem. Isso é um problema de segurança: qualquer usuário autenticado pode informar o userId de outro.

Solução: extrair `userId` do JWT (`UserPrincipal`) no controller e passar para o service, não aceitar do request body:
```java
public StockCountResponse submit(Long stockId, StockCountRequest request,
                                  @AuthenticationPrincipal UserPrincipal principal) {
    stockCountService.submit(stockId, request.countedQuantity(), principal.userId());
}
```
`StockCountRequest` ficaria só com `countedQuantity`.

### 4. Validação cross-schema via eventos
Hoje, se `userId` em `customers` ou `counted_by_user_id` em `stock_counts` referenciar um usuário inexistente, o banco não rejeita (sem FK). Validação ativa exigiria chamada HTTP ao auth-server ou eventos de sincronização (ex: Kafka topic `user.created`/`user.deleted`).

### 5. Rotação de chaves RSA
`JwtIssuer` usa uma chave fixa. Em produção, chaves RSA devem ser rotacionadas periodicamente. Isso exige:
- Suporte a múltiplos key IDs (`kid` claim no JWT header)
- `JwtValidator` resolve qual public key usar via `kid`
- Período de sobreposição: nova chave assina, antiga ainda valida (grace period)

### 6. Expiração configurável por ambiente
`jwt.expiration-ms=900000` (15 min) hardcoded no `application.yml`. Poderia ser externalizado por profile: 15min em prod, 1h em dev.

### 7. Centralizar JwtAuthFilter no shared
Hoje `JwtAuthFilter` é duplicado (auth-server e resource-server têm cópias idênticas). Poderia ser movido para `shared` como `abstract` ou componente reutilizável. A razão para não fazer agora: `shared` é JAR puro sem dependência de Spring MVC — adicionar `OncePerRequestFilter` exigiria a dependência `spring-web` no shared, aumentando o acoplamento.
