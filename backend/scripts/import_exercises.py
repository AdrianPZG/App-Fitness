"""Importa free-exercise-db (dominio público) a la BD.

Solo carga inglés; el resto de idiomas se rellena con un script de traducción
posterior. Ejecutar desde backend/:  python -m scripts.import_exercises
"""
import httpx
from sqlmodel import Session, select

from app.db import engine, init_db
from app.models import Exercise, ExerciseTranslation

BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main"


def main() -> None:
    init_db()
    data = httpx.get(f"{BASE}/dist/exercises.json", timeout=60).json()
    with Session(engine) as s:
        for i, item in enumerate(sorted(data, key=lambda d: d["id"])):
            slug = item["id"]
            ex = s.exec(select(Exercise).where(Exercise.slug == slug)).first() or Exercise(slug=slug)
            ex.muscle_groups = item.get("primaryMuscles", []) + item.get("secondaryMuscles", [])
            ex.equipment = item.get("equipment")
            ex.level = item.get("level")
            ex.category = item.get("category")
            # Provisional: 1 de cada 3 es gratis (el resto premium). Se afinará con criterio editorial.
            ex.is_premium = i % 3 != 0
            ex.images = [f"{BASE}/exercises/{p}" for p in item.get("images", [])]
            ex.source_url = f"https://github.com/yuhonas/free-exercise-db/tree/main/exercises/{slug}"
            s.add(ex)
            s.commit()
            s.refresh(ex)
            s.merge(
                ExerciseTranslation(
                    exercise_id=ex.id, lang="en", name=item["name"], instructions=item.get("instructions", [])
                )
            )
        s.commit()
    print(f"Importados {len(data)} ejercicios")


if __name__ == "__main__":
    main()
