# feature/refresh-token — Documentação Completa

## O que esta branch implementa

Autenticação stateful com dois tokens por sessão:

- **Access Token (AT):** JWT HS256, curta duração (15min), stateless, trafega no header `Authorization: Bearer`
- **Refresh Token (RT):** token opaco (UUID), longa duração (7 dias), armazenado hasheado (SHA-256) no banco, trafega exclusivamente via cookie HttpOnly

---

## JWT — Conceitos e Assinatura

### Estrutura

JWT tem 3 partes separadas por `.`:

```
base64url(header) . base64url(payload) . base64url(signature)
```

**Header:**
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload (claims):**
```json
{
  "sub": "42",
  "email": "user@example.com",
  "roles": ["CUSTOMER"],
  "authorities": ["product:read", "order:write"],
  "iat": 1716220800,
  "exp": 1716221700
}
```

**Assinatura (HS256):**
```
HMAC-SHA256(
  base64url(header) + "." + base64url(payload),
  secret
)
```

A assinatura **vincula** header + payload ao segredo. Qualquer alteração no payload (ex: trocar `["CUSTOMER"]` por `["ADMIN"]`) invalida a assinatura — token rejeitado.

### HS256 vs RS256 vs ES256

| | HS256 | RS256 | ES256 |
|---|---|---|---|
| Tipo | Simétrico | Assimétrico (RSA) | Assimétrico (ECDSA) |
| Chaves | 1 segredo compartilhado | Par: privada (assina) + pública (verifica) | Par: privada (assina) + pública (verifica) |
| Quem verifica | Só quem tem o segredo | Qualquer um com a chave pública | Qualquer um com a chave pública |
| Onde faz sentido | Serviço único — só ele assina e verifica | Múltiplos serviços | Múltiplos serviços (chaves menores, mais rápido que RSA) |

**Esta branch usa HS256** — um único serviço assina e verifica. RS256 adicionaria complexidade sem benefício real aqui.

**`feature/auth-server` usa RS256** — auth-server assina com chave privada, demais serviços verificam com a chave pública que nunca sai do auth-server. Aí a separação faz sentido.

---

## JWT na Prática — Biblioteca e Implementação

### Biblioteca: jjwt (io.jsonwebtoken)

Três artefatos Maven — separação intencional: você compila contra a API, implementação e serialização ficam em runtime:

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

### A chave secreta

**Nunca gerar em runtime** (`Jwts.SIG.HS256.key().build()` muda a cada restart → invalida todos os tokens em circulação).

A chave vem do `application.yml`, externalizada como Base64:

```yaml
jwt:
  secret: "base64-encoded-secret-de-pelo-menos-32-bytes"
  expiration-ms: 900000  # 15min
```

No código, converte para `SecretKey`:

```java
byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
SecretKey key = Keys.hmacShaKeyFor(keyBytes);
```

`Keys.hmacShaKeyFor` lança exceção se a chave tiver menos de 256 bits (32 bytes) — requisito mínimo do HS256.

### Encode (gerar AT)

```java
String token = Jwts.builder()
    .subject(String.valueOf(user.getId()))
    .claim("email", user.getEmail())
    .claim("roles", user.getRoles().stream().map(Role::getName).toList())
    .claim("authorities", user.getRoles().stream()
        .flatMap(r -> r.getAuthorities().stream())
        .map(Authority::getName)
        .distinct()
        .toList())
    .issuedAt(new Date())
    .expiration(new Date(System.currentTimeMillis() + expirationMs))
    .signWith(key)   // infere HS256 pelo tipo da SecretKey
    .compact();
```

### Decode (validar e extrair claims)

```java
try {
    Claims claims = Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .getPayload();

    String userId = claims.getSubject();
    String email  = claims.get("email", String.class);
    List<?> roles = claims.get("roles", List.class);

} catch (JwtException e) {
    // token inválido, adulterado ou expirado → 401
}
```

`JwtException` cobre tudo: assinatura inválida, token expirado, malformado. Um catch resolve.

---

### Como o decode funciona internamente

**1 — Split**

Token chega como `xxxxx.yyyyy.zzzzz`. Biblioteca quebra nos dois `.`:
```
header    = xxxxx  (base64url)
payload   = yyyyy  (base64url)
signature = zzzzz  (base64url)
```

**2 — Verificação da assinatura (etapa crítica)**

Biblioteca recomputa a assinatura com a chave fornecida:

```
assinatura_esperada = HMAC-SHA256(
    "xxxxx.yyyyy",    ← header + "." + payload ainda em base64url
    chave_secreta
)
```

Compara `assinatura_esperada` com `zzzzz` em **tempo constante** — evita timing attack.

Se diferem → `JwtException`. Nenhuma etapa posterior executa.

**3 — Decode do payload e validação de claims**

Só executa se a assinatura bateu:

```
payload_json = base64url_decode("yyyyy")
→ { "sub": "42", "email": "...", "exp": 1716221700, ... }
```

`exp` é validado automaticamente: se `exp < now` → `ExpiredJwtException`. Devolve `Claims` populado.

**Por que adulteração é impossível**

Atacante altera payload (ex: `CUSTOMER` → `ADMIN`) mas não tem a chave secreta para recomputar a assinatura. Qualquer byte diferente no payload → HMAC diferente → comparação falha → `JwtException`.

**Fluxo completo:**

```
token → split → recomputa HMAC → compara assinaturas
                                       ↓ diferem → JwtException
                                       ↓ batem
                               → decode payload → valida exp
                                                       ↓ expirado → JwtException
                                                       ↓ válido   → Claims
```

---

### Onde vive no projeto

```
infrastructure/security/
├── JwtService.java     → generateToken(User) + extractClaims(token)
└── JwtAuthFilter.java  → intercepta requests, valida AT, popula SecurityContext
```

---

## JwtAuthFilter — Internals

### Responsabilidade do filter

O `JwtAuthFilter` **autentica** — popula o `SecurityContextHolder` quando há AT válido. Ele **não bloqueia** requests sem token.

Bloquear é responsabilidade do `SecurityConfig`. A separação é intencional:

