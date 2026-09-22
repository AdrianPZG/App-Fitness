from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False, "timeout": 30} if settings.database_url.startswith("sqlite") else {},
)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    _add_missing_columns()


def _add_missing_columns() -> None:
    """Migración mínima para SQLite en desarrollo: agrega columnas nuevas.
    En producción (PostgreSQL) se usará Alembic."""
    if not settings.database_url.startswith("sqlite"):
        return
    from sqlalchemy import text

    from app.models import ExerciseTranslation, Profile

    with engine.begin() as conn:
        for model in (Profile, ExerciseTranslation):
            table = model.__table__
            have = {r[1] for r in conn.execute(text(f"PRAGMA table_info({table.name})"))}
            for col in table.columns:
                if col.name not in have:
                    conn.execute(text(f"ALTER TABLE {table.name} ADD COLUMN {col.name} {col.type.compile(engine.dialect)} DEFAULT 0"))


def get_session():
    with Session(engine) as session:
        yield session
