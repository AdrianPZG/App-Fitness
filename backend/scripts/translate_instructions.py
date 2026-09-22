"""Traduce las instrucciones de los ejercicios con un motor offline (Argos Translate).

Uso (desde backend/):  python -m scripts.translate_instructions es
Los nombres no se traducen aquí (salen mal con traducción automática): se cargan
con scripts/apply_names.py. Las filas quedan con machine=True para revisión humana.
"""
import re
import sys

import argostranslate.package as pkg
import argostranslate.translate as tr
from sqlmodel import Session, select

from app.db import engine, init_db
from app.models import ExerciseTranslation

# Glosario previo: fija el vocabulario de gimnasio antes de traducir (es).
PRE_ES = [
    (r"\bdumbbells\b", "mancuernas"), (r"\bdumbbell\b", "mancuerna"),
    (r"\bkettlebells\b", "pesas rusas"), (r"\bkettlebell\b", "pesa rusa"),
    (r"\bbarbell\b", "barra"), (r"\bE-?Z[- ]?(curl )?bar\b", "barra Z"),
    (r"\bexercise ball\b", "balón de estabilidad"), (r"\bmedicine ball\b", "balón medicinal"),
    (r"\bfoam roller\b", "rodillo de espuma"), (r"\bresistance bands?\b", "banda elástica"),
    (r"\bbench\b", "banco"), (r"\bpull-?ups?\b", "dominadas"), (r"\bpush-?ups?\b", "flexiones"),
]
PRE = {"es": PRE_ES}


def ensure_model(code: str) -> None:
    if any(l.code == code for l in tr.get_installed_languages()) and tr.get_translation_from_codes("en", code):
        return
    pkg.update_package_index()
    p = next(p for p in pkg.get_available_packages() if p.from_code == "en" and p.to_code == code)
    pkg.install_from_path(p.download())


def translate(text: str, code: str) -> str:
    for pat, rep in PRE.get(code, []):
        text = re.sub(pat, rep, text, flags=re.I)
    return tr.translate(text, "en", code)


def main(code: str) -> None:
    init_db()
    ensure_model(code)
    with Session(engine) as s:
        rows = s.exec(select(ExerciseTranslation).where(ExerciseTranslation.lang == "en")).all()
        done = {r.exercise_id for r in s.exec(select(ExerciseTranslation).where(ExerciseTranslation.lang == code)) if r.instructions}
        todo = [r for r in rows if r.exercise_id not in done]
        for i, r in enumerate(todo, 1):
            # Si el nombre ya se cargó a mano (apply_names), se conserva; solo se agregan instrucciones.
            row = s.get(ExerciseTranslation, (r.exercise_id, code)) or ExerciseTranslation(
                exercise_id=r.exercise_id, lang=code, name=r.name
            )
            row.instructions = [translate(step, code) for step in r.instructions]
            row.machine = True
            s.add(row)
            s.commit()  # un commit por ejercicio: bloqueos cortos para no frenar a la API
            if i % 25 == 0:
                print(f"{i}/{len(todo)}", flush=True)
    print("listo", flush=True)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "es")