```
Request sem token → GET /auth/login (rota pública)
  → JwtAuthFilter: sem Authorization header → doFilter, segue
  → SecurityConfig: .requestMatchers("/auth/**").permitAll() → passa
  → Controller executa

Request sem token → GET /produtos (rota protegida)
  → JwtAuthFilter: sem Authorization header → doFilter, segue
  → SecurityConfig: .anyRequest().authenticated() → SecurityContext vazio → 401
```

Se o filter bloqueasse direto, rotas públicas nunca funcionariam sem token.

**Separação de responsabilidades:**

| Componente | Responsabilidade |
|---|---|
| `JwtAuthFilter` | Autentica — popula `SecurityContextHolder` quando tem AT válido |
| `SecurityConfig` | Autoriza — decide se a rota exige autenticação |

---

### Por que `substring(7)`

`"Bearer "` tem exatamente 7 caracteres (incluindo o espaço):

```
"Bearer eyJhbGciOiJIUzI1NiJ9..."
 0123456 7...
```

`substring(7)` descarta o prefixo e retorna só o token. Funciona porque a linha anterior já garantiu que o header começa com `"Bearer "` — sem esse check, `substring(7)` em header diferente quebraria ou retornaria lixo.

---

### O filter não valida credenciais

Credenciais (email + senha) são verificadas **uma única vez** no login. O filter age nas requests subsequentes — o cliente não manda senha, manda só o AT.

```
Login (uma vez):
  POST /auth/login { email, password }
  → AuthenticationManager → UserDetailsService → BCrypt.matches → AT gerado

Requests seguintes (filter age aqui):
  Authorization: Bearer <token>
  → assinatura HMAC válida? → não expirado?
  → sim → popula SecurityContextHolder
  → não → segue sem autenticar → SecurityConfig rejeita com 401
```

`AuthenticationManager` + `UserDetailsService` só entram no `POST /auth/login`. O filter nunca toca em banco ou senha.

---

### Objetos do Spring Security usados no filter

**`UsernamePasswordAuthenticationToken`**

Implementação de `Authentication` mais comum. O número de argumentos define o estado:

```java
// 2 argumentos — pendente (sem authorities): usado no login antes de verificar senha
new UsernamePasswordAuthenticationToken(email, password)

// 3 argumentos — autenticado (com authorities): usado após verificação bem-sucedida
new UsernamePasswordAuthenticationToken(principal, credentials, authorities)
```

No filter, `JwtService.getAuthentication()` cria a versão de 3 argumentos. O terceiro argumento é o sinal para o Spring Security de que "esse cara já foi autenticado — confie nele".

**`WebAuthenticationDetailsSource`**

Adiciona metadados do request ao objeto `Authentication`:

```java
authentication.setDetails(
    new WebAuthenticationDetailsSource().buildDetails(request)
);
```

Captura IP do cliente e session ID. Útil para logs de auditoria e monitoramento. Não afeta lógica de autorização.

**`SecurityContextHolder`**

Armazena o `Authentication` da request atual via `ThreadLocal` — cada thread tem seu contexto isolado:

```java
// Filter seta:
SecurityContextHolder.getContext().setAuthentication(authentication);

// @PreAuthorize, hasAuthority(), controllers leem daqui:
SecurityContextHolder.getContext().getAuthentication();

// Spring Security limpa automaticamente ao fim de cada request
SecurityContextHolder.clearContext();
```

**Fluxo completo no filter:**

```
Authorization: Bearer <token>
  → substring(7) → token puro
  → isTokenValid() → verifica HMAC + exp (sem banco)
  → getAuthentication() → UsernamePasswordAuthenticationToken(userId, null, authorities)
  → setDetails() → adiciona IP + sessionId
  → SecurityContextHolder.setAuthentication()
  → @PreAuthorize e hasAuthority() consultam daqui em diante
```

---

## Senhas — Armazenamento e Verificação

### BCryptPasswordEncoder (fator 12)

Já configurado na `main`:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}
```

Dois métodos no uso:

```java
// Registro — hash antes de salvar:
user.setPassword(passwordEncoder.encode(rawPassword));

// Login — comparação:
passwordEncoder.matches(rawPassword, user.getPassword())  // true/false
```

### Como BCrypt armazena — a string completa

BCrypt nunca guarda senha em texto claro nem hash puro. `encode("minhasenha")` gera:

```
$2a$12$SSSSSSSSSSSSSSSSSSSSSS.HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
  ↑    ↑  ↑                   ↑
alg  custo salt(22 chars)    hash(31 chars)
```

Salt aleatório de 16 bytes, gerado a cada `encode`. Salt diferente a cada chamada — mesma senha gera strings diferentes sempre. Essa string completa vai para o banco; sem coluna separada para o salt.

### Como a verificação funciona

Dúvida natural: "se o salt muda, como verificar depois?"

O salt está embutido na própria string. `matches(senhaDigitada, stringDoBanco)`:

```
1. Extrai custo e salt da string do banco
       custo = 12
       salt  = SSSSSSSSSSSSSSSSSSSSSS

2. Recomputa BCrypt com MESMO salt e custo:
       resultado = bcrypt(senhaDigitada, salt, custo=12)

3. Compara resultado com hash guardado:
       resultado == hash  →  true  (senha correta)
       resultado != hash  →  false (senha errada)
```

Fluxo visual:

```
Registro:
  "minhasenha" → encode() → gera salt aleatório → computa hash
              → "$2a$12$<salt><hash>" → salva no banco

Login:
  "minhasenha" → matches(raw, stored)
              → extrai salt do stored
              → bcrypt(raw, saltExtraído) == hash?
              → true / false
