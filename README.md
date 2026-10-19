![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-ETL-150458?style=flat-square&logo=pandas&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-Webhooks-FF6584?style=flat-square&logo=n8n&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-ORM-003B57?style=flat-square&logo=sqlite&logoColor=white)

# Desafio Técnico Mini Inbox - Stalse

Feito por Daniel Landuche

## Stack
- **Backend:** Python (FastAPI, SQLAlchemy, SQLite, Pydantic, HTTPX)
- **Frontend:** TypeScript (Next.js, Tailwind CSS, Lucide Icons)
- **Dados:** Python (Pandas)
- **Automação:** n8n (Webhook Node + HTTP Request)

## Estrutura do Repositório

```text
/backend
  ├─ seeds/
  │   ├─ generator.py         # Gera os dados mockados para a pagina de tickets
  │   └─ tickets_seed.json    # Gerado pelo generator.py para alimentar a pagina de tickets
  ├─ db.sqlite                # Gerado ao executar o backend
  ├─ models.py
  ├─ schemas.py
  ├─ main.py
  └─ database.py
/data
  ├─ processed/
  │   └─ metrics.json        # Gerado pelo ETL consumindo o `raw/dataset.csv` para alimentar o dashboard
  ├─ raw/
  │   └─ dataset.csv         # Dataset CSV/JSON/PARQUET
  └─ etl.py
/frontend
  ├─ app/
  │   ├─ layout.tsx
  │   ├─ globals.css
  │   ├─ page.tsx
  │   ├─ dashboard/
  │   │   └─ page.tsx
  │   └─ tickets/
  │       ├─ page.tsx
  │       └─ [id]/
  │           └─ page.tsx
  ├─ components/
  │   └─ ui/
  │       ├─ Pagination.tsx
  │       ├─ TicketModal.tsx
  │       └─ Toast.tsx
  ├─ tsconfig.json 
  ├─ package-lock.json 
  ├─ globals.d.ts 
  ├─ next-env.d.ts 
  ├─ package.json 
  ├─ tailwind.config.js 
  └─ postcss.config.js 
/n8n
  ├─ workflow.json
  ├─ screenshot1.png
  └─ screenshot2.png
requirements.txt
README.md
```

## Como Executar

### 1. Rodar o Backend 
Instale as dependências, va para a pasta `/backend` e inicie o servidor com Uvicorn:

```bash
pip install -r requirements.txt
cd backend
uvicorn main:app 
```

- API disponível em: `http://localhost:8000`
- Documentação Swagger disponivel em `http://localhost:8000/docs`
- Ao iniciar, o banco de dados `db.sqlite` será criado e populado partir do arquivo `/backend/seeds/tickets_seed.json`.

### 2. Rodar o Frontend 
Acesse a pasta `/frontend`, instale as dependências e rode o ambiente de desenvolvimento:

```bash
cd frontend
npm install
npm run dev
```

- Acesse a interface web em: `http://localhost:3000`
- NAVEGAÇÃO:
  - `/tickets` — Tabela com os dados do banco local.
  - `/dashboard` — Painel com os cards e agregações calculadas pelo pipeline do Pandas.

### 3. Testar o Workflow no n8n

1. Instale o n8n com `npm install -g n8n`.
2. Inicie o n8n digitando `n8n` no terminal.
3. Acesse a url `localhost:5678`.
4. Importe o arquivo `/n8n/workflow.json`.
5. Publique o workflow.
6. Acesse a aba executions.
7. Edite um ticket para prioridade high/urgent.

## Exemplo de Payload do Webhook

Sempre que um ticket tem o status alterado para `closed` ou a prioridade alterada para `high` ou superior através do endpoint `PATCH /tickets/{id}`, o backend dispara uma requisição POST assíncrona contendo a seguinte estrutura:

```json
{
  "event": "ticket_updated",
  "ticket_id": 3,
  "customer_name": "Daniel Landuche",
  "subject": "Solicitação de reembolso",
  "status": "closed",
  "priority": "high",
  "updated_at": "2026-10-19T07:30:00.123456"
}
```

## Dataset Utilizado (Kaggle)
- [Customer support ticket dataset](https://www.kaggle.com/datasets/suraj520/customer-support-ticket-dataset?resource=download)
- Para testar outros datasets, coloque o arquivo na pasta: `/data/raw/`, execute o arquivo `data/etl.py`, e clique no botão atualizar da dashboard.
- **O arquivo `etl.py` consome sempre o arquivo mais recente dentro da pasta `/data/raw`**
- **É necessario ter instalado as dependencias com `pip install -r requirements.txt`**

```bash
cd data
python etl.py
```

## Gerando dados mockados para a pagina de tickets

Para facilitar testes, criei um arquivo que gera dados mockados dinamicamente.

- O argumento `--count` define a quantidade de tickets do arquivo gerado.
- Por padrão, o arquivo gerado contem 8.469 tickets (mesma quantidade que o arquivo `Customer support ticket dataset` do kaggle)
- Ao rodar o script, encerre a API, remova o db.sqlite antigo, e inicie a API novamente.
- **É necessario ter instalado as dependencias com `pip install -r requirements.txt`**

```bash
cd backend/seeds
python generator.py --count 500000  # Gera um arquivo com 500.000 tickets
```