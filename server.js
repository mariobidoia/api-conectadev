const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // Módulo nativo para gerar o JWT

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const SWAGGER_FILE = path.join(__dirname, 'swagger.json');

// Chave secreta para assinar o JWT (em produção, usar variáveis de ambiente)
const JWT_SECRET = 'conectadev_secret_key_worldskills_2026';

// --- Funções Nativas para Manipulação de JWT ---

// Codifica uma string para Base64Url (padrão JWT)
function base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

// Gera um novo Token JWT
function generateJWT(payload) {
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    const signature = crypto.createHmac('sha256', JWT_SECRET)
        .update(`${header}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        
    return `${header}.${encodedPayload}.${signature}`;
}

// Verifica e decodifica o Token JWT
function verifyJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const [header, payload, signature] = parts;
        const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
            .update(`${header}.${payload}`)
            .digest('base64')
            .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
            
        if (signature === expectedSignature) {
            const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
            // Verifica a expiração do token
            if (decodedPayload.exp && decodedPayload.exp < Date.now()) return null; 
            return decodedPayload;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// --- Fim das Funções JWT ---

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    const sendJson = (statusCode, data) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
    };

    const getBody = (request) => {
        return new Promise((resolve, reject) => {
            let body = '';
            request.on('data', chunk => body += chunk.toString());
            request.on('end', () => {
                try { resolve(body ? JSON.parse(body) : {}); } 
                catch (e) { reject(e); }
            });
        });
    };

    // Rota Swagger HTML
    if (req.url === '/docs' && req.method === 'GET') {
        const swaggerHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Swagger UI</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" >
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
            <script>
                window.onload = function() {
                    window.ui = SwaggerUIBundle({ url: "/swagger.json", dom_id: '#swagger-ui' });
                };
            </script>
        </body>
        </html>`;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(swaggerHtml);
    }

    // Rota JSON do Swagger
    if (req.url === '/swagger.json' && req.method === 'GET') {
        try {
            return sendJson(200, JSON.parse(fs.readFileSync(SWAGGER_FILE, 'utf8')));
        } catch (error) {
            return sendJson(500, { error: 'Arquivo swagger.json não encontrado' });
        }
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

    // Ler a Base de Dados
    let db;
    try {
        db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (error) {
        return sendJson(500, { error: 'Erro ao ler o arquivo de dados' });
    }

    // -----------------------------------------------------
    // ROTAS DE AUTENTICAÇÃO (/api/auth/register e /login)
    // -----------------------------------------------------
    if (pathParts[0] === 'api' && pathParts[1] === 'auth') {
        const action = pathParts[2]; // login ou register

        // REGISTER
        if (req.method === 'POST' && action === 'register') {
            return getBody(req).then(data => {
                if (!data.email || !data.senha) {
                    return sendJson(400, { error: 'E-mail e senha são obrigatórios' });
                }
                if (db.users.find(u => u.email === data.email)) {
                    return sendJson(400, { error: 'Este e-mail já está em uso' });
                }
                
                data.id = db.users.length > 0 ? Math.max(...db.users.map(i => i.id)) + 1 : 1;
                db.users.push(data);
                fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
                
                // Remove a senha antes de retornar por segurança
                const { senha, ...userCreated } = data;
                return sendJson(201, userCreated);
            }).catch(() => sendJson(400, { error: 'Dados inválidos' }));
        }

        // LOGIN
        if (req.method === 'POST' && action === 'login') {
            return getBody(req).then(data => {
                const user = db.users.find(u => u.email === data.email && u.senha === data.senha);
                
                if (!user) {
                    return sendJson(401, { error: 'Credenciais inválidas' });
                }
                
                // Gera o token com validade de 2 horas
                const token = generateJWT({ 
                    id: user.id, 
                    email: user.email, 
                    exp: Date.now() + (2 * 60 * 60 * 1000) 
                });
                
                const { senha, ...userResponse } = user;
                return sendJson(200, { token: token, user: userResponse });
            }).catch(() => sendJson(400, { error: 'Dados inválidos' }));
        }

        return sendJson(404, { error: 'Rota de autenticação não encontrada' });
    }

    // -----------------------------------------------------
    // ROTAS DE RECURSOS CRUD (/api/users, posts, tags, etc)
    // -----------------------------------------------------
    if (pathParts[0] === 'api' && pathParts[1] && pathParts[1] !== 'auth') {
        const resource = pathParts[1];
        const id = pathParts[2] ? parseInt(pathParts[2]) : null;

        if (!db[resource]) {
            return sendJson(404, { error: `Recurso '${resource}' não encontrado` });
        }

        // --- Middleware de Proteção ---
        // Protegendo as rotas de modificação (POST, PUT, DELETE) para exigirem o Token JWT
        if (req.method !== 'GET') {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return sendJson(401, { error: 'Acesso negado. Token não fornecido.' });
            }

            const token = authHeader.split(' ')[1];
            const decodedUser = verifyJWT(token);

            if (!decodedUser) {
                return sendJson(403, { error: 'Acesso negado. Token inválido ou expirado.' });
            }
            
            // Aqui você poderia utilizar o decodedUser.id para forçar o autor do post, por exemplo.
            req.user = decodedUser; 
        }

        const collection = db[resource];

        // GET ALL ou GET BY ID
        if (req.method === 'GET') {
            if (id) {
                const item = collection.find(i => i.id === id);
                return item ? sendJson(200, item) : sendJson(404, { error: 'Item não encontrado' });
            }
            // Para segurança, se listarem usuários não retornamos as senhas.
            if (resource === 'users') {
                return sendJson(200, collection.map(u => {
                    const { senha, ...uSafe } = u; return uSafe;
                }));
            }
            return sendJson(200, collection);
        }

        // POST (Create)
        if (req.method === 'POST') {
            return getBody(req).then(data => {
                data.id = collection.length > 0 ? Math.max(...collection.map(i => i.id)) + 1 : 1;
                collection.push(data);
                fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
                return sendJson(201, data);
            }).catch(() => sendJson(400, { error: 'Dados inválidos' }));
        }

        // PUT (Update)
        if (req.method === 'PUT') {
            if (!id) return sendJson(400, { error: 'ID é obrigatório para atualização' });
            
            const index = collection.findIndex(i => i.id === id);
            if (index === -1) return sendJson(404, { error: 'Item não encontrado' });

            return getBody(req).then(data => {
                collection[index] = { ...data, id: id }; // Garante que o ID não mude
                fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
                return sendJson(200, collection[index]);
            }).catch(() => sendJson(400, { error: 'Dados inválidos' }));
        }

        // DELETE
        if (req.method === 'DELETE') {
            if (!id) return sendJson(400, { error: 'ID é obrigatório para exclusão' });
            
            const index = collection.findIndex(i => i.id === id);
            if (index === -1) return sendJson(404, { error: 'Item não encontrado' });

            collection.splice(index, 1);
            fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
            return sendJson(200, { message: 'Item deletado com sucesso' });
        }
    }

    sendJson(404, { error: 'Rota inexistente. Acesse /docs para ver a documentação.' });
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📖 Swagger Documentação: http://localhost:${PORT}/docs`);
});