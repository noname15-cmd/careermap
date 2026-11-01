from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import current_user
from ..models import Skill, User
from ..schemas import SkillIn, SkillOut

router = APIRouter(prefix="/api/skills", tags=["skills"])

@router.get("", response_model=list[SkillOut])
def list_skills(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return db.query(Skill).filter(Skill.user_id == user.id).order_by(Skill.name).all()

@router.post("", response_model=SkillOut, status_code=201)
def add_skill(data: SkillIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    existing = db.query(Skill).filter(Skill.user_id == user.id, Skill.name.ilike(data.name.strip())).first()
    if existing:
        raise HTTPException(409, "This skill is already in your profile")
    skill = Skill(user_id=user.id, name=data.name.strip(), level=data.level, category=data.category)
    db.add(skill); db.commit(); db.refresh(skill)
    return skill

@router.put("/{skill_id}", response_model=SkillOut)
def update_skill(skill_id: int, data: SkillIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill: raise HTTPException(404, "Skill not found")
    skill.name, skill.level, skill.category = data.name.strip(), data.level, data.category
    db.commit(); db.refresh(skill)
    return skill

@router.delete("/{skill_id}", status_code=204)
def delete_skill(skill_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill: raise HTTPException(404, "Skill not found")
    db.delete(skill); db.commit()
