# 🍕 Pizzaria GaloDoido - Sistema de Gerenciamento

Aplicação web completa para gerenciar pedidos, clientes e produtos de uma pizzaria. Sistema desenvolvido com **Node.js**, **TypeScript**, **Express** e **PostgreSQL**.

---

## 📋 Índice

- [Funcionalidades](#funcionalidades)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
```markdown
# 🍕 Pizzaria Galo Doido — Sistema de Gerenciamento

Aplicação web para gerenciar pedidos, clientes e produtos de uma pizzaria.
Desenvolvido com Node.js, TypeScript, Express e PostgreSQL.

---

## ✅ Objetivo desta atualização
Melhorei as instruções de instalação e execução para deixar claro **onde** executar cada comando (pasta/terminal) e quais passos são obrigatórios versus opcionais.

---

## 🚩 Pré-requisitos (o que precisa estar instalado)
- Node.js (v16+)
- npm
- PostgreSQL (localmente ou Docker)
- (Opcional) Docker se preferir rodar o banco em container

---

## 📁 Onde executar os comandos
Sempre execute os comandos abaixo a partir da pasta do projeto `Pizzaria0.2`. No PowerShell (Windows) faça:

```powershell
cd "c:\Users\<seu-usuario>\OneDrive\Documents\GitHub\PizzariaGaloDoido1\PizzariaV0.1\Pizzaria0.2"
```

Substitua `<seu-usuario>` pelo seu usuário do Windows se necessário. A partir dessa pasta os comandos `npm`, `npx` e `node` irão agir sobre este projeto.

---

## Passo a passo (rápido)

1) Entrar na pasta do projeto (obrigatório)

```powershell
cd "c:\Users\allan\OneDrive\Documents\GitHub\PizzariaGaloDoido1\PizzariaV0.1\Pizzaria0.2"
```

2) Instalar dependências (só precisa fazer uma vez, ou quando atualizar pacotes)

```powershell
npm install
```

3) Preparar o banco de dados (escolha uma opção)

- Usando Docker (recomendado):

```powershell
docker run -d --name meu-postgres -e POSTGRES_USER=aluno -e POSTGRES_PASSWORD=102030 -e POSTGRES_DB=db_profedu -p 5432:5432 postgres:latest
```

- Usando PostgreSQL local:

Crie o banco e o usuário (via psql ou cliente):

```sql
CREATE DATABASE db_profedu;
CREATE USER aluno WITH PASSWORD '102030';
GRANT ALL PRIVILEGES ON DATABASE db_profedu TO aluno;
```

Obs.: O servidor já cria as tabelas automaticamente na primeira execução.

4) Iniciar o servidor (desenvolvimento)

```powershell
npx ts-node src\server.ts
```

Alternativa (se você preferir usar os scripts do npm):

```powershell
npm run dev
```

5) (Opcional) Abrir no navegador

```powershell
start "http://localhost:3000"
```

6) Parar o servidor

- No terminal onde o servidor está rodando: pressione `Ctrl+C`.
- Forçar parada de todos os processos Node (se necessário):

```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

---

## Modo produção (compilar e executar)

1) Compilar TypeScript para JavaScript:

```powershell
npm run build
```

2) Executar o build:

```powershell
npm start
# ou diretamente
node dist/server.js
```

---

## Arquivo de configuração relevante

Edite `src/server.ts` se precisar alterar a configuração do banco ou a porta:

```typescript
const dbConfig = {
  user: 'aluno',
  host: 'localhost',
  database: 'db_profedu',
  password: '102030',
  port: 5432,
};

const PORT = 3000;
```

Se o banco estiver em outro host/porta/usuário, atualize esses valores antes de iniciar.

---

## Dicas de troubleshooting (rápido)

- Erro `connect ECONNREFUSED`: o PostgreSQL não está disponível; verifique se o container/serviço está rodando.
- Erro `Cannot find module` ou `Error: Cannot find file`: execute `npm install` e verifique se você está na pasta `Pizzaria0.2`.
- Porta 3000 em uso: altere `PORT` em `src/server.ts` ou mate o processo existente.
- Comprovante ainda mostra nome antigo: reinicie o servidor após alterações no código fonte.

---

## Comandos resumidos (PowerShell)

```powershell
# Entrar na pasta do projeto
cd "c:\Users\allan\OneDrive\Documents\GitHub\PizzariaGaloDoido1\PizzariaV0.1\Pizzaria0.2"

# Instalar dependências (uma vez)
npm install

# Iniciar em desenvolvimento
npx ts-node src\server.ts
# ou
npm run dev

# Compilar e rodar em produção
npm run build
npm start

# Abrir no navegador
start "http://localhost:3000"

# Parar (forçar)
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

---

## Estrutura rápida do projeto

```
Pizzaria0.2/
├── src/
│   ├── app.ts
│   └── server.ts
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```

---

## Licença

ISC

---

Desenvolvido para a Pizzaria Galo Doido.
```
{
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  "cpf": "123.456.789-00",
  "endereco": "Rua A, 123"
}
```

#### PUT - Atualizar cliente
```
PUT /api/clientes/:id
Content-Type: application/json

