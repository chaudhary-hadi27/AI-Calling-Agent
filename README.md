# 🤖 AI Calling Agent

An AI-powered calling agent that can **handle real-time phone calls, understand speech, generate intelligent responses, and speak back to callers**. The system integrates **Telephony (Twilio/Asterisk), Speech-to-Text (Whisper), AI Brain (Groq/OpenAI), and Text-to-Speech (ElevenLabs)**. A **React + Tailwind dashboard** is included for monitoring, configuration, and analytics.

---

## 📂 Project Structure

```
ai-calling-agent/
│
│── .github/                      
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md       
│   │   └── feature_request.md   
│── ├── workflows/                         
│   │   └── ci.yml                  
│   │
│── backend/                         # AI + telephony backend
│   ├── src/
│   │   ├── telephony/                # Call handling (Twilio/Asterisk)
│   │   ├── stt/                      # Speech to Text (Whisper, Google STT)
│   │   ├── tts/                      # Text to Speech (ElevenLabs, Azure)
│   │   ├── nlp/                      # AI brain (LLM + intents)
│   │   ├── integrations/             # CRM, DB, APIs
│   │   ├── core/                     # Orchestration & session flow
│   │   ├── utils/                    # Logger & config
│   │   └── app.py                    # Backend entry point (FastAPI/Flask)
│   │
│   ├── tests/                        # Unit & integration tests
│   ├── requirements.txt              # Backend dependencies
│   └── .env                          # Environment variables
│
│── frontend/                         # Dashboard + Control Panel
│   ├── public/                       # Static assets (logos, icons)
│   ├── src/
│   │   ├── app/               # Nextjs Frontend
│   │   ├── components/                   
│   │   ├── lib/  
│   │   ├── styles/             
│   │   ├── types/                
│   │
│   ├── package.json               
│   └── postcss.config.mjs
│
│── devops/                           # Deployment setup
│   ├── Dockerfile.backend            # Backend container
│   ├── Dockerfile.frontend           # Frontend container
│   ├── docker-compose.yml            # Local dev orchestration
│   ├── k8s/                          # Kubernetes configs
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   └── ingress.yaml
│   └── github-actions.yml            # CI/CD pipeline
│
│── docs/                             # API & setup documentation
│── README.md                         # Main documentation
└── .gitignore
```

---

## ⚙️ Backend Overview

The backend is built with **FastAPI (recommended)** or Flask. It runs the AI call pipeline:

1. **Telephony Layer** → Call connect/disconnect & audio streaming (Twilio/Asterisk).
2. **STT (Speech-to-Text)** → Converts customer audio into text (Whisper/Deepgram/Google).
3. **NLP (AI Brain)** → Processes text using LLM (Groq/OpenAI) or intent classifier.
4. **TTS (Text-to-Speech)** → Converts AI response back to voice (ElevenLabs/Azure).
5. **Integrations** → Fetches CRM records, database info, order status, etc.
6. **Core Orchestration** → Session manager + call flow control.

### Example Flow:

```
Caller → Telephony → STT → NLP → TTS → Telephony → Caller
                                │
                                └──> CRM / Database / APIs
```

---

## 🎨 Frontend Overview

The frontend is built with **React + Tailwind** and provides a dashboard for admins/operators.

### Features:

* 🔴 **Live Call Monitoring** → See live transcripts & status.
* 📜 **Call Logs** → Review past call history & transcripts.
* ⚙️ **Agent Settings** → Configure AI personality, voice, and rules.
* 📊 **Analytics** → KPIs (call volume, average handling time, agent performance).

### Tech Stack:

* React (with TypeScript recommended)
* TailwindCSS for styling
* Axios/Fetch for backend API calls
* WebSockets for live updates (optional)

---

## 🚀 DevOps & Deployment

### Local Development

1. Clone repository:

   ```bash
   git clone https://github.com/your-org/ai-calling-agent.git
   cd ai-calling-agent
   ```

2. Setup backend:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.template.example .env.template  # Add Twilio, Groq, ElevenLabs keys
   uvicorn src.app:app --reload
   ```

3. Setup frontend:

   ```bash
   cd frontend
   npm install
   npm start
   ```

4. Run with Docker Compose:

   ```bash
   cd devops
   docker-compose up --build
   ```

---

### Production Deployment

We use **Docker + Kubernetes** for production.

* **Dockerfiles** → For backend & frontend builds.
* **Kubernetes manifests** → Located in `devops/k8s/`.

  * `backend-deployment.yaml` → Backend API deployment.
  * `frontend-deployment.yaml` → Frontend React app deployment.
  * `ingress.yaml` → Ingress controller (NGINX) for routing.
* **CI/CD (GitHub Actions)** → Automates build & deployment.

#### Deployment Steps:

```bash
kubectl apply -f devops/k8s/backend-deployment.yaml
kubectl apply -f devops/k8s/frontend-deployment.yaml
kubectl apply -f devops/k8s/ingress.yaml
```

---

## 🔐 Environment Variables (.env)

| Variable             | Description                 |
| -------------------- | --------------------------- |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID          |
| `TWILIO_AUTH_TOKEN`  | Twilio Auth Token           |
| `GROQ_API_KEY`       | Groq/OpenAI API key for LLM |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS key          |
| `DATABASE_URL`       | Database connection string  |
| `CRM_API_KEY`        | CRM integration key         |

---

## 🧪 Testing

Backend tests are in `/backend/tests/`. Run with:

```bash
pytest backend/tests/
```

---

## 📊 Monitoring & Logging

* **Backend logs** → Structured logging with `logger.py`.
* **Monitoring** → Can integrate Prometheus + Grafana for metrics.
* **Centralized logging** → ELK (Elasticsearch, Logstash, Kibana) recommended.

---

## 📌 Roadmap

* [ ] Add support for multiple telephony providers (Asterisk, Plivo).
* [ ] Multi-language support (STT + TTS).
* [ ] Add real-time WebSocket transcripts to dashboard.
* [ ] Implement analytics dashboard with charts.
* [ ] Integrate with more CRMs (Hubspot, Salesforce).

---

## 🏗️ High-Level Architecture

```
          ┌───────────┐
Caller →  │ Telephony │  ←→ Twilio / Asterisk
          └─────┬─────┘
                │ Audio Stream
                ▼
        ┌─────────────┐
        │   STT (AI)  │ ←→ Whisper / Google STT
        └─────┬───────┘
              │ Text
              ▼
        ┌─────────────┐
        │   NLP (LLM) │ ←→ Groq / OpenAI / Rasa
        └─────┬───────┘
              │ Response
              ▼
        ┌─────────────┐
        │   TTS (AI)  │ ←→ ElevenLabs / Azure TTS
        └─────┬───────┘
              │ Audio
              ▼
          ┌───────────┐
Caller ←  │ Telephony │
          └───────────┘
```

Dashboard connects to **Backend APIs** for monitoring, logs, and analytics.

---

## 🤝 Contribution Guidelines

1. Fork the repo & create a feature branch.
2. Add your changes in the right module (backend/frontend/devops).
3. Write tests for new code.
4. Submit a Pull Request.

---

## 📜 License

This project is licensed under the **MIT License**.
