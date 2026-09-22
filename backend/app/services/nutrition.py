"""Metas nutricionales por reglas (Mifflin-St Jeor + ajuste por objetivo).

Es orientativo, no consejo médico. Incluye topes de seguridad: mínimo calórico,
sin déficit si el IMC ya es bajo y proteína limitada.
"""

ACTIVITY_FACTOR = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725}
GOAL_ADJUST = {"lose_weight": -0.20, "gain_weight": 0.15, "build_muscle": 0.10}
PROTEIN_PER_KG = {"lose_weight": 1.8, "build_muscle": 1.8, "gain_weight": 1.6}
MIN_KCAL = {"F": 1200, "M": 1500}
MEALS = (("breakfast", 0.25), ("lunch", 0.30), ("snack", 0.15), ("dinner", 0.30))


def compute_targets(
    *, sex: str, weight_kg: float, height_cm: float, age: int, activity: str, goal: str
) -> dict:
    warnings: list[str] = []
    bmi = weight_kg / (height_cm / 100) ** 2
    effective_goal = goal

    if goal == "lose_weight" and bmi < 18.5:
        effective_goal = "stay_fit"  # no se recomienda déficit con bajo peso
        warnings.append("underweight_no_deficit")
    if goal == "gain_weight" and bmi >= 30:
        warnings.append("review_goal")

    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + (5 if sex == "M" else -161)
    tdee = bmr * ACTIVITY_FACTOR[activity]
    kcal = tdee * (1 + GOAL_ADJUST.get(effective_goal, 0))
    if kcal < MIN_KCAL[sex]:
        kcal = MIN_KCAL[sex]
        warnings.append("calorie_floor")

    protein = min(PROTEIN_PER_KG.get(effective_goal, 1.4) * weight_kg, 0.35 * kcal / 4)
    fat = max(0.25 * kcal / 9, 0.6 * weight_kg)
    carbs = max((kcal - 4 * protein - 9 * fat) / 4, 0)

    def macros(f: float) -> dict:
        return {
            "kcal": round(kcal * f),
            "protein_g": round(protein * f),
            "fat_g": round(fat * f),
            "carbs_g": round(carbs * f),
        }

    return {
        "goal": goal,
        "effective_goal": effective_goal,
        "bmi": round(bmi, 1),
        "bmr": round(bmr),
        "tdee": round(tdee),
        **macros(1),
        "fiber_g": round(14 * kcal / 1000),
        "water_ml": round(weight_kg * 35 / 50) * 50,
        "meals": [{"key": key, **macros(share)} for key, share in MEALS],
        "warnings": warnings,
    }
