from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.auth import has_premium, optional_user
from app.core.config import settings
from app.db import get_session
from app.models import Exercise, ExerciseTranslation, User

router = APIRouter(prefix="/exercises", tags=["exercises"])


def _chain(lang: str) -> list[str]:
    """Orden de respaldo: idioma pedido -> español -> inglés."""
    chain = [lang] if lang in settings.languages else []
    for code in (settings.default_language, settings.second_language):
        if code not in chain:
            chain.append(code)
    return chain


def _pick(translations: list[ExerciseTranslation], chain: list[str]) -> ExerciseTranslation | None:
    """Nombre del mejor idioma disponible; instrucciones del primer idioma que las tenga."""
    by_lang = {t.lang: t for t in translations}
    best = next((by_lang[c] for c in chain if c in by_lang), None)
    if best and not best.instructions:
        donor = next((by_lang[c] for c in chain if c in by_lang and by_lang[c].instructions), None)
        if donor:
            return ExerciseTranslation(exercise_id=best.exercise_id, lang=best.lang, name=best.name, instructions=donor.instructions)
    return best


def _out(ex: Exercise, tr: ExerciseTranslation | None, unlocked: bool) -> dict:
    """Los ejercicios premium bloqueados muestran nombre e imagen de portada, sin detalle."""
    locked = ex.is_premium and not unlocked
    data = ex.model_dump()
    if locked:
        data["images"] = data["images"][:1]
        data["animation_url"] = None
    return {
        **data,
        "name": tr.name if tr else ex.slug,
        "instructions": [] if locked or not tr else tr.instructions,
        "locked": locked,
    }


@router.get("")
def list_exercises(
    lang: str = settings.default_language,
    muscle: str | None = None,
    level: str | None = None,
    q: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    session: Session = Depends(get_session),
    user: User | None = Depends(optional_user),
):
    chain = _chain(lang)
    unlocked = has_premium(session, user)
    stmt = select(Exercise)
    if level:
        stmt = stmt.where(Exercise.level == level)
    exercises = session.exec(stmt.order_by(Exercise.id)).all()
    translations: dict[int, list[ExerciseTranslation]] = {}
    for t in session.exec(select(ExerciseTranslation).where(ExerciseTranslation.lang.in_(chain))):
        translations.setdefault(t.exercise_id, []).append(t)

    rows = []
    for ex in exercises:  # ~800 filas: se filtra en Python (JSON + idioma de respaldo)
        if muscle and muscle not in ex.muscle_groups:
            continue
        tr = _pick(translations.get(ex.id, []), chain)
        if q and (not tr or q.lower() not in tr.name.lower()):
            continue
        rows.append((ex, tr))
    return [_out(e, t, unlocked) for e, t in rows[offset : offset + limit]]


@router.get("/{exercise_id}")
def get_exercise(
    exercise_id: int,
    lang: str = settings.default_language,
    session: Session = Depends(get_session),
    user: User | None = Depends(optional_user),
):
    ex = session.get(Exercise, exercise_id)
    if not ex:
        raise HTTPException(404)
    chain = _chain(lang)
    trs = session.exec(
        select(ExerciseTranslation).where(
            ExerciseTranslation.exercise_id == exercise_id, ExerciseTranslation.lang.in_(chain)
        )
    ).all()
    return _out(ex, _pick(list(trs), chain), has_premium(session, user))
