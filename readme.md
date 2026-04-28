# ConectaDEV API Mock

API desenvolvida em **Node.js nativo** (sem frameworks) para o projeto ConectaDEV (WorldSkills - Módulo D). Utiliza um sistema de persistência simples baseado em ficheiro JSON.

## 🛠️ Requisitos
* **Node.js** (v14 ou superior).
* Não é necessário instalar dependências externas.

## 🚀 Como Iniciar
1. Certifique-se de que `server.js`, `data.json` e `swagger.json` estão no mesmo diretório.
2. No terminal, execute:
   ```bash
   node server.js
   ```
3. O servidor estará ativo em: ```bash
http://localhost:3000 ```

## 📖 Documentação e Testes
Para facilitar o desenvolvimento do Front-End e validar os endpoints, aceda à interface interativa:
```bash
 http://localhost:3000/docs
 ```

## 🖇️ Estrutura de Rotas (API)

A URL base para todos os recursos é ```http://localhost:3000/api/```

| Recurso | Descrição | Métodos |
| -------- | -------- | -------- |
| users  | Gestão de utilizadores  | GET, POST, DELETE, PUT   |
| posts  | Listagem e criação de publicações   | GET, POST, DELETE, PUT   |
| tags  | Categorias pré-definidas   | GET, POST, DELETE, PUT   |
| comments  | Comentários e avaliações   | GET, POST, DELETE, PUT   |

## ⚠️ Notas Importantes
* **Persistência:** Todas as alterações (POST/PUT/DELETE) modificam diretamente o ficheiro data.json.

* **CORS:** Ativado por padrão para permitir o consumo via fetch em qualquer origem.

* **ID Auto-incremento:** O sistema gera IDs automaticamente para novas entradas.

