# ConectaDEV API Mock

API desenvolvida em **Node.js nativo** (sem frameworks) para o projeto ConectaDEV (WorldSkills - Módulo D). Utiliza um sistema de persistência simples baseado em ficheiro JSON com autenticação JWT.

## 🛠️ Requisitos
* **Node.js** (v14 ou superior)
* Não é necessário instalar dependências externas

## 🚀 Como Iniciar
1. Certifique-se de que `server.js`, `data.json` e `swagger.json` estão no mesmo diretório
2. No terminal, execute:
   ```bash
   node server.js
   ```
3. O servidor estará ativo em: `http://localhost:3000`

## 📖 Documentação e Testes
Para facilitar o desenvolvimento do Front-End e validar os endpoints, acede à interface interativa:
```
http://localhost:3000/docs
```
(Interface Swagger UI - totalmente interativa para testar todas as rotas)

---

## 🔐 Autenticação (JWT)

### Registrar Novo Utilizador
**`POST /api/auth/register`**

Cria uma nova conta de utilizador na plataforma.

**Body (JSON):**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "senha": "senha123"
}
```

**Resposta (201 - Sucesso):**
```json
{
  "id": 2,
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999"
}
```

**Erros:**
- `400` - E-mail já registado ou dados obrigatórios em falta
- `400` - Dados inválidos (JSON malformado)

---

### Realizar Login
**`POST /api/auth/login`**

Autentica o utilizador e retorna um token JWT válido por 2 horas.

**Body (JSON):**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta (200 - Sucesso):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "11999999999"
  }
}
```

**Erros:**
- `401` - Credenciais inválidas (e-mail ou senha incorretos)
- `400` - Dados inválidos (JSON malformado)

---

## 🖇️ Recursos CRUD

> **Nota:** Todas as rotas CRUD usam a URL base: `http://localhost:3000/api/`

### 1. UTILIZADORES (`/users`)

#### Listar Todos os Utilizadores
**`GET /api/users`** (Sem autenticação)

Retorna lista de todos os utilizadores registados.

**Resposta (200):**
```json
[
  {
    "id": 1,
    "nome": "Pedro Lucas",
    "email": "pedro@conectadev.com",
    "telefone": "11999999999"
  }
]
```

**Nota:** As senhas nunca são retornadas por segurança.

---

#### Obter Utilizador Específico
**`GET /api/users/{id}`** (Sem autenticação)

Retorna dados de um utilizador específico pelo ID.

**Exemplo:** `GET /api/users/1`

**Resposta (200):**
```json
{
  "id": 1,
  "nome": "Pedro Lucas",
  "email": "pedro@conectadev.com",
  "telefone": "11999999999"
}
```

**Erros:**
- `404` - Utilizador não encontrado

---

#### Criar Novo Utilizador
**`POST /api/users`** (Requer Token JWT)

