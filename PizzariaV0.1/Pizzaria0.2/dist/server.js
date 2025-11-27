"use strict";
// ============================
// Servidor Backend - Pizzaria
// ============================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const path = __importStar(require("path"));
const app = (0, express_1.default)();
const PORT = 3000;
// Configuração do Banco
const dbConfig = {
    user: 'aluno',
    host: 'localhost',
    database: 'db_profedu',
    password: '102030',
    port: 5432,
};
const pool = new pg_1.Pool(dbConfig);
// Middleware
app.use(express_1.default.json());
// Servir arquivos estáticos da pasta raiz do projeto
app.use(express_1.default.static(path.join(__dirname, '../../')));
// Rota raiz - servir o HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../site.html'));
});
// Inicializar Tabelas
async function inicializarTabelas() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                telefone TEXT,
                cpf VARCHAR(14) UNIQUE NOT NULL,
                endereco TEXT
            );

            CREATE TABLE IF NOT EXISTS produtos (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                preco NUMERIC(10,2) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS pedidos (
                id SERIAL PRIMARY KEY,
                id_cliente INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                itens TEXT NOT NULL,
                total NUMERIC(10,2),
                desconto NUMERIC(10,2),
                status TEXT DEFAULT 'ABERTO',
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS comprovantes (
                id SERIAL PRIMARY KEY,
                id_pedido INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
                conteudo TEXT NOT NULL,
                data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS endereco TEXT;");
        console.log("✅ Tabelas inicializadas com sucesso!");
    }
    catch (err) {
        console.log("❌ Erro ao inicializar tabelas.", err);
    }
}
// ============================
// ROTAS - CLIENTES
// ============================
// GET - Listar todos os clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY id');
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET - Obter cliente por ID
app.get('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST - Cadastrar cliente
app.post('/api/clientes', async (req, res) => {
    try {
        const { nome, telefone, cpf, endereco } = req.body;
        const result = await pool.query('INSERT INTO clientes (nome, telefone, cpf, endereco) VALUES ($1, $2, $3, $4) RETURNING *', [nome, telefone, cpf, endereco]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'CPF já cadastrado' });
        }
        else {
            res.status(500).json({ error: err.message });
        }
    }
});
// PUT - Atualizar cliente
app.put('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, telefone, cpf, endereco } = req.body;
        const result = await pool.query('UPDATE clientes SET nome = $1, telefone = $2, cpf = $3, endereco = $4 WHERE id = $5 RETURNING *', [nome, telefone, cpf, endereco, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// DELETE - Excluir cliente
app.delete('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json({ message: 'Cliente excluído com sucesso' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ============================
// ROTAS - PRODUTOS
// ============================
// GET - Listar todos os produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM produtos ORDER BY id');
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET - Obter produto por ID
app.get('/api/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST - Cadastrar produto
app.post('/api/produtos', async (req, res) => {
    try {
        const { nome, preco } = req.body;
        const result = await pool.query('INSERT INTO produtos (nome, preco) VALUES ($1, $2) RETURNING *', [nome, preco]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// DELETE - Excluir produto
app.delete('/api/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json({ message: 'Produto excluído com sucesso' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ============================
// ROTAS - PEDIDOS
// ============================
// GET - Listar todos os pedidos
app.get('/api/pedidos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id, c.nome AS nome_cliente, c.cpf, c.endereco, p.itens, p.total, p.desconto, p.status, p.data
            FROM pedidos p
            JOIN clientes c ON p.id_cliente = c.id
            ORDER BY p.id
        `);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST - Registrar pedido
app.post('/api/pedidos', async (req, res) => {
    try {
        const { id_cliente, itens } = req.body;
        // Calcular total dos itens
        let total = 0;
        const itensArray = itens.split(';').map((item) => {
            const [produtoId, quantidade] = item.trim().split(':');
            return { produtoId: parseInt(produtoId), quantidade: parseInt(quantidade) };
        });
        for (const item of itensArray) {
            const result = await pool.query('SELECT preco FROM produtos WHERE id = $1', [item.produtoId]);
            if (result.rows.length > 0) {
                total += result.rows[0].preco * item.quantidade;
            }
        }
        // Aplicar promoção
        let desconto = 0;
        if (total > 100) {
            desconto = total * 0.1;
        }
        const totalFinal = total - desconto;
        const result = await pool.query('INSERT INTO pedidos (id_cliente, itens, total, desconto) VALUES ($1, $2, $3, $4) RETURNING *', [id_cliente, itens, totalFinal, desconto]);
        // Gerar comprovante
        const pedidoId = result.rows[0].id;
        const clienteRes = await pool.query('SELECT * FROM clientes WHERE id = $1', [id_cliente]);
        const cliente = clienteRes.rows[0];
        const texto = `
==============================
       PIZZARIA TECH
==============================
Comprovante de Compra
------------------------------
Cliente: ${cliente.nome}
Telefone: ${cliente.telefone}
Data: ${new Date().toLocaleString('pt-BR')}
------------------------------
Itens:
${itens}
------------------------------
Desconto: R$ ${desconto.toFixed(2)}
Total Pago: R$ ${totalFinal.toFixed(2)}
==============================
   Obrigado pela preferência!
==============================
`;
        await pool.query('INSERT INTO comprovantes (id_pedido, conteudo) VALUES ($1, $2)', [pedidoId, texto]);
        res.status(201).json({ pedido: result.rows[0], comprovante: texto });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET - Histórico de compras do cliente
app.get('/api/clientes/:id/historico', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, itens, total, desconto, data FROM pedidos WHERE id_cliente = $1 ORDER BY data DESC', [id]);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET - Histórico de compras do cliente (alias para compatibilidade)
app.get('/api/clientes/:id/pedidos', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, itens, total, desconto, data FROM pedidos WHERE id_cliente = $1 ORDER BY data DESC', [id]);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ============================
// ROTAS - RELATÓRIOS
// ============================
// GET - Relatórios de vendas
app.get('/api/relatorios/vendas', async (req, res) => {
    try {
        const hoje = await pool.query(`
            SELECT COUNT(*) AS pedidos, SUM(total) AS total
            FROM pedidos
            WHERE DATE(data) = CURRENT_DATE
        `);
        const mes = await pool.query(`
            SELECT COUNT(*) AS pedidos, SUM(total) AS total
            FROM pedidos
            WHERE DATE_PART('month', data) = DATE_PART('month', CURRENT_DATE)
            AND DATE_PART('year', data) = DATE_PART('year', CURRENT_DATE)
        `);
        res.json({
            hoje: hoje.rows[0],
            mes: mes.rows[0]
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Inicializar e iniciar servidor
async function start() {
    await inicializarTabelas();
    app.listen(PORT, () => {
        console.log(`🍕 Servidor Pizzaria rodando em http://localhost:${PORT}`);
    });
}
start().catch(err => {
    console.error("❌ Erro ao iniciar servidor:", err);
    process.exit(1);
});