```

BCrypt é **one-way** — impossível descriptografar. Verificação sempre recomputa e compara. Atacante com o banco precisa testar senha por senha.

### Por que fator 12 e não MD5/SHA1

Fator de custo é exponencial: custo 12 = 2¹² = 4096 iterações internas → ~300ms por hash. Lento o suficiente para brute force ser inviável, rápido o suficiente para não prejudicar UX no login.

MD5 e SHA1 são rápidos por design — GPUs fazem bilhões de hashes/segundo. BCrypt é intencionalmente lento e o fator escala conforme o hardware evolui.

---

## Refresh Token — Armazenamento e Segurança

### Por que token opaco e não JWT?

RT como JWT (stateless) elimina consulta ao banco no refresh. Porém, revogação imediata (logout, reuse detection) exige blacklist de qualquer forma — a maioria dos times volta para RT opaco no banco por isso. Complexidade sem ganho real.

### Por que hasheado?

Se o banco vazar, tokens em texto claro são imediatamente utilizáveis pelo atacante. Armazenar SHA-256 do token raw: vazamento do banco não expõe tokens ativos. O token raw só existe na memória do servidor no momento de geração e na cookie do cliente.

### Cookie HttpOnly vs localStorage

| | Cookie HttpOnly | localStorage |
|---|---|---|
| XSS | Atacante não lê via JS | Exposto — XSS rouba token trivialmente |
| CSRF | Mitigado com SameSite=Strict | Não aplicável |
| Acesso JS | Impossível (intencional) | Total |

RT em localStorage é considerado inseguro para tokens de longa duração.

### Flags do cookie

```
Set-Cookie: refreshToken=<valor>;
  HttpOnly;              -- JS não acessa
  Secure;               -- HTTPS obrigatório
  SameSite=Strict;      -- não enviado em requests cross-origin (CSRF)
  Path=/auth/refresh;   -- cookie trafega SOMENTE nesse path
  Max-Age=604800        -- 7 dias
```

`Path=/auth/refresh` é importante: o cookie não vai em toda request da aplicação, reduzindo a superfície de exposição.

---

## Rotação de Refresh Token

### O mecanismo básico

Cada uso do RT gera um novo RT. O RT anterior é marcado como `used=true` e se torna inválido. Isso cria uma corrente:

```
Login → R1
  User usa R1 → R1 used=true, R2 emitido
  User usa R2 → R2 used=true, R3 emitido
  User usa R3 → R3 used=true, R4 emitido
  ...
```

O usuário sempre tem exatamente **um** RT válido.

### O problema sem reuse detection

Se o atacante rouba R3 antes do usuário usá-lo:

```
Atacante usa R3 PRIMEIRO → R3 used=true, R4 emitido para o atacante
Usuário usa R3            → servidor vê used=true → 401

Resultado: usuário perde acesso, atacante tem R4 ativo.
```

---

## Reuse Detection com Family

### O campo `family`

Cada login cria uma sessão com um `family` UUID único. Todos os RTs da corrente de rotação daquela sessão compartilham o mesmo `family`.

```
Login → R1 (family=F1, used=false)
  R1 → R2 (family=F1, used=false), R1 used=true
  R2 → R3 (family=F1, used=false), R2 used=true
  R3 → R4 (family=F1, used=false), R3 used=true
```

### Reuse detection em ação

Quando o servidor recebe um RT já marcado como `used=true`, sabe que a corrente foi comprometida. Com o `family`, revoga **todos os tokens da família** — passados e futuros.

```
Atacante usa R3 PRIMEIRO → R3 used=true, R4 emitido para o atacante (family=F1)
Usuário usa R3            → servidor vê used=true → REUSE DETECTED
                          → servidor revoga TODOS os tokens com family=F1
                          → R4 do atacante é revogado
                          → ambos recebem 401 → re-login forçado
```

### Por que revogar "para trás" não resolve

Os tokens anteriores (R1, R2) já são `used=true` — são inofensivos. O perigo está sempre no token **mais recente** da corrente, que o atacante pode ter. `family` garante que qualquer token gerado a partir do token roubado também morre.

### Diagrama completo

```
Cliente         Back-end              Banco
  │                  │                   │
  │── POST /login ──▶│                   │
  │                  │── INSERT R1 ───────▶│ (family=F1, used=false)
  │◀── AT + R1(cookie)                   │
  │                  │                   │
  │── POST /refresh ▶│                   │
  │   cookie: R1     │── SELECT R1 ──────▶│
  │                  │── UPDATE used=true ▶│
  │                  │── INSERT R2 ───────▶│ (family=F1, used=false)
  │◀── AT₂ + R2(cookie)                  │
  │                  │                   │
  │  (atacante roubou R2)                │
  │                  │                   │
  │── POST /refresh ▶│ (atacante age primeiro)
  │   cookie: R2     │── SELECT R2 ──────▶│
  │                  │── UPDATE used=true ▶│
  │                  │── INSERT R3 ───────▶│ (family=F1) → atacante tem R3
  │◀── AT₃ + R3(cookie) [ATACANTE]        │
  │                  │                   │
  │── POST /refresh ▶│ (usuário tenta com R2)
  │   cookie: R2     │── SELECT R2 ──────▶│
  │                  │◀── used=TRUE ──────│
  │                  │── REVOKE family F1 ▶│ → R3 revogado
  │                  │── LOG security event│
  │◀── 401 ──────────│                   │
  │   (atacante na próxima request com R3 → 401)
  │   (usuário re-loga → nova sessão, novo family)
```

---

## Outras Práticas de Rotação no Mercado

### Expiração

**Fixed expiry**
RT expira N dias a partir da emissão, independente de uso. Simples, previsível. Usuário inativo perde sessão após N dias.

**Sliding expiry**
Cada uso do RT estende o prazo (ex: +7 dias). Usuário ativo nunca perde sessão. Risco: sessão pode durar indefinidamente.

**Absolute max session lifetime**
Obrigatório quando sliding expiry está ativo. Define teto absoluto (ex: 90 dias) independente de atividade. Após isso, re-login obrigatório — mesmo que o usuário tenha usado o app ontem.

---

### Race condition em rotação

Dois problemas distintos com nomes parecidos. Não confundir.

---

#### Problema A — Retry automático (falso positivo)

**Cenário:**
```
Cliente envia POST /auth/refresh com R1
Rede instável → cliente não recebe resposta → HTTP client faz retry com mesmo R1

Servidor já processou o primeiro request:
  → R1 marcado used=true
  → R2 gerado e persistido

Retry chega:
  → busca R1 → used=true
  → REUSE DETECTED → revoga família → 401

