from app.models import Exercise
from app.services.nutrition import compute_targets
from app.services.planner import HOME_EQUIPMENT, build_plan

MUSCLES = ["quadriceps", "hamstrings", "glutes", "calves", "chest", "lats", "middle back", "shoulders",
           "biceps", "triceps", "abdominals", "traps", "lower back"]


def _pool() -> list[Exercise]:
    out, i = [], 1
    for m in MUSCLES:
        for equip in ("body only", "dumbbell", "barbell", "machine"):
            for k in range(2):
                out.append(Exercise(id=i, slug=f"{m}-{equip}-{k}", muscle_groups=[m], equipment=equip, level="beginner", category="strength"))
                i += 1
    for cat in ("cardio", "plyometrics", "stretching"):
        for k in range(12):
            out.append(Exercise(id=i, slug=f"{cat}-{k}", muscle_groups=["quadriceps"], equipment="body only", level="beginner", category=cat))
            i += 1
    return out


def test_nutrition_deficit_and_safety():
    t = compute_targets(sex="F", weight_kg=60, height_cm=165, age=28, activity="light", goal="lose_weight")
    assert 1400 < t["kcal"] < 1520 and t["kcal"] < t["tdee"] and not t["warnings"]
    assert sum(m["kcal"] for m in t["meals"]) in range(t["kcal"] - 3, t["kcal"] + 4)
    # bajo peso: no se aplica déficit
    low = compute_targets(sex="F", weight_kg=45, height_cm=165, age=28, activity="light", goal="lose_weight")
    assert "underweight_no_deficit" in low["warnings"] and low["kcal"] >= 1200
    # piso calórico
    tiny = compute_targets(sex="M", weight_kg=55, height_cm=170, age=60, activity="sedentary", goal="lose_weight")
    assert tiny["kcal"] >= 1500


def test_nutrition_surplus_for_muscle():
    t = compute_targets(sex="M", weight_kg=75, height_cm=178, age=25, activity="moderate", goal="build_muscle")
    assert t["kcal"] > t["tdee"] and t["protein_g"] >= 130


def test_plan_home_and_deterministic():
    kw = dict(goal="lose_weight", activity="sedentary", equipment="home", sex="F", seed=1, exercises=_pool())
    a, b = build_plan(**kw), build_plan(**kw)
    assert a == b and a["days_per_week"] == 3
    assert [d["kind"] for d in a["days"]] == ["full", "cardio", "full"]
    by_id = {e.id: e for e in kw["exercises"]}
    for d in a["days"]:
        assert d["exercises"]
        assert all(by_id[x["exercise_id"]].equipment in HOME_EQUIPMENT for x in d["exercises"])
    full_ids = [x["exercise_id"] for d in a["days"] if d["kind"] == "full" for x in d["exercises"]]
    assert len(full_ids) == len(set(full_ids))  # sin repetir entre sesiones


def test_plan_muscle_split():
    p = build_plan(goal="build_muscle", activity="active", equipment="gym", sex="M", seed=2, exercises=_pool())
    assert [d["kind"] for d in p["days"]] == ["push", "pull", "legs", "upper", "lower"]
    assert p["days"][0]["exercises"][0]["sets"] == 4  # intermedio: sin reducción de series


def test_menu_matches_targets():
    from app.models import Recipe
    from app.services.menu import build_menu

    recipes = [
        Recipe(id=i, slug=f"r{i}", meals=[m], kcal=k, protein_g=k / 12, tags=["vegetarian"] if i % 2 else [])
        for i, (m, k) in enumerate([("breakfast", 400), ("breakfast", 500), ("lunch", 550), ("lunch", 700), ("snack", 200), ("dinner", 450), ("dinner", 600)], 1)
    ]
    t = compute_targets(sex="F", weight_kg=68, height_cm=165, age=30, activity="light", goal="lose_weight")
    menu = build_menu(t["meals"], recipes, seed="s")
    assert [x["meal"] for x in menu] == ["breakfast", "lunch", "snack", "dinner"]
    for x in menu:
        assert 0.5 <= x["portion"] <= 2.0
        assert abs(x["recipe"].kcal * x["portion"] - x["target"]["kcal"]) / x["target"]["kcal"] < 0.35
    assert menu == build_menu(t["meals"], recipes, seed="s")  # determinista
    veg = build_menu(t["meals"], recipes, seed="s", diet="vegetarian")
    assert all("vegetarian" in x["recipe"].tags for x in veg)
