const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const SWAGGER_FILE = path.join(__dirname, 'swagger.json');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    if (req.url === '/swagger.json' && req.method === 'GET') {
        try {
            return sendJson(200, JSON.parse(fs.readFileSync(SWAGGER_FILE, 'utf8')));
        } catch (error) {
            return sendJson(500, { error: 'Arquivo swagger.json não encontrado' });
        }
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean); // Ex: ['api', 'posts', '1']

    if (pathParts[0] === 'api' && pathParts[1]) {
        const resource = pathParts[1];
        const id = pathParts[2] ? parseInt(pathParts[2]) : null;

        let db;
        try {
            db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (error) {
            return sendJson(500, { error: 'Erro ao ler o arquivo de dados' });
        }

        if (!db[resource]) {
            return sendJson(404, { error: `Recurso '${resource}' não encontrado` });
        }

        const collection = db[resource];

        // GET ALL ou GET BY ID
        if (req.method === 'GET') {
            if (id) {
                const item = collection.find(i => i.id === id);
                return item ? sendJson(200, item) : sendJson(404, { error: 'Item não encontrado' });
            }
            return sendJson(200, collection);
        }

        // POST (Create)
        if (req.method === 'POST') {
            getBody(req).then(data => {
                data.id = collection.length > 0 ? Math.max(...collection.map(i => i.id)) + 1 : 1;
                collection.push(data);
                fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
                return sendJson(201, data);
            }).catch(() => sendJson(400, { error: 'Dados inválidos' }));
            return;
        }

        // PUT (Update)
        if (req.method === 'PUT') {
            if (!id) return sendJson(400, { error: 'ID é obrigatório para atualização' });
            
            const index = collection.findIndex(i => i.id === id);
            if (index === -1) return sendJson(404, { error: 'Item não encontrado' });

            getBody(req).then(data => {
                collection[index] = { ...data, id: id }; // Garante que o ID não mude
                fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
                return sendJson(200, collection[index]);
            }).catch(() => sendJson(400, { error: 'Dados inválidos' }));
            return;
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
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Swagger em http://localhost:${PORT}/docs`);
});