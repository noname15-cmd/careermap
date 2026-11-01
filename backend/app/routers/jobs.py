from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import current_user
from ..models import Job, JobRequirement, User, Skill
from ..schemas import JobIn, JobOut, AnalysisOut, RequirementOut
from ..services.ai_service import extract_requirements
from ..services.analysis_service import compare_skills

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("", response_model=JobOut, status_code=201)
def create_job(data: JobIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = Job(user_id=user.id, title=data.title.strip(), description=data.description.strip())
    db.add(job); db.commit(); db.refresh(job)
    return job

@router.get("", response_model=list[JobOut])
def list_jobs(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return db.query(Job).filter(Job.user_id == user.id).order_by(Job.created_at.desc()).all()

@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user.id).first()
    if not job: raise HTTPException(404, "Job not found")
    return job

@router.post("/{job_id}/analyze", response_model=AnalysisOut)
async def analyze_job(job_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user.id).first()
    if not job: raise HTTPException(404, "Job not found")
    extracted, source = await extract_requirements(job.description)
    db.query(JobRequirement).filter(JobRequirement.job_id == job.id).delete()
    for item in extracted:
        db.add(JobRequirement(
            job_id=job.id, skill_name=item["skill_name"],
            importance=item["importance"], required_level=item["required_level"]
        ))
    db.commit()
    requirements = db.query(JobRequirement).filter(JobRequirement.job_id == job.id).all()
    skills = db.query(Skill).filter(Skill.user_id == user.id).all()
    match, matched, gaps = compare_skills(skills, requirements)
    return {
        "job_id": job.id, "role": job.title, "match": match,
        "matched_skills": matched, "gaps": gaps,
        "requirements": requirements
    }
