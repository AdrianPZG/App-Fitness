"""Generador de plan semanal por reglas.

Elige el tipo de sesión según objetivo y días disponibles, y rellena cada sesión con
ejercicios de la base filtrados por nivel y equipo. Es determinista: el mismo perfil
produce el mismo plan (semilla estable), y cambia al cambiar el perfil.
"""
import random

from app.models import Exercise

HOME_EQUIPMENT = {None, "body only", "dumbbell", "bands", "kettlebells", "exercise ball", "medicine ball", "foam roll"}
LEVELS = {"beginner": {"beginner"}, "intermediate": {"beginner", "intermediate"}}
DAYS_BY_ACTIVITY = {"sedentary": 3, "light": 3, "moderate": 4, "active": 5}
WEEKDAYS = {3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4]}

# (músculos primarios, cantidad de ejercicios)
KIND_SLOTS: dict[str, list[tuple[tuple[str, ...], int]]] = {
    "full": [(("quadriceps",), 1), (("hamstrings", "glutes"), 1), (("chest",), 1), (("lats", "middle back"), 1), (("shoulders",), 1), (("abdominals",), 1)],
    "upper": [(("chest",), 2), (("lats", "middle back"), 2), (("shoulders",), 1), (("biceps",), 1), (("triceps",), 1)],
    "lower": [(("quadriceps",), 2), (("hamstrings",), 1), (("glutes",), 1), (("calves",), 1), (("abdominals",), 1)],
    "push": [(("chest",), 2), (("shoulders",), 2), (("triceps",), 2)],
    "pull": [(("lats", "middle back"), 3), (("biceps",), 2), (("traps", "lower back"), 1)],
    "legs": [(("quadriceps",), 2), (("hamstrings",), 1), (("glutes",), 1), (("calves",), 1), (("abdominals",), 1)],
}

SPLITS: dict[str, dict[int, list[str]]] = {
    "fat_loss": {3: ["full", "cardio", "full"], 4: ["full", "cardio", "full", "cardio"], 5: ["full", "cardio", "full", "cardio", "mobility"]},
    "muscle": {3: ["full", "full", "full"], 4: ["upper", "lower", "upper", "lower"], 5: ["push", "pull", "legs", "upper", "lower"]},
    "general": {3: ["full", "cardio", "full"], 4: ["upper", "lower", "cardio", "full"], 5: ["upper", "lower", "cardio", "full", "mobility"]},
    "light": {3: ["cardio", "full", "mobility"]},
}
GOAL_SPLIT = {
    "lose_weight": "fat_loss",
    "build_muscle": "muscle",
    "gain_weight": "muscle",
    "stay_fit": "general",
    "eat_better": "general",
    "stay_active": "light",
}
# sets, reps, descanso (s)
RX = {
    "lose_weight": (3, "12-15", 45),
    "build_muscle": (4, "8-12", 75),
    "gain_weight": (4, "6-10", 90),
    "stay_fit": (3, "10-12", 60),
    "eat_better": (3, "10-12", 60),
    "stay_active": (2, "12-15", 45),
}


def level_for(activity: str) -> str:
    return "beginner" if activity in ("sedentary", "light") else "intermediate"


def build_plan(*, goal: str, activity: str, equipment: str, sex: str, seed: int, exercises: list[Exercise]) -> dict:
    level = level_for(activity)
    split_name = GOAL_SPLIT[goal]
    days_n = min(DAYS_BY_ACTIVITY[activity], 3) if split_name == "light" else DAYS_BY_ACTIVITY[activity]
    kinds = SPLITS[split_name][days_n]
    rnd = random.Random(f"{seed}-{goal}-{activity}-{equipment}-{sex}")

    allowed_levels = LEVELS[level]
    pool = sorted(
        (e for e in exercises if (equipment == "gym" or e.equipment in HOME_EQUIPMENT) and (e.level in allowed_levels or e.level is None)),
        key=lambda e: e.id or 0,
    )
    used: set[int] = set()

    def pick(candidates: list[Exercise], n: int) -> list[Exercise]:
        fresh = [e for e in candidates if e.id not in used]
        rnd.shuffle(fresh)
        chosen = fresh[:n]
        if len(chosen) < n:  # pool agotado: se permite repetir
            rest = [e for e in candidates if e not in chosen]
            rnd.shuffle(rest)
            chosen += rest[: n - len(chosen)]
        used.update(e.id for e in chosen)
        return chosen

    sets, reps, rest_s = RX[goal]
    if level == "beginner":
        sets = max(2, sets - 1)

    days = []
    for i, kind in enumerate(kinds):
        items: list[dict] = []
        if kind == "cardio":
            cands = [e for e in pool if e.category in ("cardio", "plyometrics") and (goal != "stay_active" or e.category == "cardio")]
            items = [{"exercise_id": e.id, "sets": 3, "reps": None, "seconds": 40, "rest_s": 30} for e in pick(cands, 5)]
        elif kind == "mobility":
            cands = [e for e in pool if e.category == "stretching"]
            items = [{"exercise_id": e.id, "sets": 2, "reps": None, "seconds": 30, "rest_s": 10} for e in pick(cands, 6)]
        else:
            for muscles, n in KIND_SLOTS[kind]:
                cands = [e for e in pool if e.category == "strength" and e.muscle_groups and e.muscle_groups[0] in muscles]
                items += [
                    {"exercise_id": e.id, "sets": sets, "reps": reps, "seconds": None, "rest_s": rest_s}
                    for e in pick(cands, n)
                ]
        days.append({"day": i + 1, "kind": kind, "exercises": items})

    return {
        "goal": goal,
        "level": level,
        "days_per_week": days_n,
        "weekdays": WEEKDAYS[days_n],
        "equipment": equipment,
        "days": days,
    }
