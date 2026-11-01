from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from .security import token_user_id

bearer = HTTPBearer(auto_error=False)

def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Please sign in")
    try:
        user_id = token_user_id(credentials.credentials)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
