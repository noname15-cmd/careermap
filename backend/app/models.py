from datetime import datetime, timezone
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    target_role: Mapped[str] = mapped_column(String(120), default="Software Developer")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    skills: Mapped[list["Skill"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    jobs: Mapped[list["Job"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    tasks: Mapped[list["RoadmapTask"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    level: Mapped[int] = mapped_column(Integer, default=1)
    category: Mapped[str] = mapped_column(String(80), default="Technical")
    user: Mapped["User"] = relationship(back_populates="skills")

class Job(Base):
    __tablename__ = "jobs"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    requirements: Mapped[list["JobRequirement"]] = relationship(back_populates="job", cascade="all, delete-orphan")
    user: Mapped["User"] = relationship(back_populates="jobs")

class JobRequirement(Base):
    __tablename__ = "job_requirements"
    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), index=True)
    skill_name: Mapped[str] = mapped_column(String(100))
    importance: Mapped[str] = mapped_column(String(20), default="medium")
    required_level: Mapped[int] = mapped_column(Integer, default=3)
    job: Mapped["Job"] = relationship(back_populates="requirements")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), index=True)
    title: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="pending")
    order_number: Mapped[int] = mapped_column(Integer, default=1)
    user: Mapped["User"] = relationship(back_populates="tasks")
