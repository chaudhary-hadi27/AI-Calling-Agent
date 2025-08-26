# AI Calling Agent 📞🤖

This project is a **Bulk AI Calling System** that enables businesses to automate calls using AI and manage leads via an integrated CRM.

---

## 📂 Project Structure

```
AI-Calling-Agent/
│
├── backend/        # FastAPI backend (Core API + CRM bridge)
│   ├── app/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── ai_engine/      # AI microservice (STT, TTS, LLM, Call Flow)
│   ├── services/
│   ├── models/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── crm/            # CRM microservice (Contacts, Campaigns, Logs)
│   ├── app/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── frontend/       # Next.js frontend (Dashboard + CRM UI)
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── database/       # PostgreSQL database + init scripts
│   ├── init.sql
│   └── Dockerfile
│
├── infra/          # Infrastructure setup
│   ├── docker-compose.yml
│   └── Dockerfile(s)
│
├── .github/        # GitHub Actions workflows
│   └── workflows/
│       └── ci-cd.yml
│
└── README.md       # Project documentation
```

---

## ⚙️ System Architecture

```
Frontend (Next.js @3000)
        ↓
Backend (FastAPI @8000)
   ├──> AI Engine (FastAPI @8500)
   ├──> CRM (FastAPI @8600)
   └──> PostgreSQL DB (@5432)
```

* **Frontend (Next.js)** → User dashboard for campaigns & CRM
* **Backend (FastAPI)** → Bridge between frontend, AI Engine & CRM
* **AI Engine (FastAPI)** → Speech-to-Text, Text-to-Speech, LLM, Call Flow logic
* **CRM (FastAPI)** → Contacts, Campaigns, Call Logs
* **Database (PostgreSQL)** → Central storage for CRM + AI logs

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourname/AI-Calling-Agent.git
cd AI-Calling-Agent/infra
```

### 2. Start all services with Docker

```bash
docker-compose up --build
```

### 3. Access services

* **Frontend UI** → [http://localhost:3000](http://localhost:3000)
* **Backend API** → [http://localhost:8000](http://localhost:8000)
* **AI Engine** → [http://localhost:8500](http://localhost:8500)
* **CRM Service** → [http://localhost:8600](http://localhost:8600)
* **Database** → `localhost:5432`

---

## 👩‍💻 Developer Workflow

### 🔧 Adding Dependencies

* **Backend** → `backend/requirements.txt`
* **AI Engine** → `ai_engine/requirements.txt`
* **CRM** → `crm/requirements.txt`
* **Frontend** → `frontend/package.json`

### 🌍 Environment Variables

* **Backend** → `backend/.env`
* **AI Engine** → `ai_engine/.env`
* **CRM** → `crm/.env`
* **Frontend** → `frontend/.env`

### 🖥 Run Locally (without Docker)

```bash
# Run backend
cd backend
uvicorn app.main:app --reload

# Run AI Engine
cd ai_engine
uvicorn services.main:app --reload --port 8500

# Run CRM
cd crm
uvicorn app.main:app --reload --port 8600

# Run frontend
cd frontend
npm install
npm start
```

---

## 🛠️ CI/CD (GitHub Actions)

On every push, the pipeline will:

1. Build backend, ai\_engine, crm & frontend
2. Run backend & ai\_engine tests
3. Build frontend assets

Workflow file: `.github/workflows/ci-cd.yml`

---

## 📦 Tech Stack

* **Frontend** → Next.js (TypeScript)
* **Backend** → FastAPI (Python)
* **AI Engine** → FastAPI (Python) with STT, TTS, LLM
* **CRM** → FastAPI (Python, microservice for leads & campaigns)
* **Database** → PostgreSQL
* **Infra** → Docker + docker-compose
* **CI/CD** → GitHub Actions

---

## 🧑‍🤝‍🧑 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you’d like to change.
