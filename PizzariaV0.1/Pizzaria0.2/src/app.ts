// ============================
// Aplicativo Pizzaria (Node.js + PostgreSQL)
// ============================

const { Pool } = require('pg');
const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');

// ============================
// Configuração do Banco
// ============================
const dbConfig = {
    user: 'aluno',
    host: 'localhost',
    database: 'db_profedu',
    password: '102030',
    port: 5432,
};

const pool = new Pool(dbConfig);

// ============================
// Inicialização de Tabelas
// ============================
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
        // garante que a coluna 'endereco' existe em tabelas já criadas anteriormente
        await pool.query("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS endereco TEXT;");
    } catch (err: any) {
        console.log("❌ Erro ao inicializar tabelas.", err);
    }
}

// ============================
// CLIENTES
// ============================
async function cadastrarCliente() {
    console.log("\n=== Cadastro de Cliente ===");
    const nome = readlineSync.question('Nome: ');
    const telefone = readlineSync.question('Telefone: ');
    const cpf = readlineSync.question('CPF: ');
    const endereco = readlineSync.question('Endereço: ');

    try {
        await pool.query(
            "INSERT INTO clientes (nome, telefone, cpf, endereco) VALUES ($1, $2, $3, $4)",
            [nome, telefone, cpf, endereco]
        );
        console.log("✅ Cliente cadastrado com sucesso!");
    } catch (err: any) {
        if (err && err.code === '23505') console.log("❌ CPF já cadastrado!");
        else console.log("❌ Erro ao cadastrar cliente.", err);
    }
}

async function listarClientes() {
    console.log("\n=== Lista de Clientes ===");
    try {
        const res = await pool.query("SELECT * FROM clientes ORDER BY id");
        if (res.rows.length === 0) return console.log("Nenhum cliente cadastrado.");
        for (const c of res.rows) {
            console.log(`ID: ${c.id} | ${c.nome} | Tel: ${c.telefone} | CPF: ${c.cpf} | Endereço: ${c.endereco}`);
        }
    } catch {
        console.log("❌ Erro ao listar clientes.");
    }
}

async function atualizarCliente() {
    console.log("\n=== Atualizar Cliente ===");
    await listarClientes();
    const id = readlineSync.questionInt('ID do cliente a atualizar: ');

    try {
        const res = await pool.query("SELECT * FROM clientes WHERE id = $1", [id]);
        if (res.rows.length === 0) return console.log("❌ Cliente não encontrado!");

        const cliente = res.rows[0];
        console.log(`\nCliente atual: ${cliente.nome} | Tel: ${cliente.telefone} | CPF: ${cliente.cpf} | Endereço: ${cliente.endereco}`);
        console.log("Deixe em branco para manter o valor atual.");

        const nome = readlineSync.question(`Novo nome [${cliente.nome}]: `) || cliente.nome;
        const telefone = readlineSync.question(`Novo telefone [${cliente.telefone}]: `) || cliente.telefone;
        const cpf = readlineSync.question(`Novo CPF [${cliente.cpf}]: `) || cliente.cpf;
        const endereco = readlineSync.question(`Novo endereço [${cliente.endereco}]: `) || cliente.endereco;

        await pool.query(
            "UPDATE clientes SET nome = $1, telefone = $2, cpf = $3, endereco = $4 WHERE id = $5",
            [nome, telefone, cpf, endereco, id]
        );
        console.log("✅ Cliente atualizado com sucesso!");
    } catch (err: any) {
        console.log("❌ Erro ao atualizar cliente.", err);
    }
}

async function excluirCliente() {
    console.log("\n=== Excluir Cliente ===");
    await listarClientes();
    const id = readlineSync.questionInt('ID do cliente a excluir: ');

    try {
        const res = await pool.query("SELECT * FROM clientes WHERE id = $1", [id]);
        if (res.rows.length === 0) return console.log("❌ Cliente não encontrado!");

        const cliente = res.rows[0];
        const confirmacao = readlineSync.question(`Tem certeza que deseja excluir ${cliente.nome}? (s/n): `);
        
        if (confirmacao.toLowerCase() === 's') {
            await pool.query("DELETE FROM clientes WHERE id = $1", [id]);
            console.log("✅ Cliente excluído com sucesso!");
        } else {
            console.log("❌ Operação cancelada.");
        }
    } catch (err: any) {
        console.log("❌ Erro ao excluir cliente.", err);
    }
}

// ============================
// PRODUTOS
// ============================
async function cadastrarProduto() {
    console.log("\n=== Cadastro de Produto ===");
    const nome = readlineSync.question('Nome do produto: ');
    const preco = readlineSync.questionFloat('Preço (R$): ');

    try {
        await pool.query("INSERT INTO produtos (nome, preco) VALUES ($1, $2)", [nome, preco]);
        console.log("✅ Produto cadastrado com sucesso!");
    } catch {
        console.log("❌ Erro ao cadastrar produto.");
    }
}

