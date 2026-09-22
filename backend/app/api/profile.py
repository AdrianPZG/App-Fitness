from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlmodel import Session

from app.auth import current_user
from app.core.config import settings
from app.db import get_session
from app.models import ActivityLevel, Equipment, Goal, Profile, Sex, User

router = APIRouter(prefix="/me", tags=["me"])


class ProfileUpdate(BaseModel):
    name: str | None = None
    height_cm: float | None = Field(default=None, ge=50, le=260)
    weight_kg: float | None = Field(default=None, ge=20, le=400)
    sex: Sex | None = None
    goal: Goal | None = None
    birth_year: int | None = Field(default=None, ge=1930, le=date.today().year - 13)
    activity_level: ActivityLevel | None = None
    equipment: Equipment | None = None
    locale: str | None = Field(default=None, pattern="^(" + "|".join(settings.languages) + ")$")


@router.get("/profile")
def get_profile(user: User = Depends(current_user), session: Session = Depends(get_session)):
    return session.get(Profile, user.id)


@router.put("/profile")
def update_profile(
    data: ProfileUpdate, user: User = Depends(current_user), session: Session = Depends(get_session)
):
    profile = session.get(Profile, user.id)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(profile, k, v)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile
