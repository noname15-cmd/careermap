from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from . import models
from .routers import auth, users, skills, jobs, roadmap

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareerMap API", version="1.0.0", description="Career skills gap analyzer API")

@app.get("/")
def home():
    return {
        "project": "CareerMap Mini",
        "message": "Welcome to CareerMap Mini API!",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(skills.router)
app.include_router(jobs.router)
app.include_router(roadmap.router)

@app.get("/api/health")
def health():
    return {"status": "ok", "app": "CareerMap"}
