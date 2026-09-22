"""Carga nombres traducidos a mano desde data/names_<lang>_*.txt (formato id|nombre).

Uso (desde backend/):  python -m scripts.apply_names es
Si ya existe la fila del idioma (por ejemplo, con instrucciones traducidas), solo
actualiza el nombre; si no, la crea sin instrucciones.
"""
import glob
import sys

from sqlmodel import Session

from app.db import engine, init_db
from app.models import ExerciseTranslation


def main(lang: str) -> None:
    init_db()
    names: dict[int, str] = {}
    for path in sorted(glob.glob(f"data/names_{lang}_*.txt")):
        for line in open(path, encoding="utf-8"):
            if "|" in line:
                i, name = line.rstrip("\n").split("|", 1)
                names[int(i)] = name.strip()
    with Session(engine) as s:
        for ex_id, name in names.items():
            row = s.get(ExerciseTranslation, (ex_id, lang))
            if row:
                row.name = name
            else:
                row = ExerciseTranslation(exercise_id=ex_id, lang=lang, name=name, instructions=[], machine=False)
            s.add(row)
        s.commit()
    print(f"{len(names)} nombres aplicados ({lang})")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "es")
