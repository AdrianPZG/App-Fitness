from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.plans import _premium_only, _profile
from app.auth import current_user
from app.core.config import settings
from app.db import get_session
from app.models import Recipe, RecipeTranslation, User
from app.services.menu import build_menu
from app.services.nutrition import compute_targets

router = APIRouter(tags=["recipes"])


def _chain(lang: str) -> list[str]:
    out = [lang] if lang in settings.languages else []
    return out + [c for c in (settings.default_language, settings.second_language) if c not in out]


def _view(recipe: Recipe, tr: dict[str, RecipeTranslation], lang: str, portion: float) -> dict:
    chain = _chain(lang)
    t = next((tr[c] for c in chain if c in tr), None)
    return {
        "id": recipe.id,
        "slug": recipe.slug,
        "title": t.title if t else recipe.slug,
        "steps": t.steps if t else [],
        "prep_min": recipe.prep_min,
        "tags": recipe.tags,
        "portion": portion,
        "kcal": round(recipe.kcal * portion),
        "protein_g": round(recipe.protein_g * portion),
        "carbs_g": round(recipe.carbs_g * portion),
        "fat_g": round(recipe.fat_g * portion),
        "ingredients": [
            {
                "name": next((i["names"][c] for c in chain if c in i["names"]), i["key"]),
                "grams": round(i["grams"] * portion / 5) * 5 or 5,
            }
            for i in recipe.ingredients
        ],
    }


def _translations(session: Session, ids: set[int]) -> dict[int, dict[str, RecipeTranslation]]:
    out: dict[int, dict[str, RecipeTranslation]] = {}
    for t in session.exec(select(RecipeTranslation).where(RecipeTranslation.recipe_id.in_(ids))):
        out.setdefault(t.recipe_id, {})[t.lang] = t
    return out


@router.get("/me/menu")
def my_menu(
    lang: str = settings.default_language,
    variant: int = 0,
    diet: str | None = None,
    user: User = Depends(current_user),
    session: Session = Depends(get_session),
):
    """Menú de hoy. `variant` cambia la selección (botón "otra opción"); `diet`: vegetarian | vegan."""
    _premium_only(session, user)
    p = _profile(user, session)
    targets = compute_targets(
        sex=p.sex.value, weight_kg=p.weight_kg, height_cm=p.height_cm,
        age=date.today().year - p.birth_year, activity=p.activity_level.value, goal=p.goal.value,
    )
    recipes = list(session.exec(select(Recipe)).all())
    picks = build_menu(targets["meals"], recipes, seed=f"{user.id}-{date.today()}-{variant}", diet=diet)
    trs = _translations(session, {x["recipe"].id for x in picks})
    meals = [
        {"meal": x["meal"], "target_kcal": x["target"]["kcal"], "recipe": _view(x["recipe"], trs[x["recipe"].id], lang, x["portion"])}
        for x in picks
    ]
    total = {k: sum(m["recipe"][k] for m in meals) for k in ("kcal", "protein_g", "carbs_g", "fat_g")}
    return {"date": date.today().isoformat(), "target": {k: targets[k] for k in ("kcal", "protein_g", "carbs_g", "fat_g")}, "total": total, "meals": meals}


@router.get("/recipes/{recipe_id}")
def get_recipe(
    recipe_id: int,
    lang: str = settings.default_language,
    portion: float = 1.0,
    user: User = Depends(current_user),
    session: Session = Depends(get_session),
):
    _premium_only(session, user)
    recipe = session.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(404)
    return _view(recipe, _translations(session, {recipe_id})[recipe_id], lang, min(max(portion, 0.5), 3.0))
