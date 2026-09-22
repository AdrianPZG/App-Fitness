"""Siembra el catálogo propio de recetas (idempotente). Uso: python -m scripts.seed_recipes"""
from sqlmodel import Session, select

from data.recipes_seed import INGREDIENTS, RECIPES
from app.db import engine, init_db
from app.models import Recipe, RecipeTranslation


def macros(items: list[tuple[str, float]]) -> dict:
    tot = {"kcal": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0}
    for key, g in items:
        _, _, kcal, p, c, f, _ = INGREDIENTS[key]
        tot["kcal"] += kcal * g / 100
        tot["protein_g"] += p * g / 100
        tot["carbs_g"] += c * g / 100
        tot["fat_g"] += f * g / 100
    return {k: round(v, 1) for k, v in tot.items()}


def tags_for(items: list[tuple[str, float]], m: dict) -> list[str]:
    diets = {INGREDIENTS[k][6] for k, _ in items}
    tags = []
    if "m" not in diets:
        tags.append("vegetarian")
    if diets == {"v"}:
        tags.append("vegan")
    if m["protein_g"] >= 30:
        tags.append("high_protein")
    if m["kcal"] < 400:
        tags.append("low_calorie")
    if m["kcal"] >= 650:
        tags.append("high_calorie")
    return tags


def main() -> None:
    init_db()
    with Session(engine) as s:
        for slug, meals, prep, t_es, t_en, items, st_es, st_en in RECIPES:
            m = macros(items)
            r = s.exec(select(Recipe).where(Recipe.slug == slug)).first() or Recipe(slug=slug)
            r.meals, r.prep_min, r.tags = meals, prep, tags_for(items, m)
            r.kcal, r.protein_g, r.carbs_g, r.fat_g = m["kcal"], m["protein_g"], m["carbs_g"], m["fat_g"]
            r.ingredients = [
                {"key": k, "names": {"es": INGREDIENTS[k][0], "en": INGREDIENTS[k][1]}, "grams": g} for k, g in items
            ]
            s.add(r)
            s.commit()
            s.refresh(r)
            s.merge(RecipeTranslation(recipe_id=r.id, lang="es", title=t_es, steps=st_es))
            s.merge(RecipeTranslation(recipe_id=r.id, lang="en", title=t_en, steps=st_en))
        s.commit()
    print(f"{len(RECIPES)} recetas sembradas")


if __name__ == "__main__":
    main()