Usuário inocente perde sessão.
```

A raiz: servidor processou com sucesso, mas a resposta nunca chegou ao cliente. Do ponto de vista do servidor, o retry é indistinguível de um atacante reutilizando token roubado.

**Grace window — a ideia e por que falha sem Redis**

Ideia: se R1 chega com `used=true` dentro de uma janela curta (ex: 30s), tratar como retry legítimo e devolver o mesmo novo par `(AT, R2)` idempotentemente.

Para isso, ao marcar R1 como usado, armazenar:
- `used_at` — timestamp do uso
- `successor_hash` — hash do R2 que foi emitido (possível porque o servidor gera R2 antes de persistir qualquer coisa, então conhece o hash naquele momento)

Problema fundamental: encontrar o registro R2 pelo `successor_hash` não resolve. O raw value de R2 **nunca foi armazenado** — só o hash. Sem o raw value, não há como devolver R2 no cookie. Usar a família também não resolve pelo mesmo motivo: o registro ativo da família é encontrável, mas o raw value continua inacessível.

**Grace window precisa de Redis:**

```
Ao gerar R2: salvar no Redis
  chave:  hash(R1)
  valor:  { R2_raw, AT_string }
  TTL:    30s

Retry com R1 → used=true → busca no Redis pelo hash(R1)
  hit dentro do TTL  →  devolver R2_raw + AT cached (idempotente)
  miss (TTL expirou) →  REUSE real → revoga família → 401
```

Sem Redis na stack: grace window não é implementável de forma limpa.

**Decisão desta branch:** retry = re-login forçado. Qualquer `used=true` é tratado como reuse, sem exceções. Zero ambiguidade no código. Grace window entra quando Redis aparecer na stack.

---

#### Problema B — Requests simultâneos (corrida entre instâncias)

**Cenário (sem lock):**
```
Dois requests chegam ao mesmo tempo com R1 em instâncias diferentes

  Instância A: SELECT R1 → used=false ✓
  Instância B: SELECT R1 → used=false ✓  ← leu antes de A commitar

  Instância A: UPDATE R1 SET used=true → INSERT R2
  Instância B: UPDATE R1 SET used=true → INSERT R3

Resultado: R2 e R3 ambos válidos no banco.
           Dois clientes com RT ativo na mesma família.
           Reuse detection quebrada — atacante passa despercebido.
```

**SELECT FOR UPDATE — solução sem infra extra**

```sql
SELECT * FROM refresh_tokens WHERE token_hash = ? FOR UPDATE
```

Banco adquire lock na linha. Instância B **bloqueia** (não estoura erro) até A commitar. Ao desbloquear, B lê R1 com `used=true` → retorna 401 pela lógica de negócio normalmente.

**No código:** `@Lock(LockModeType.PESSIMISTIC_WRITE)` no Spring Data instrui o Hibernate a emitir `SELECT ... FOR UPDATE` automaticamente. Sem a anotação, o Hibernate emite um `SELECT` simples e a corrida entre instâncias não é resolvida.

```java
// SELECT ... FOR UPDATE — evita race condition entre instâncias no refresh
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT r FROM RefreshToken r WHERE r.tokenHash = :tokenHash")
Optional<RefreshToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);
```

**Pessimistic vs Optimistic locking:**

| | Pessimistic (`FOR UPDATE`) | Optimistic (coluna `version`) |
|---|---|---|
| Mecanismo | Lock exclusivo na linha | UPDATE falha se `version` mudou |
| Comportamento sob contenção | B aguarda A commitar | B recebe erro; precisa retry |
| Quando usar | Contenção esperada, operação curta | Contenção rara, leitura dominante |

Refresh é operação curta (ms) com lock em linha única por `token_hash` — sem risco de deadlock, sem pressão real no pool.

Comportamento exato:
```
Instância A: SELECT FOR UPDATE → adquire lock → processa → commita
Instância B: SELECT FOR UPDATE → AGUARDA
                                  lock liberado → lê R1 → used=true → 401
```

Impacto no sistema:

| Ponto | Impacto |
|---|---|
| Latência | Mínima — transação de refresh é rápida (ms). B espera A commitar |
| Connection pool | B segura uma conexão enquanto aguarda. Refresh ocorre a cada 15min por usuário — não é hot path, sem pressão real no pool |
| Deadlock | Zero risco — lock em linha única por `token_hash`, sem dependência circular |
| Crash de A | Lock liberado automaticamente quando a conexão fecha |

**Outras opções para referência:**

*Optimistic locking (sem bloqueio de linha):*
Adiciona coluna `version BIGINT`. Update usa `WHERE version = ?`. Se 0 rows updated → outra instância ganhou → 401. Sem bloqueio, melhor em baixa contenção.

*Redis distributed lock (multi-instância com Redis na stack):*
```
SET lock:rt:{token_hash} "1" NX EX 10
```
`NX` = só seta se não existe. Se falhar → outro servidor tem o lock → falhar ou aguardar. Após processar, deleta a key.

**Decisão desta branch:** `SELECT FOR UPDATE`. Zero infra extra, resolve o problema, impacto desprezível no cenário de instância única.

---

### Revogação de acesso

**Logout all devices**
Revogar todas as famílias do usuário (não só a corrente). Usado em "suspeita de comprometimento", troca de senha ou pedido explícito do usuário ("sair de todos os dispositivos").

**JTI (JWT ID) + blacklist no AT**
AT é stateless — continua válido por 15min mesmo após logout. Para revogar ATs antes da expiração, cada AT recebe um `jti` (UUID) e o servidor mantém blacklist em Redis. Toda request consulta o Redis. Trade-off: performance vs. segurança. Geralmente evitado; AT de curta duração é suficiente para a maioria dos cenários.

---

### Contexto e binding

**Device/session metadata no RT**
Armazenar `user-agent`, IP aproximado e nome do dispositivo junto ao RT. Permite:
- Exibir sessões ativas ao usuário: "iPhone — São Paulo — há 2 dias"
- Revogação seletiva por dispositivo
- Detecção de anomalia: RT sendo usado de contexto muito diferente do original

**Token binding**
Vincular RT a um fingerprint do cliente (device ID, TLS channel binding). Token roubado não funciona em outro dispositivo. Complexo de implementar corretamente — raro em APIs REST, mais comum em aplicações de alto risco (banking).

---

### UX de sessão

**Silent refresh**
Front-end não espera AT expirar para pedir refresh. Quando AT tem ~20% de vida restante (ex: 3min de 15), dispara refresh em background. Usuário nunca vê falha de autenticação nem é redirecionado para login inesperadamente.

**Remember me**
RT com expiração maior (ex: 30 dias) quando usuário marca a opção. Expiração padrão menor (ex: 1 dia) para sessão sem remember me. Sliding expiry faz mais sentido combinado com remember me.

---

### RT stateless (abordagem alternativa)

RT como JWT assinado em vez de UUID opaco. Elimina consulta ao banco no refresh — o RT carrega seus próprios claims (userId, family, exp). Trade-off:

| | RT opaco (banco) | RT stateless (JWT) |
|---|---|---|
| Revogação imediata | Trivial — delete/revoke no banco | Exige blacklist + JTI, senão impossível |
| Performance no refresh | 1 SELECT | 0 SELECT |
| Reuse detection | Simples — campo `used` | Complexo — precisa de estado de qualquer forma |
| Vazamento de banco | Tokens hasheados, sem risco | Chave de assinatura vira ponto crítico |

A maioria dos times que tenta RT stateless volta para RT no banco ao se deparar com os requisitos de revogação.

---

## Entidade `RefreshToken`

```
refresh_tokens
├── id           BIGSERIAL PK
├── token_hash   VARCHAR(64) UNIQUE NOT NULL   -- SHA-256 hex do token raw
├── user_id      FK → users
├── family       UUID NOT NULL                 -- identificador da sessão/corrente
├── used         BOOLEAN DEFAULT false         -- já foi trocado por novo RT?
├── revoked      BOOLEAN DEFAULT false         -- explicitamente invalidado?
├── expires_at   TIMESTAMPTZ NOT NULL
└── created_at   TIMESTAMPTZ NOT NULL
```

**Índices necessários:**
- `token_hash` — lookup no refresh (crítico, toda request de refresh bate aqui)
- `(family, revoked)` — revogação em massa da família
- `(user_id, revoked)` — logout all devices

### Estratégia de indexação

**`UNIQUE` cria índice implícito**

`UNIQUE` no PostgreSQL cria automaticamente um B-tree index. Definir `UNIQUE` em `token_hash` já garante o índice de lookup — `CREATE INDEX` separado seria redundante.

**Índice composto `(A, B)` — regra de ordem**

Um índice composto em `(A, B)` cobre queries que filtram por:
- `A` sozinho
- `A + B` juntos

**Não** cobre queries que filtram somente por `B`.

```sql
-- coberto por (family, revoked):
WHERE family = ?                       -- ✓ A sozinho
WHERE family = ? AND revoked = FALSE   -- ✓ A + B