async function listarProdutos() {
    console.log("\n=== Lista de Produtos ===");
    try {
        const res = await pool.query("SELECT * FROM produtos ORDER BY id");
        if (res.rows.length === 0) return console.log("Nenhum produto cadastrado.");
        for (const p of res.rows) {
            console.log(`ID: ${p.id} | ${p.nome} | R$ ${Number(p.preco).toFixed(2)}`);
        }
    } catch {
        console.log("❌ Erro ao listar produtos.");
    }
}

async function excluirProduto() {
    console.log("\n=== Excluir Produto ===");
    await listarProdutos();
    const id = readlineSync.questionInt('ID do produto a excluir: ');

    try {
        const res = await pool.query("SELECT * FROM produtos WHERE id = $1", [id]);
        if (res.rows.length === 0) return console.log("❌ Produto não encontrado!");

        const produto = res.rows[0];
        const confirmacao = readlineSync.question(`Tem certeza que deseja excluir ${produto.nome}? (s/n): `);
        
        if (confirmacao.toLowerCase() === 's') {
            await pool.query("DELETE FROM produtos WHERE id = $1", [id]);
            console.log("✅ Produto excluído com sucesso!");
        } else {
            console.log("❌ Operação cancelada.");
        }
    } catch (err: any) {
        console.log("❌ Erro ao excluir produto.", err);
    }
}

// ============================
// PEDIDOS
// ============================
async function registrarPedido() {
    console.log("\n=== Novo Pedido ===");
    await listarClientes();
    const idCliente = readlineSync.questionInt("Informe o ID do cliente: ");

    const cliRes = await pool.query("SELECT * FROM clientes WHERE id = $1", [idCliente]);
    if (cliRes.rows.length === 0) return console.log("❌ Cliente não encontrado!");

    let itens = [];
    let total = 0;
    let qtdTotal = 0;

    while (true) {
        await listarProdutos();
        const idProd = readlineSync.questionInt("ID do produto (0 para finalizar): ");
        if (idProd === 0) break;

        const res = await pool.query("SELECT * FROM produtos WHERE id=$1", [idProd]);
        if (res.rows.length === 0) {
            console.log("❌ Produto não encontrado.");
            continue;
        }

        const qtd = readlineSync.questionInt("Quantidade: ");
        const prod = res.rows[0];
        itens.push(`${prod.nome}(x${qtd})`);
        total += Number(prod.preco) * qtd;
        qtdTotal += qtd;
    }

    if (itens.length === 0) return console.log("❌ Nenhum item adicionado. Pedido cancelado.");

    // Promoção automática
    let desconto = 0;
    if (total > 100) {
        desconto = total * 0.1;
        console.log("🎁 Promoção aplicada: 10% de desconto!");
    }

    const totalFinal = total - desconto;

    try {
        const pedidoRes = await pool.query(
            "INSERT INTO pedidos (id_cliente, itens, total, desconto) VALUES ($1, $2, $3, $4) RETURNING id",
            [idCliente, itens.join("; "), totalFinal, desconto]
        );
        const pedidoId = pedidoRes.rows[0].id;

        console.log(`✅ Pedido registrado com sucesso! Total: R$ ${totalFinal.toFixed(2)}`);
        await emitirComprovante(pedidoId);
    } catch (err: any) {
        console.log("❌ Erro ao registrar pedido.", err);
    }
}

async function listarPedidos() {
    console.log("\n=== Pedidos ===");
    try {
        const res = await pool.query(`
            SELECT p.id, c.nome AS cliente, p.itens, p.total, p.status, p.data
            FROM pedidos p
            JOIN clientes c ON p.id_cliente = c.id
            ORDER BY p.id;
        `);
        if (res.rows.length === 0) return console.log("Nenhum pedido registrado.");
        for (const p of res.rows) {
            console.log(
                `ID: ${p.id} | Cliente: ${p.cliente} | Itens: ${p.itens} | Total: R$ ${Number(p.total).toFixed(2)} | Status: ${p.status}`
            );
        }
        } catch {
            console.log("❌ Erro ao listar pedidos.");
        }
    }
    
    

        // ============================
        // COMPROVANTE
        // ============================
        interface PedidoRow {
            id: number;
            cliente: string;
            telefone: string;
            itens: string;
            total: number;
            desconto: number | null;
            data: Date;
        }

        interface Comprovante {
            id?: number;
            id_pedido: number;
            conteudo: string;
            data_geracao?: Date;
        }

        async function emitirComprovante(Pedido: number): Promise<void> {
            const res = (await pool.query(
                `
                SELECT p.id, c.nome AS cliente, c.telefone, p.itens, p.total, p.desconto, p.data
                FROM pedidos p
                JOIN clientes c ON p.id_cliente = c.id
                WHERE p.id = $1
            `,
                [Pedido]
            )) as { rows: PedidoRow[] };

            if (res.rows.length === 0) return console.log("Pedido não encontrado.");

            const p = res.rows[0];
            const texto = `
        ==============================
               PIZZARIA TECH
        ==============================
        Comprovante de Compra
        ------------------------------
        Cliente: ${p.cliente}
        Telefone: ${p.telefone}
        Data: ${new Date(p.data).toLocaleString()}
        ------------------------------
        Itens:
        ${p.itens}
        ------------------------------
        Desconto: R$ ${Number(p.desconto || 0).toFixed(2)}
        Total Pago: R$ ${Number(p.total).toFixed(2)}
        ==============================
           Obrigado pela preferência!
        ==============================
        `;

            console.log(texto);

            // garante que temos o id do pedido tipado
            const idPedido: number = Pedido;

            try {
                await pool.query(
                    "INSERT INTO comprovantes (id_pedido, conteudo) VALUES ($1, $2)",
                    [idPedido, texto]
                );
                console.log("💾 Comprovante gravado no banco de dados com sucesso!");
            } catch (err: any) {
                console.log("❌ Erro ao salvar comprovante no banco de dados:", err);
            }
        }

