# CareerMap

A full-stack career skills gap analyzer built with React + TypeScript and FastAPI.

## Features
- Register and log in
- Manage skills (level 1–5)
- Save job descriptions
- Extract required skills (AI-compatible with a safe local fallback)
- Calculate a transparent skills match score
- Generate and track a learning roadmap
- Responsive dashboard UI

## Stack
- Frontend: React, TypeScript, Vite, React Router, Axios, Recharts, Lucide
- Backend: FastAPI, SQLAlchemy, SQLite by default (PostgreSQL URL supported)
- Auth: JWT + PBKDF2 password hashing

## Run locally

### 1. Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```
Backend: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```
Frontend: http://localhost:5173

## AI setup
The app works without an AI key using a local skill-extraction fallback.
To enable an OpenAI-compatible chat completions endpoint, set these in `backend/.env`:
- `AI_API_KEY`
- `AI_BASE_URL` (optional; defaults to OpenAI's API base)
- `AI_MODEL` (choose a model available to your account)

Never put the AI key in the frontend `.env`.

## Important
This is a portfolio MVP, not a hiring prediction tool. The match score compares declared skill levels with extracted job requirements; it does not estimate a person's chance of getting hired.
Before public deployment, set a long random `SECRET_KEY`, use HTTPS, configure CORS for your domain, add rate limiting, and use PostgreSQL.
