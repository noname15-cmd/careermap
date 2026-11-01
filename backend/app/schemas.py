from pydantic import BaseModel, EmailStr, Field
from typing import Literal

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    target_role: str
    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    target_role: str = Field(min_length=2, max_length=120)

class SkillIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    level: int = Field(ge=1, le=5)
    category: str = Field(default="Technical", max_length=80)

class SkillOut(SkillIn):
    id: int
    class Config:
        from_attributes = True

class JobIn(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=30, max_length=12000)

class RequirementOut(BaseModel):
    skill_name: str
    importance: str
    required_level: int
    class Config:
        from_attributes = True

class JobOut(BaseModel):
    id: int
    title: str
    description: str
    class Config:
        from_attributes = True

class AnalysisOut(BaseModel):
    job_id: int
    role: str
    match: float
    matched_skills: list[str]
    gaps: list[dict]
    requirements: list[RequirementOut]

class RoadmapTaskOut(BaseModel):
    id: int
    job_id: int
    title: str
    description: str
    status: str
    order_number: int
    class Config:
        from_attributes = True

class TaskStatusIn(BaseModel):
    status: Literal["pending", "in_progress", "completed"]