// ============================
// RELATÓRIOS
// ============================
async function relatoriosVendas() {
    console.log("\n=== Relatórios de Vendas ===");

    const hoje = await pool.query(`
        SELECT COUNT(*) AS pedidos, SUM(total) AS total
        FROM pedidos
        WHERE DATE(data) = CURRENT_DATE;
    `);

    const mes = await pool.query(`
        SELECT COUNT(*) AS pedidos, SUM(total) AS total
        FROM pedidos
        WHERE DATE_PART('month', data) = DATE_PART('month', CURRENT_DATE)
          AND DATE_PART('year', data) = DATE_PART('year', CURRENT_DATE);
    `);

    console.log(`
Vendas do Dia:
Pedidos: ${hoje.rows[0].pedidos}
Total Vendido: R$ ${Number(hoje.rows[0].total || 0).toFixed(2)}

Vendas do Mês:
Pedidos: ${mes.rows[0].pedidos}
Total Vendido: R$ ${Number(mes.rows[0].total || 0).toFixed(2)}
`);
}

// ============================
// HISTÓRICO DE COMPRAS
// ============================
async function historicoCliente() {
    console.log("\n=== Histórico de Compras do Cliente ===");
    await listarClientes();
    const idCliente = readlineSync.questionInt("ID do cliente: ");
    const res = await pool.query(`
        SELECT id, itens, total, data
        FROM pedidos
        WHERE id_cliente = $1
        ORDER BY data DESC;
    `, [idCliente]);

    if (res.rows.length === 0) return console.log("Nenhum pedido encontrado para este cliente.");
    for (const p of res.rows) {
        console.log(`Pedido #${p.id} | ${p.data.toLocaleString()} | Total: R$ ${Number(p.total).toFixed(2)} | Itens: ${p.itens}`);
    }
}



// ============================
// MENU PRINCIPAL
// ============================
async function main() {
    await inicializarTabelas();
    console.log("=== SISTEMA PIZZARIA ===");

    let opcao;
    do {
        console.log(`
1. Clientes
2. Produtos
3. Pedidos
4. Relatórios
5. Histórico de Compras
0. Sair
        `);

        opcao = readlineSync.question('Escolha uma opção: ');

        switch (opcao) {
            case '1':
                console.log("\n1. Cadastrar Cliente\n2. Listar Clientes\n3. Atualizar Cliente\n4. Excluir Cliente\n0. Voltar");
                const opCli = readlineSync.question('> ');
                if (opCli === '1') await cadastrarCliente();
                else if (opCli === '2') await listarClientes();
                else if (opCli === '3') await atualizarCliente();
                else if (opCli === '4') await excluirCliente();
                break;

            case '2':
                console.log("\n1. Cadastrar Produto\n2. Listar Produtos\n3. Excluir Produto\n0. Voltar");
                const opProd = readlineSync.question('> ');
                if (opProd === '1') await cadastrarProduto();
                else if (opProd === '2') await listarProdutos();
                else if (opProd === '3') await excluirProduto();
                break;

            case '3':
                console.log("\n1. Novo Pedido\n2. Listar Pedidos\n0. Voltar");
                const opPed = readlineSync.question('> ');
                if (opPed === '1') await registrarPedido();
                else if (opPed === '2') await listarPedidos();
                break;

            case '4':
                await relatoriosVendas();
                break;

            case '5':
                await historicoCliente();
                break;

            case '0':
                console.log("Saindo...");
                break;

            default:
                console.log("Opção inválida!");
        }

    } while (opcao !== '0');

    await pool.end();
    console.log("Conexão com o banco encerrada.");
}

main().catch(() => {
    console.log("Erro fatal durante a execução.");
    pool.end();
});
