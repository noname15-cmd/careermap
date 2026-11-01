from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import current_user
from ..models import User
from ..schemas import UserOut, ProfileUpdate

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def get_profile(user: User = Depends(current_user)):
    return user

@router.put("/me", response_model=UserOut)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(current_user)):
    user.name = data.name.strip()
    user.target_role = data.target_role.strip()
    db.commit(); db.refresh(user)
    return user
