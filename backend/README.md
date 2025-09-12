# AI Calling Agent - Backend Setup Guide

This guide will help you set up the backend infrastructure for your AI calling agent.

## Prerequisites

- Python 3.11+
- Docker and Docker Compose
- Twilio account with phone number
- PostgreSQL (optional if using Docker)
- Redis (optional if using Docker)

## Step 1: Project Structure

Create the following directory structure:

```
ai-calling-agent/
├── backend/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── app.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── database.py
│   │   ├── telephony/
│   │   │   ├── __init__.py
│   │   │   └── twilio_client.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── config.py
│   │       ├── logger.py
│   │       └── exceptions.py
│   ├── requirements.txt
│   └── .env
├── devops/
│   └── Dockerfile.backend
└── docker-compose.yml
```

## Step 2: Environment Setup

### Option A: Docker Setup (Recommended)

1. **Create empty `__init__.py` files**:
   ```bash
   mkdir -p backend/src/{core,telephony,utils}
   touch backend/src/__init__.py
   touch backend/src/core/__init__.py  
   touch backend/src/telephony/__init__.py
   touch backend/src/utils/__init__.py
   ```

2. **Copy all the artifact files to their respective locations**

3. **Configure environment variables** in `backend/.env`:
   ```env
   # Update these with your actual values
   TWILIO_ACCOUNT_SID=your_actual_twilio_sid
   TWILIO_AUTH_TOKEN=your_actual_twilio_token  
   TWILIO_PHONE_NUMBER=+1234567890
   API_SECRET_KEY=your-super-secret-key-here
   
   # Optional for webhook tunneling
   NGROK_AUTHTOKEN=your_ngrok_token
   ```

4. **Start the services**:
   ```bash
   cd ai-calling-agent
   docker-compose up -d postgres redis
   # Wait for services to be healthy
   docker-compose up backend
   ```

### Option B: Local Development Setup

1. **Install Python dependencies**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Setup PostgreSQL**:
   ```bash
   # Install PostgreSQL and create database
   createdb ai_calling_agent
   ```

3. **Setup Redis**:
   ```bash
   # Install and start Redis server
   redis-server
   ```

4. **Run the application**:
   ```bash
   python -m uvicorn src.app:app --reload --host 0.0.0.0 --port 8000
   ```

## Step 3: Verify Installation

1. **Check API health**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check system status**:
   ```bash
   curl http://localhost:8000/status
   ```

3. **Access API documentation**:
   - Open http://localhost:8000/docs (Swagger UI)
   - Open http://localhost:8000/redoc (ReDoc)

## Step 4: Twilio Configuration

1. **Get Twilio credentials**:
   - Sign up at https://twilio.com
   - Get Account SID and Auth Token from Console
   - Purchase a phone number

2. **Configure webhooks** (for production):
   - Use ngrok for local development: `ngrok http 8000`
   - Set webhook URLs in Twilio Console:
     - Voice webhook: `https://your-domain.com/webhooks/twilio/voice/{call_id}`
     - Status callback: `https://your-domain.com/webhooks/twilio/status/{call_id}`

## Step 5: Testing the Setup

1. **Test Twilio connection**:
   ```python
   # In Python shell or script
   import asyncio
   from src.telephony.twilio_client import twilio_client
   
   async def test():
       balance = await twilio_client.get_account_balance()
       print(f"Twilio balance: {balance}")
   
   asyncio.run(test())
   ```

2. **Test database connection**:
   - The `/status` endpoint will show database connectivity
   - Check Docker logs: `docker-compose logs backend`

## Common Issues and Solutions

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up postgres
```

### Twilio Authentication Issues
- Verify Account SID and Auth Token in `.env`
- Check Twilio Console for account status
- Ensure phone number is in correct format (+1234567890)

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Docker Issues
```bash
# Rebuild containers
docker-compose build --no-cache

# View all logs
docker-compose logs

# Reset everything
docker-compose down -v --remove-orphans
```

## Next Steps

Once the infrastructure is running:

1. **Test making a simple call** (we'll build this next)
2. **Implement call management endpoints**
3. **Add bulk calling with Celery**
4. **Integrate AI components (STT, TTS, LLM)**

## Monitoring and Debugging

- **API Logs**: `docker-compose logs backend`
- **Database Logs**: `docker-compose logs postgres`
- **Celery Tasks**: http://localhost:5555 (Flower UI)
- **API Documentation**: http://localhost:8000/docs

## Production Considerations

- Use environment-specific `.env` files
- Implement proper secret management
- Set up SSL certificates
- Configure proper logging and monitoring
- Use managed databases (AWS RDS, etc.)
- Implement rate limiting and authentication