-- NÃO coberto — precisaria de índice separado em revoked:
WHERE revoked = FALSE                  -- ✗ B sozinho
```

**Por que `family` vem antes de `revoked`?**

`family` é UUID único por sessão — altamente seletivo. `revoked` é booleano — baixíssima seletividade (quase tudo é `false`). O campo mais seletivo sempre vem primeiro: o banco elimina o máximo de linhas logo na primeira coluna do índice.

Mesma lógica em `(user_id, revoked)`: `user_id` filtra para os tokens de um usuário específico; `revoked` afina o resultado. Inverter a ordem forçaria o banco a varrer todos os registros com `revoked = false` antes de filtrar por usuário.

---

## Fluxos desta branch

### Register

```
POST /auth/register  { email, password, name }
  → validar unicidade do email
  → BCrypt(password, fator=12)
  → criar User com role CUSTOMER
  ← 201 { id, email, name, createdAt }
```

Sem auto-login — separação explícita obriga o cliente a entender o fluxo.

### Login

```
POST /auth/login  { email, password }
  → load User by email           (401 genérico — anti-enumeration)
  → BCrypt.matches               (tempo constante)
  → checar enabled/locked
  → gerar AT: JWT HS256, 15min
      claims: sub=userId, email, roles[], authorities[], iat, exp
  → gerar RT: UUID.randomUUID()
  → hash RT: SHA-256
  → persistir RefreshToken(hash, userId, family=new UUID, used=false, expiresAt=now+7d)
  ← 200 { accessToken, user: { id, email, name, roles } }
      Set-Cookie: refreshToken=<raw>; HttpOnly; Secure; SameSite=Strict;
                  Path=/auth/refresh; Max-Age=604800
```

### Refresh

```
POST /auth/refresh  (cookie: refreshToken=<raw>)
  → hash incoming RT
  → buscar por tokenHash no banco
  → se não encontrado         → 401
  → se revoked=true           → 401
  → se expirado               → 401
  → se used=true              → revogar família inteira → log security event → 401
  → marcar old RT como used=true
  → gerar novo AT
  → gerar novo RT (mesma family)
  → persistir novo RefreshToken
  ← 200 { accessToken }
      Set-Cookie: refreshToken=<new raw>; (mesmas flags)
```

### Logout

```
POST /auth/logout  (Bearer AT + cookie RT)
  → hash incoming RT
  → buscar por tokenHash
  → marcar revoked=true
  → limpar cookie (Max-Age=0)
  ← 204 No Content
