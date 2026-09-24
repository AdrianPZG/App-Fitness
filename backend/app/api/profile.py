from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlmodel import Session

from app.auth import current_user
from app.core.config import settings
from app.db import get_session
from app.models import ActivityLevel, Equipment, Goal, Profile, Sex, Subscription, User

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


@router.get("/subscription")
def get_subscription(user: User = Depends(current_user), session: Session = Depends(get_session)):
    """Estado de la suscripción para mostrar en Perfil (no decide accesos: eso lo hace has_premium)."""
    sub = session.get(Subscription, user.id)
    if not sub:
        return {"status": "none", "days_left": None, "price_mxn": 50}
    days_left = None
    if sub.expires_at:
        exp = sub.expires_at if sub.expires_at.tzinfo else sub.expires_at.replace(tzinfo=timezone.utc)
        days_left = max(0, (exp - datetime.now(timezone.utc)).days)
    return {"status": sub.status, "days_left": days_left, "price_mxn": 50}
