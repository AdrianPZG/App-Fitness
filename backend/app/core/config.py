from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./dev.db"
    firebase_project_id: str | None = None  # basta para verificar tokens de inicio de sesión
    # Solo desarrollo: acepta "Bearer dev:<uid>" sin Firebase.
    dev_auth: bool = False
    languages: tuple[str, ...] = ("es", "en", "pt", "fr", "de")
    default_language: str = "es"
    second_language: str = "en"  # segundo idioma de respaldo; el resto son terciarios


settings = Settings()