```

---

## Autorização — Spring Security e a fonte das authorities

### A única fonte que importa: `SecurityContextHolder`

Tanto `@PreAuthorize` quanto as regras do `SecurityConfig` consultam **sempre** o mesmo lugar:

```java
SecurityContextHolder.getContext().getAuthentication().getAuthorities()
```

No nosso fluxo, quem popula esse `Authentication` é o `JwtAuthFilter`:

```java
// authorities vêm dos claims do AT — não do banco, não do UserDetails
SecurityContextHolder.getContext().setAuthentication(
    jwtService.getAuthentication(token)
);
```

```java
// JwtService.getAuthentication() — monta Authentication a partir dos claims
public UsernamePasswordAuthenticationToken getAuthentication(String token) {
    Claims claims = extractClaims(token);
    List<SimpleGrantedAuthority> authorities = claims.get("authorities", List.class)
            .stream()
            .map(a -> new SimpleGrantedAuthority((String) a))
            .toList();
    return new UsernamePasswordAuthenticationToken(claims.getSubject(), null, authorities);
}
```

---

### Por que authorities no `UserDetailsService` são desnecessárias aqui

`UserDetailsService.loadUserByUsername()` é chamado **exclusivamente** pelo `AuthenticationManager` no login para verificar credenciais. O `AuthenticationManager` retorna um `Authentication` populado com as authorities do `UserDetails` — mas no `AuthService`, esse retorno é descartado. O que vai para o `SecurityContextHolder` é o `Authentication` montado pelo `JwtAuthFilter` com dados do AT.

Logo, as authorities carregadas no `UserDetailsService` nunca chegam ao `SecurityContextHolder` e nunca são consultadas por `@PreAuthorize` ou `hasAuthority()`.

**O que o `UserDetails` precisa de fato neste fluxo:**
- `username` (email) — identificação
- `password` (hash) — verificação BCrypt
- `enabled` / `locked` — Spring Security rejeita login automaticamente se ativos

**Quando authorities no `UserDetails` importariam:** se o projeto usasse form login padrão do Spring Security ou sessões, onde o `Authentication` retornado pelo `AuthenticationManager` ficaria no `SecurityContextHolder` para requests futuras. No fluxo JWT stateless, isso não acontece.

---

### `SecurityConfig` vs `@PreAuthorize` — diferença e combinação

Não há diferença na fonte das authorities — ambos consultam o `SecurityContextHolder`. A distinção é **onde e quando** a regra é avaliada:

| | `SecurityConfig` | `@PreAuthorize` |
|---|---|---|
| Nível | URL / rota | Método Java |
| Avaliado por | Filtro do Spring Security | Spring AOP |
| Quando falha | Antes de entrar no controller | Ao invocar o método |
| Acesso a parâmetros | Não | Sim (SpEL) |
| Uso típico | Regras grossas estruturais | Regras finas por operação |

**Uso combinado — padrão desta branch:**

```java
// SecurityConfig — regra grossa: qualquer endpoint não-público exige AT válido
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/**").permitAll()
    .anyRequest().authenticated()
)
```

```java
// Controller — regra fina: authority específica por operação
@PreAuthorize("hasAuthority('product:read')")
public ResponseEntity<?> listarProdutos() { ... }

@PreAuthorize("hasAuthority('product:write')")
public ResponseEntity<?> criarProduto(...) { ... }
```

**Fluxo com os dois combinados:**

```
Request chega
  → SecurityConfig: AT válido? (JwtAuthFilter já populou o SecurityContext)
      não → 401
      sim → controller invocado
  → @PreAuthorize: tem a authority específica?
      não → 403
      sim → método executa
```

**Vantagem da combinação:** `SecurityConfig` garante que nenhum endpoint fica aberto sem autenticação — segurança por padrão. `@PreAuthorize` garante autorização granular por operação — mesmo que um endpoint seja esquecido no `SecurityConfig`, o método ainda está protegido individualmente.

---

## Decisões de segurança

| Decisão | Razão |
|---|---|
| RT opaco hasheado (SHA-256) | Vazamento de BD não expõe tokens ativos |
| RT em cookie HttpOnly | XSS não acessa o token |
| `Path=/auth/refresh` no cookie | Cookie não trafega em toda request |
| `SameSite=Strict` | CSRF: browser não envia cookie cross-origin |
| HS256 (não RS256) | Serviço único; RS256 entra em `feature/auth-server` |
| AT stateless (sem DB call no filter) | Performance; janela 15min aceitável sem blacklist |
| Generic 401 em falha de login | Previne enumeration de emails |
| Reuse detection via family | Theft detectável mesmo quando atacante age primeiro |
| BCrypt fator 12 | Resistência a brute force; herdado da main |
| Sem AT blacklist nesta branch | Custo/complexidade alto; JTI entra em branch posterior |
| Retry = re-login forçado | Grace window exige Redis; sem Redis, qualquer `used=true` é reuse — zero ambiguidade |
| SELECT FOR UPDATE no refresh | Resolve corrida entre instâncias sem infra extra; lock de linha, não de tabela |

---

## O que esta branch NÃO implementa (e por quê)

| Recurso | Motivo da ausência | Onde entra |
|---|---|---|
| RS256 / ES256 | Sem múltiplos serviços validando AT | `feature/auth-server` |
| JTI + AT blacklist | Complexidade alta, ganho baixo com AT de 15min | Branch posterior |
| Distributed lock no refresh | Sem deploy multi-instância no estudo | Branch posterior |
| Grace window | Exige Redis para armazenar `{R1_hash → R2_raw}` temporariamente; sem Redis, implementação limpa impossível | Branch com Redis |
| Rate limiting / account lockout | Proteção de brute force | Branch posterior |
| Device metadata | Além do escopo desta iteração | Branch posterior |

---

## Front-end — Arquitetura de Autenticação

O front-end é um cliente de integração — não é o foco do projeto. Mas a camada de autenticação no cliente tem decisões de design relevantes que refletem os mesmos princípios do back: tokens fora do localStorage, renovação transparente, sem estado duplicado.

### Camadas e responsabilidades

```
models/auth.ts          → tipos: UserInfo, LoginResponse, RefreshResponse
services/authService.ts → chamadas HTTP brutas (sem lógica)
lib/api.ts              → instância Axios com baseURL e withCredentials
lib/interceptors.ts     → AT em memória, refresh automático, mutex anti-StrictMode
contexts/auth/          → estado global de autenticação (Provider + contexto)
hooks/useAuth.ts        → acesso ao contexto com fail-fast
```

Cada camada tem uma única responsabilidade. `authService` não sabe de tokens; `interceptors` não sabe de estado React; `AuthContext` não sabe de HTTP.

---

### `models/auth.ts` — Tipos de resposta

```typescript
export interface UserInfo {
  id: number
  email: string
  name: string
  roles: string[]        // "CUSTOMER", "ADMIN"
  authorities: string[]  // "product:read", "order:write"
}

export interface LoginResponse {
  accessToken: string
  user: UserInfo
}

export interface RefreshResponse {
  accessToken: string  // refresh não devolve user — AT traz as claims
}
```

`UserInfo` usa `string[]` para roles e authorities — não os objetos completos `Role`/`Authority`. O AT carrega esses valores como strings; o front só precisa exibi-los ou checar permissões simples, não navegar a estrutura de objetos completos.

`User` (objeto completo de gerenciamento) e `UserInfo` (objeto de sessão autenticada) são tipos distintos intencionalmente — contextos de uso diferentes.

---

### `lib/api.ts` — Instância Axios

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})
```

**`withCredentials: true`** é o ponto crítico. Sem ele, o browser não envia nem recebe cookies cross-origin — o RT em cookie HttpOnly nunca chegaria ao servidor no refresh. Toda request da aplicação passa por essa instância, então o cookie é enviado automaticamente em `POST /auth/refresh` sem nenhuma ação extra no código.

`baseURL` via variável de ambiente — nunca hardcoded. Em produção, troca de `http://localhost:8080` para o domínio real sem tocar em código.

---

### `services/authService.ts` — Chamadas HTTP

```typescript
export const authService = {
  register: (body) => api.post<LoginResponse>('/auth/register', body).then(r => r.data),
  login:    (body) => api.post<LoginResponse>('/auth/login', body).then(r => r.data),
  refresh:  ()     => api.post<RefreshResponse>('/auth/refresh').then(r => r.data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get<UserInfo>('/auth/me').then(r => r.data),
}
```

Wrapper fino: cada método mapeia para um endpoint e extrai `r.data`. Sem lógica de token, sem estado, sem efeitos colaterais. Fácil de testar e substituir.

`refresh()` não precisa passar token no body — o RT chega via cookie (gerenciado pelo browser automaticamente graças ao `withCredentials`).

---

### `lib/interceptors.ts` — O núcleo da autenticação

Este arquivo centraliza três responsabilidades distintas:

#### 1. AT em memória de módulo

```typescript
let _accessToken: string | null = null

export const getAccessToken = () => _accessToken
export const updateAccessToken = (token: string | null) => { _accessToken = token }
```

AT vive em variável de módulo — não em `localStorage`, não em `sessionStorage`. Módulos JS são singletons (cacheados pelo bundler): uma única instância compartilhada por toda a aplicação.

**Por que não localStorage:** XSS pode ler `localStorage` trivialmente. AT em memória não é acessível por scripts injetados.

**Por que não só o state do React:** interceptors Axios rodam fora do ciclo React. Se o AT estivesse só no state, o interceptor de request não conseguiria lê-lo sem hooks (que não podem ser chamados fora de componentes).

O `AuthContext` mantém o AT também no state React — para re-render quando muda. Os dois ficam sincronizados via `setToken()` no Provider.

---

#### 2. `restoreSession()` — Mutex contra StrictMode

```typescript
let _restorePromise: Promise<{ accessToken: string }> | null = null

export function restoreSession(): Promise<{ accessToken: string }> {
  if (!_restorePromise) {
    _restorePromise = authService.refresh()
      .finally(() => { _restorePromise = null })
  }
  return _restorePromise
}
```

**O problema:** React StrictMode (desenvolvimento) monta → desmonta → remonta componentes propositalmente para detectar efeitos colaterais não-limpos. `useEffect` dispara duas vezes. Sem proteção, duas chamadas a `POST /auth/refresh` saem do cliente com o mesmo RT:

```
Call 1 → POST /auth/refresh (RT válido) → servidor: R1 used=true, R2 emitido
Call 2 → POST /auth/refresh (mesmo RT)  → servidor: R1 used=true → REUSE DETECTED → 401
```

**A solução:** promise de módulo compartilhada. JavaScript é single-thread — o `if (!_restorePromise)` e o `_restorePromise = ...` executam sincronicamente, sem ceder controle ao event loop. Call 2 chega quando `_restorePromise` já está setada e retorna a mesma promise. Apenas uma request chega ao servidor.

```
Call 1 → _restorePromise = null  → cria promise → POST /auth/refresh (única request)
Call 2 → _restorePromise != null → retorna mesma promise (sem request)
Promise resolve → ambas recebem o mesmo novo AT
```

O `finally` limpa a promise após resolver — logout seguido de novo login funciona corretamente (nova chamada cria nova promise).

**Diferença do Problema A (retry automático):** no StrictMode ambas as calls partem antes de qualquer uma ser processada — o mutex client-side intercepta a segunda antes de sair da rede. No retry real (rede instável), o servidor já consumiu o RT quando o retry chega — exige solução server-side com Redis. São problemas com aparência similar mas raízes distintas.

---

#### 3. Interceptors Axios

```typescript
export function setupInterceptors({ onRefreshed, onAuthFailed }: InterceptorCallbacks): () => void {
  const requestInterceptor = api.interceptors.request.use(config => {
    if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`
    return config
  })

  let refreshPromise: Promise<{ at: string }> | null = null

  const responseInterceptor = api.interceptors.response.use(
    response => response,
    async error => { ... }
  )

  return () => {
    api.interceptors.request.eject(requestInterceptor)
    api.interceptors.response.eject(responseInterceptor)
  }
}
```

**Request interceptor:** injeta `Authorization: Bearer <AT>` em toda request onde `_accessToken` existe. Transparente para o resto da aplicação — nenhum service ou componente precisa gerenciar headers.

**Response interceptor — fluxo de 401:**

```typescript
const SKIP_REFRESH = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/logout']
if (SKIP_REFRESH.some(path => request.url?.includes(path))) return Promise.reject(error)

if (error.response?.status !== 401 || request._retry) return Promise.reject(error)

request._retry = true
```

`SKIP_REFRESH`: endpoints de auth não devem disparar refresh quando falham — um 401 em `/auth/login` é credencial errada, não AT expirado. Sem essa lista, uma senha incorreta causaria loop de refresh.

`request._retry`: flag que marca a request original. Se o refresh falhar e a request retentada receber outro 401, o `_retry = true` impede novo ciclo — evita loop infinito.

**`refreshPromise` — mutex para requests concorrentes:**

```typescript
if (!refreshPromise) {
  refreshPromise = authService.refresh()
    .then(data => {
      updateAccessToken(data.accessToken)
      onRefreshed(data.accessToken)
      return { at: data.accessToken }
    })
    .catch(err => {
      onAuthFailed()
      window.location.href = `/login?from=${encodeURIComponent(...)}`
      return Promise.reject(err)
    })
    .finally(() => { refreshPromise = null })
}

const { at } = await refreshPromise
request.headers.Authorization = `Bearer ${at}`
return api(request)
```

Se múltiplas requests recebem 401 simultaneamente (AT expirado), todas entram no interceptor ao mesmo tempo. Sem o mutex, todas disparariam `POST /auth/refresh` — apenas a primeira usaria RT válido, as demais encontrariam RT já rotacionado → reuse detection → logout forçado.

Com `refreshPromise`: primeira call cria a promise, demais aguardam. Quando a promise resolve, todas recebem o mesmo novo AT e re-tentam suas requests originais com o token correto.

`onRefreshed` e `onAuthFailed` são callbacks injetados pelo `AuthContext` — ponte entre o interceptor (fora do React) e o estado React. Inversão de dependência: o interceptor não importa o contexto diretamente.

**Retorno da função (cleanup):**

```typescript
return () => {
  api.interceptors.request.eject(requestInterceptor)
  api.interceptors.response.eject(responseInterceptor)
}
```

`setupInterceptors` retorna uma função de cleanup. Usada pelo `useEffect` do `AuthContext` — quando o componente desmonta (incluindo o ciclo do StrictMode), os interceptors são removidos. Sem isso, o StrictMode acumularia interceptors duplicados a cada ciclo.

---

### `contexts/auth/authContext.ts` — Definição do Contexto

```typescript
export interface AuthContextValue {
  user: UserInfo | null
  accessToken: string | null
  isAuthenticated: boolean
  initializing: boolean
  login: (...) => Promise<void>
  register: (...) => Promise<void>
  logout: () => Promise<void>
  setAccessToken: (token: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
```

Separado do Provider intencionalmente. `authContext.ts` exporta só a definição — sem dependência de `authService`, `interceptors` ou React state. Componentes que só leem o contexto importam daqui; só o Provider precisa do arquivo maior.

`createContext(null)` como default — se `useAuth()` for chamado fora do Provider, o `null` causa um erro explícito e claro (via `useAuth`) em vez de comportamento silencioso e difícil de rastrear.

---

### `contexts/auth/AuthContext.tsx` — Provider

```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [accessToken, _setAccessToken] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
```

**`initializing`:** flag que indica que a sessão ainda está sendo restaurada. A aplicação exibe um loading enquanto `true` — evita o flash onde rotas protegidas redirecionam para login antes de confirmar que há sessão válida. Só vira `false` no `.finally()` do `restoreSession()`.

**`setToken()` — sincronização de dois estados:**

```typescript
function setToken(token: string | null) {
  updateAccessToken(token) // módulo de interceptors
  _setAccessToken(token)   // state do React
}
```

AT precisa existir em dois lugares: variável de módulo (acessível pelos interceptors fora do React) e state React (causa re-render quando muda, expõe via contexto). `setToken` garante que os dois ficam sempre em sincronia.

**`useEffect` — ordem de operações:**

```typescript
useEffect(() => {
  const eject = setupInterceptors({
    onRefreshed: token => _setAccessToken(token),
    onAuthFailed: clearAuth,
  })

  restoreSession()
    .then(data => {
      setToken(data.accessToken)
      return authService.me()
    })
    .then(data => setUser(data))
    .catch(() => {})
    .finally(() => setInitializing(false))

  return eject
}, [clearAuth])
```

Interceptors são registrados **antes** de `restoreSession()`. Se `me()` receber um 401 (AT expirado na janela de restauração), o interceptor já está de pé para interceptar e fazer refresh. Inverter a ordem criaria uma janela onde requests podem falhar sem tratamento.

`onRefreshed` usa `_setAccessToken` (não `setToken`) — quando o interceptor notifica que houve refresh, o AT já foi atualizado no módulo via `updateAccessToken` dentro do próprio interceptor. Chamar `setToken` aqui atualizaria o módulo novamente (redundante) mas seria inofensivo. Usar `_setAccessToken` é mais preciso.

`clearAuth` via `useCallback` — estabiliza a referência para não recriar o `useEffect` a cada render.

---

### `hooks/useAuth.ts`

```typescript
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

Wrapper sobre `useContext` com fail-fast. Sem o `throw`, `ctx` seria `null` fora do Provider e erros apareceriam como "cannot read property of null" em lugares aleatórios. O throw localiza o problema na fonte.

---

### Fluxos completos no front

#### Boot (primeiro carregamento)

```
App monta → AuthProvider monta
  → useEffect dispara
  → setupInterceptors() registra request + response interceptors
  → restoreSession() → POST /auth/refresh
      → 200: setToken(AT) → authService.me() → setUser(data) → initializing=false
      → 401: catch() → initializing=false (usuário não autenticado, fluxo normal)
```

#### Login

```
Usuário submete form
  → authService.login({ email, password })
  → POST /auth/login → 200 { accessToken, user }
  → setToken(accessToken)   → AT no módulo + state
  → setUser(user)
  → isAuthenticated = true → router redireciona
```

#### Request com AT expirado

```
Qualquer request protegida → 401
  → response interceptor captura
  → não está em SKIP_REFRESH, não tem _retry → refresh flow
  → refreshPromise não existe → POST /auth/refresh
      → 200: updateAccessToken + onRefreshed → state atualizado
      → request original retentada com novo AT
      → 200: dados chegam normalmente ao componente
      → 401: onAuthFailed → clearAuth → redirect /login
```

#### Logout

```
logout() chamado
  → authService.logout() → POST /auth/logout
      → back revoga RT no banco, limpa cookie (Max-Age=0)
  → clearAuth() → setToken(null) + setUser(null)
  → isAuthenticated = false → router redireciona
```

---

### Decisões de design front-end

| Decisão | Razão |
|---|---|
| AT em variável de módulo, não localStorage | XSS não acessa memória de módulo |
| AT também no state React | Re-render ao mudar; exposto via contexto para componentes |
| `withCredentials: true` na instância Axios | RT em cookie HttpOnly precisa dessa flag para trafegar cross-origin |
| `restoreSession()` com promise de módulo | StrictMode dispara `useEffect` duas vezes; mutex evita dupla rotação de RT |
| Interceptors registrados antes de `restoreSession()` | `me()` pode receber 401; interceptor precisa estar ativo |
| `setupInterceptors` retorna cleanup | StrictMode acumularia interceptors duplicados sem eject |
| `initializing` flag | Evita redirect prematuro para login antes de confirmar sessão |
| `authContext.ts` separado do Provider | Componentes leitores não dependem das importações pesadas do Provider |
| Callbacks `onRefreshed`/`onAuthFailed` | Interceptor não importa React diretamente — inversão de dependência |
