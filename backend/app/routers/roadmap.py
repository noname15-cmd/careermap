from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import current_user
from ..models import User, Job, JobRequirement, RoadmapTask, Skill
from ..schemas import RoadmapTaskOut, TaskStatusIn
from ..services.analysis_service import compare_skills

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

@router.post("/generate/{job_id}", response_model=list[RoadmapTaskOut])
def generate_roadmap(job_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user.id).first()
    if not job: raise HTTPException(404, "Job not found. Analyze a job first.")
    requirements = db.query(JobRequirement).filter(JobRequirement.job_id == job.id).all()
    if not requirements: raise HTTPException(400, "Analyze this job before generating a roadmap.")
    skills = db.query(Skill).filter(Skill.user_id == user.id).all()
    _, _, gaps = compare_skills(skills, requirements)
    db.query(RoadmapTask).filter(RoadmapTask.job_id == job.id, RoadmapTask.user_id == user.id).delete()
    tasks = []
    for index, gap in enumerate(sorted(gaps, key=lambda x: (x["importance"] != "high", -x["gap"])), start=1):
        task = RoadmapTask(
            user_id=user.id, job_id=job.id, order_number=index,
            title=f"Improve {gap['skill']}",
            description=f"Current level: {gap['current_level']}/5. Target level: {gap['required_level']}/5. Study the fundamentals, complete a small practical exercise, and add evidence of your work to your portfolio."
        )
        db.add(task); tasks.append(task)
    if not tasks:
        task = RoadmapTask(user_id=user.id, job_id=job.id, order_number=1,
            title="Build a role-specific portfolio project",
            description="Your listed skills meet the extracted levels. Build a small project that demonstrates them in practice.")
        db.add(task); tasks.append(task)
    db.commit()
    for task in tasks: db.refresh(task)
    return tasks

@router.get("", response_model=list[RoadmapTaskOut])
def list_tasks(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return db.query(RoadmapTask).filter(RoadmapTask.user_id == user.id).order_by(RoadmapTask.order_number).all()

@router.patch("/{task_id}", response_model=RoadmapTaskOut)
def update_task(task_id: int, data: TaskStatusIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id, RoadmapTask.user_id == user.id).first()
    if not task: raise HTTPException(404, "Task not found")
    task.status = data.status
    db.commit(); db.refresh(task)
    return task
