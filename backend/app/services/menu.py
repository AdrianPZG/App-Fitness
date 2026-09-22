"""Arma el menú del día: para cada comida elige una receta y ajusta la porción para
acercarse a las calorías y la proteína objetivo de esa comida."""
import random

from app.models import Recipe

MIN_PORTION, MAX_PORTION = 0.5, 2.0


def portion_for(recipe: Recipe, target_kcal: float) -> float:
    raw = target_kcal / recipe.kcal if recipe.kcal else 1
    return min(MAX_PORTION, max(MIN_PORTION, round(raw * 4) / 4))


def _score(recipe: Recipe, portion: float, meal: dict) -> float:
    kcal_err = abs(recipe.kcal * portion - meal["kcal"]) / max(meal["kcal"], 1)
    prot_err = abs(recipe.protein_g * portion - meal["protein_g"]) / max(meal["protein_g"], 1)
    return kcal_err + 0.7 * prot_err


def build_menu(meals: list[dict], recipes: list[Recipe], seed: str, diet: str | None = None) -> list[dict]:
    """meals: [{key, kcal, protein_g, ...}] (reparto de nutrition.compute_targets)."""
    pool = [r for r in recipes if diet is None or diet in r.tags]
    used: set[int] = set()
    out = []
    for meal in meals:
        cands = [r for r in pool if meal["key"] in r.meals]
        if not cands:
            continue
        ranked = sorted(cands, key=lambda r: (_score(r, portion_for(r, meal["kcal"]), meal), r.id))
        fresh = [r for r in ranked if r.id not in used] or ranked
        rnd = random.Random(f"{seed}-{meal['key']}")
        recipe = rnd.choice(fresh[:4])  # variedad: uno de los 4 mejores ajustes
        used.add(recipe.id)
        portion = portion_for(recipe, meal["kcal"])
        out.append({"meal": meal["key"], "target": meal, "recipe": recipe, "portion": portion})
    return out
