from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.exercises import _chain, _out, _pick
from app.auth import current_user, has_premium
from app.core.config import settings
from app.db import get_session
from app.models import Exercise, ExerciseTranslation, Profile, User
from app.services.nutrition import compute_targets
from app.services.planner import build_plan

router = APIRouter(prefix="/me", tags=["plan"])


def _profile(user: User, session: Session) -> Profile:
    p = session.get(Profile, user.id)
    needed = (p.height_cm, p.weight_kg, p.sex, p.goal, p.birth_year, p.activity_level, p.equipment)
    if any(v is None for v in needed):
        raise HTTPException(409, "Perfil incompleto")
    return p


def _premium_only(session: Session, user: User) -> None:
    if not has_premium(session, user):
        raise HTTPException(402, "Requiere suscripción")


@router.get("/plan")
def my_plan(
    lang: str = settings.default_language,
    user: User = Depends(current_user),
    session: Session = Depends(get_session),
):
    _premium_only(session, user)
    p = _profile(user, session)
    plan = build_plan(
        goal=p.goal.value,
        activity=p.activity_level.value,
        equipment=p.equipment.value,
        sex=p.sex.value,
        seed=user.id,
        exercises=list(session.exec(select(Exercise)).all()),
    )
    ids = {item["exercise_id"] for d in plan["days"] for item in d["exercises"]}
    chain = _chain(lang)
    exercises = {e.id: e for e in session.exec(select(Exercise).where(Exercise.id.in_(ids)))}
    trs: dict[int, list[ExerciseTranslation]] = {}
    for t in session.exec(
        select(ExerciseTranslation).where(ExerciseTranslation.exercise_id.in_(ids), ExerciseTranslation.lang.in_(chain))
    ):
        trs.setdefault(t.exercise_id, []).append(t)
    for d in plan["days"]:
        for item in d["exercises"]:
            eid = item.pop("exercise_id")
            item["exercise"] = _out(exercises[eid], _pick(trs.get(eid, []), chain), True)
    return plan


@router.get("/nutrition")
def my_nutrition(user: User = Depends(current_user), session: Session = Depends(get_session)):
    _premium_only(session, user)
    p = _profile(user, session)
    return compute_targets(
        sex=p.sex.value,
        weight_kg=p.weight_kg,
        height_cm=p.height_cm,
        age=date.today().year - p.birth_year,
        activity=p.activity_level.value,
        goal=p.goal.value,
    )