Cria um novo utilizador (alternativa ao /register).

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nome": "Maria Costa",
  "email": "maria@email.com",
  "telefone": "11988888888",
  "senha": "senha456"
}
```

**Resposta (201):**
```json
{
  "id": 3,
  "nome": "Maria Costa",
  "email": "maria@email.com",
  "telefone": "11988888888",
  "senha": "senha456"
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `400` - Dados inválidos

---

#### Atualizar Utilizador
**`PUT /api/users/{id}`** (Requer Token JWT)

Atualiza dados de um utilizador existente.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Exemplo:** `PUT /api/users/1`

**Body (JSON):**
```json
{
  "nome": "Pedro Silva",
  "telefone": "11977777777"
}
```

**Resposta (200):**
```json
{
  "id": 1,
  "nome": "Pedro Silva",
  "email": "pedro@conectadev.com",
  "telefone": "11977777777",
  "senha": "password123"
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `404` - Utilizador não encontrado
- `400` - ID obrigatório / Dados inválidos

---

#### Eliminar Utilizador
**`DELETE /api/users/{id}`** (Requer Token JWT)

Remove um utilizador da plataforma.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
```

**Exemplo:** `DELETE /api/users/2`

**Resposta (200):**
```json
{
  "message": "Item deletado com sucesso"
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `404` - Utilizador não encontrado
- `400` - ID obrigatório

---

### 2. TAGS (Categorias) (`/tags`)

#### Listar Todas as Tags
**`GET /api/tags`** (Sem autenticação)

Retorna todas as categorias disponíveis.

**Resposta (200):**
```json
[
  { "id": 1, "name": "javascript" },
  { "id": 2, "name": "html" },
  { "id": 3, "name": "css" },
  { "id": 4, "name": "php" },
  { "id": 5, "name": "nodejs" },
  { "id": 6, "name": "python" },
  { "id": 7, "name": "coding" }
]
```

---

#### Obter Tag Específica
**`GET /api/tags/{id}`** (Sem autenticação)

Retorna uma tag específica pelo ID.

**Exemplo:** `GET /api/tags/1`

**Resposta (200):**
```json
{
  "id": 1,
  "name": "javascript"
}
```

**Erros:**
- `404` - Tag não encontrada

---

#### Criar Nova Tag
**`POST /api/tags`** (Requer Token JWT)

Cria uma nova categoria.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "react"
}
```

**Resposta (201):**
```json
{
  "id": 8,
  "name": "react"
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `400` - Dados inválidos

---

#### Atualizar Tag
**`PUT /api/tags/{id}`** (Requer Token JWT)

Atualiza uma tag existente.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Exemplo:** `PUT /api/tags/1`

**Body (JSON):**
```json
{
  "name": "javascript-es6"
}
```

**Resposta (200):**
```json
{
  "id": 1,
  "name": "javascript-es6"
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `404` - Tag não encontrada
- `400` - ID obrigatório / Dados inválidos

---

#### Eliminar Tag
**`DELETE /api/tags/{id}`** (Requer Token JWT)

Remove uma tag do sistema.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
```

**Exemplo:** `DELETE /api/tags/8`

**Resposta (200):**
```json
{
  "message": "Item deletado com sucesso"
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `404` - Tag não encontrada
- `400` - ID obrigatório

---

### 3. PUBLICAÇÕES (`/posts`)

#### Listar Todas as Publicações
**`GET /api/posts`** (Sem autenticação)

Retorna todas as publicações da plataforma.

**Resposta (200):**
```json
[
  {
    "id": 1,
    "authorId": 1,
    "title": "Como centralizar uma div de forma moderna",
    "description": "Dicas rápidas de CSS.",
    "content": "Para centralizar uma div hoje em dia, o *flexbox* é a melhor abordagem.",
    "tags": ["css", "html"],
    "createdAt": "2026-04-28T10:00:00Z",
    "views": 1542,
    "isAnswered": true
  }
]
```

---

#### Obter Publicação Específica
**`GET /api/posts/{id}`** (Sem autenticação)

Retorna uma publicação específica pelo ID.

**Exemplo:** `GET /api/posts/1`

**Resposta (200):** (Mesmo formato acima)

**Erros:**
- `404` - Publicação não encontrada

---

#### Criar Nova Publicação
**`POST /api/posts`** (Requer Token JWT)

Cria uma nova publicação/pergunta na plataforma.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "authorId": 1,
  "title": "Como usar async/await em JavaScript?",
  "description": "Dúvida sobre programação assíncrona",
  "content": "Alguém pode explicar o conceito de async/await?",
  "tags": ["javascript", "nodejs"],
  "createdAt": "2026-04-28T11:00:00Z",
  "views": 0,
  "isAnswered": false
}
```

**Resposta (201):**
```json
{
  "id": 2,
  "authorId": 1,
  "title": "Como usar async/await em JavaScript?",
  "description": "Dúvida sobre programação assíncrona",
  "content": "Alguém pode explicar o conceito de async/await?",
  "tags": ["javascript", "nodejs"],
  "createdAt": "2026-04-28T11:00:00Z",
  "views": 0,
  "isAnswered": false
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `400` - Dados inválidos

---

#### Atualizar Publicação
**`PUT /api/posts/{id}`** (Requer Token JWT)

Atualiza uma publicação existente.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Exemplo:** `PUT /api/posts/1`

**Body (JSON):**
```json
{
  "title": "Como centralizar uma div com CSS Flexbox",
  "views": 1600,
  "isAnswered": true
}
```

**Resposta (200):** (Objeto atualizado com todos os campos)

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `404` - Publicação não encontrada
- `400` - ID obrigatório / Dados inválidos

---

#### Eliminar Publicação
**`DELETE /api/posts/{id}`** (Requer Token JWT)

Remove uma publicação da plataforma.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
```

**Exemplo:** `DELETE /api/posts/2`

**Resposta (200):**
```json
{
  "message": "Item deletado com sucesso"
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `404` - Publicação não encontrada
- `400` - ID obrigatório

---

### 4. COMENTÁRIOS (`/comments`)

#### Listar Todos os Comentários
**`GET /api/comments`** (Sem autenticação)

Retorna todos os comentários e avaliações.

**Resposta (200):**
```json
[
  {
    "id": 1,
    "postId": 1,
    "authorId": 1,
    "authorName": "Pedro Lucas",
    "content": "Excelente dica!",
    "upvotes": 10,
    "downvotes": 0,
    "createdAt": "2026-04-28T10:30:00Z"
  }
]
```

---

#### Obter Comentário Específico
**`GET /api/comments/{id}`** (Sem autenticação)

Retorna um comentário específico pelo ID.

**Exemplo:** `GET /api/comments/1`

**Resposta (200):** (Mesmo formato acima)

**Erros:**
- `404` - Comentário não encontrado

---

#### Criar Novo Comentário
**`POST /api/comments`** (Requer Token JWT)

Adiciona um novo comentário a uma publicação.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "postId": 1,
  "authorId": 1,
  "authorName": "Pedro Lucas",
  "content": "Muito útil, obrigado!",
  "upvotes": 0,
  "downvotes": 0,
  "createdAt": "2026-04-28T11:30:00Z"
}
```

**Resposta (201):**
```json
{
  "id": 2,
  "postId": 1,
  "authorId": 1,
  "authorName": "Pedro Lucas",
  "content": "Muito útil, obrigado!",
  "upvotes": 0,
  "downvotes": 0,
  "createdAt": "2026-04-28T11:30:00Z"
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `400` - Dados inválidos

---

#### Atualizar Comentário
**`PUT /api/comments/{id}`** (Requer Token JWT)

Atualiza um comentário existente.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Exemplo:** `PUT /api/comments/1`

**Body (JSON):**
```json
{
  "content": "Excelente dica, muito bem explicado!",
  "upvotes": 15
}
```

**Resposta (200):** (Objeto atualizado com todos os campos)

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `404` - Comentário não encontrado
- `400` - ID obrigatório / Dados inválidos

---

#### Eliminar Comentário
**`DELETE /api/comments/{id}`** (Requer Token JWT)

Remove um comentário da plataforma.

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
```

**Exemplo:** `DELETE /api/comments/1`

**Resposta (200):**
```json
{
  "message": "Item deletado com sucesso"
}
```

**Erros:**
- `401` - Token não fornecido
- `403` - Token inválido ou expirado
- `404` - Comentário não encontrado
- `400` - ID obrigatório

---

## 🔑 Autenticação e Autorização

### Token JWT
- **Algoritmo:** HS256 (HMAC with SHA-256)
- **Validade:** 2 horas (7.200.000 ms)
- **Formato:** `Bearer {token}`

### Rotas Protegidas
As seguintes operações exigem um token JWT válido no header `Authorization`:
- `POST /api/{recurso}` - Criar
- `PUT /api/{recurso}/{id}` - Atualizar
- `DELETE /api/{recurso}/{id}` - Eliminar

### Rotas Públicas
Não requerem autenticação:
- `GET /api/{recurso}` - Listar
- `GET /api/{recurso}/{id}` - Obter específico
- `POST /api/auth/register` - Registar
- `POST /api/auth/login` - Login

---

## ⚙️ Características Técnicas

### Segurança
✅ Autenticação JWT (tokens com expiração)  
✅ Senhas nunca são retornadas nas respostas GET  
✅ Validação de token em rotas de modificação  
✅ CORS habilitado para desenvolvimento front-end  

### Persistência de Dados
✅ Todos os dados são armazenados em `data.json`  
✅ Alterações (POST/PUT/DELETE) salvam automaticamente  
✅ ID auto-incremento para novas entradas  
✅ Estrutura JSON consistente  

### Gerenciamento de IDs
- Os IDs são gerados automaticamente
- Incrementados a partir do máximo existente na coleção
- Mantêm-se imutáveis nas atualizações (PUT)

### Headers de Resposta
Todas as respostas incluem:
```
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📊 Estrutura de Dados

### Utilizador
```json
{
  "id": 1,
  "nome": "string",
  "email": "string (único)",
  "telefone": "string",
  "senha": "string (nunca retornada)"
}
```

### Tag
```json
{
  "id": 1,
  "name": "string"
}
```

### Publicação
```json
{
  "id": 1,
  "authorId": "number",
  "title": "string",
  "description": "string",
  "content": "string",
  "tags": ["array de strings"],
  "createdAt": "ISO 8601 datetime",
  "views": "number",
  "isAnswered": "boolean"
}
```

### Comentário
```json
{
  "id": 1,
  "postId": "number",
  "authorId": "number",
  "authorName": "string",
  "content": "string",
  "upvotes": "number",
  "downvotes": "number",
  "createdAt": "ISO 8601 datetime"
}
```

---

## ⚠️ Notas Importantes

* **Persistência:** Todas as alterações (POST/PUT/DELETE) modificam diretamente o ficheiro `data.json`
* **CORS:** Ativado por padrão para permitir o consumo via fetch de qualquer origem
* **ID Auto-incremento:** O sistema gera IDs automaticamente para novas entradas
* **Token Expiração:** Tokens expiram após 2 horas - é necessário fazer login novamente
* **Validação:** O servidor não valida tipos de dados - certifique-se de enviar dados corretos
* **Chave JWT:** A chave secreta está definida no `server.js` (use variáveis de ambiente em produção)

---

## 🧪 Exemplos de Uso (cURL)

### Registar Utilizador
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "11999999999",
    "senha": "senha123"
  }'
```

### Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "senha123"
  }'
```

### Listar Publicações
```bash
curl -X GET http://localhost:3000/api/posts
```

### Criar Publicação (com Token)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token_aqui}" \
  -d '{
    "authorId": 1,
    "title": "Meu título",
    "description": "Minha descrição",
    "content": "Conteúdo da publicação",
    "tags": ["javascript", "nodejs"],
    "createdAt": "2026-04-28T12:00:00Z",
    "views": 0,
    "isAnswered": false
  }'
```

---

## 📝 Licença
Desenvolvido para WorldSkills - Módulo D (ConectaDEV)

