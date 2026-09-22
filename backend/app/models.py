from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Sex(str, Enum):
    M = "M"
    F = "F"


class ActivityLevel(str, Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"


class Equipment(str, Enum):
    home = "home"
    gym = "gym"


class Goal(str, Enum):
    lose_weight = "lose_weight"
    gain_weight = "gain_weight"
    build_muscle = "build_muscle"
    stay_fit = "stay_fit"
    stay_active = "stay_active"
    eat_better = "eat_better"


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    firebase_uid: str = Field(unique=True, index=True)
    email: str | None = None
    phone: str | None = None
    created_at: datetime = Field(default_factory=_now)


class Profile(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    name: str | None = None
    height_cm: float | None = Field(default=None, ge=50, le=260)
    weight_kg: float | None = Field(default=None, ge=20, le=400)
    sex: Sex | None = None
    goal: Goal | None = None
    birth_year: int | None = None
    activity_level: ActivityLevel | None = None
    equipment: Equipment | None = None
    locale: str = "es"


class Subscription(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    status: str = "none"
    expires_at: datetime | None = None
    store: str | None = None
    product_id: str | None = None


class Exercise(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)
    muscle_groups: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    equipment: str | None = None
    level: str | None = Field(default=None, index=True)
    category: str | None = None
    images: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    animation_url: str | None = None
    is_premium: bool = Field(default=False, index=True)
    source: str = "free-exercise-db"
    source_url: str | None = None
    license: str = "Unlicense"


class ExerciseTranslation(SQLModel, table=True):
    exercise_id: int = Field(foreign_key="exercise.id", primary_key=True)
    lang: str = Field(primary_key=True)
    name: str
    instructions: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    machine: bool = False  # traducción automática pendiente de revisión humana


class Recipe(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)
    meals: list[str] = Field(default_factory=list, sa_column=Column(JSON))  # breakfast/lunch/snack/dinner
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    prep_min: int = 15
    # Por 1 porción; calculados desde los ingredientes al sembrar.
    kcal: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    # [{"key","names":{"es","en"},"grams"}]
    ingredients: list[dict] = Field(default_factory=list, sa_column=Column(JSON))


class RecipeTranslation(SQLModel, table=True):
    recipe_id: int = Field(foreign_key="recipe.id", primary_key=True)
    lang: str = Field(primary_key=True)
    title: str
    steps: list[str] = Field(default_factory=list, sa_column=Column(JSON))