{
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  "cpf": "123.456.789-00",
  "endereco": "Rua A, 123"
}
```

#### DELETE - Excluir cliente
```
DELETE /api/clientes/:id
```

---

### Produtos

#### GET - Listar todos
```
GET /api/produtos
```

#### GET - Obter por ID
```
GET /api/produtos/:id
```

#### POST - Criar produto
```
POST /api/produtos
Content-Type: application/json

{
  "nome": "Pizza Margherita",
  "preco": 45.90
}
```

#### DELETE - Excluir produto
```
DELETE /api/produtos/:id
```

---

### Pedidos

#### GET - Listar todos
```
GET /api/pedidos
```

#### POST - Criar pedido
```
POST /api/pedidos
Content-Type: application/json

{
  "id_cliente": 1,
  "itens": "1:2;2:1;3:3"
}
```
*Formato: `id_produto:quantidade` separados por `;`*

#### GET - Histórico do cliente
```
GET /api/clientes/:id/historico
GET /api/clientes/:id/pedidos
```

---

### Relatórios

#### GET - Vendas do dia e mês
```
GET /api/relatorios/vendas
```

Retorna:
```json
{
  "hoje": {
    "pedidos": 5,
    "total": 250.50
  },
  "mes": {
    "pedidos": 45,
    "total": 3500.00
  }
}
```

---

## 📊 Modelo de Dados

### Tabela: clientes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL PRIMARY KEY | ID único |
| nome | TEXT NOT NULL | Nome do cliente |
| telefone | TEXT | Telefone de contato |
| cpf | VARCHAR(14) UNIQUE NOT NULL | CPF (único) |
| endereco | TEXT | Endereço de entrega |

### Tabela: produtos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL PRIMARY KEY | ID único |
| nome | TEXT NOT NULL | Nome do produto |
| preco | NUMERIC(10,2) NOT NULL | Preço da pizza |

### Tabela: pedidos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL PRIMARY KEY | ID único |
| id_cliente | INTEGER (FK) | Referência ao cliente |
| itens | TEXT NOT NULL | Itens do pedido |
| total | NUMERIC(10,2) | Total sem desconto |
| desconto | NUMERIC(10,2) | Desconto aplicado |
| status | TEXT | Status do pedido (padrão: ABERTO) |
| data | TIMESTAMP | Data/hora do pedido |

### Tabela: comprovantes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL PRIMARY KEY | ID único |
| id_pedido | INTEGER (FK) | Referência ao pedido |
| conteudo | TEXT NOT NULL | Conteúdo do comprovante |
| data_geracao | TIMESTAMP | Data de geração |

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 16+ | Runtime JavaScript |
| TypeScript | ^5.2.2 | Linguagem tipada |
| Express | ^4.18.2 | Framework web |
| PostgreSQL | 12+ | Banco de dados |
| pg | ^8.16.3 | Driver PostgreSQL |
| readline-sync | ^1.4.10 | CLI interativa |

---

## ⚙️ Configurações

### Arquivo: `src/server.ts`

**Configuração do Banco de Dados:**
```typescript
const dbConfig = {
    user: 'aluno',
    host: 'localhost',
    database: 'db_profedu',
    password: '102030',
    port: 5432,
};
```

**Porta do Servidor:**
```typescript
const PORT = 3000;
```

Para alterar, edite esses valores antes de compilar.

---

## 📝 Scripts Disponíveis

```bash
npm run start     # Executar servidor compilado
npm run dev       # Executar em desenvolvimento (ts-node)
npm run build     # Compilar TypeScript
npm test          # Rodar testes (não configurado)
```

---

## 🐛 Troubleshooting

### Erro: "connect ECONNREFUSED"
- PostgreSQL não está rodando
- **Solução:** Inicie o container Docker ou PostgreSQL local

### Erro: "Cannot find module"
- Dependências não estão instaladas
- **Solução:** Execute `npm install`

### Erro: "Port 3000 is already in use"
- Outra aplicação está usando a porta 3000
- **Solução:** Altere a porta em `src/server.ts` ou mate o processo anterior

### Página em branco
- HTML não está sendo servido corretamente
- **Solução:** Certifique-se de que `site.html` está na pasta `PizzariaV0.1/`

---

## 📄 Licença

ISC

---

## 👨‍💻 Autor

Desenvolvido para a Pizzaria GaloDoido
