import os

os.environ.update(DATABASE_URL="sqlite:///./test.db", DEV_AUTH="true")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

H = {"Authorization": "Bearer dev:abc"}


def test_profile_flow():
    with TestClient(app) as c:
        assert c.get("/v1/me/profile").status_code == 401
        r = c.put(
            "/v1/me/profile",
            headers=H,
            json={"height_cm": 175, "weight_kg": 70, "sex": "F", "goal": "stay_fit", "locale": "fr"},
        )
        assert r.status_code == 200 and r.json()["locale"] == "fr"
        assert c.put("/v1/me/profile", headers=H, json={"locale": "xx"}).status_code == 422
        assert c.get("/v1/exercises?lang=es").status_code == 200


def test_premium_lock_and_language_fallback():
    from sqlmodel import Session

    from app.db import engine
    from app.models import Exercise, ExerciseTranslation, Subscription

    with TestClient(app) as c:
        with Session(engine) as s:
            s.add(Exercise(slug="t-free", is_premium=False, images=["a", "b"]))
            s.add(Exercise(slug="t-prem", is_premium=True, images=["a", "b"]))
            s.commit()
            for slug, lang, name in (("t-free", "en", "Free"), ("t-prem", "es", "Premium"), ("t-prem", "en", "Premium en")):
                from sqlmodel import select

                ex = s.exec(select(Exercise).where(Exercise.slug == slug)).one()
                s.add(ExerciseTranslation(exercise_id=ex.id, lang=lang, name=name, instructions=["x"]))
            s.commit()
        rows = {r["slug"]: r for r in c.get("/v1/exercises?lang=de").json()}
        assert rows["t-free"]["name"] == "Free" and not rows["t-free"]["locked"]  # cae a inglés
        assert rows["t-prem"]["name"] == "Premium" and rows["t-prem"]["locked"]  # cae a español antes que inglés
        assert rows["t-prem"]["instructions"] == [] and len(rows["t-prem"]["images"]) == 1
        c.get("/v1/me/profile", headers=H)
        with Session(engine) as s:
            from app.models import User

            uid = s.exec(select(User).where(User.firebase_uid == "abc")).one().id
            s.merge(Subscription(user_id=uid, status="trial"))
            s.commit()
        rows = {r["slug"]: r for r in c.get("/v1/exercises", headers=H).json()}
        assert not rows["t-prem"]["locked"] and rows["t-prem"]["instructions"] == ["x"]


def test_firebase_token_verification(monkeypatch):
    from google.oauth2 import id_token

    from app.core.config import settings

    monkeypatch.setattr(settings, "dev_auth", False)
    monkeypatch.setattr(settings, "firebase_project_id", "demo-project")
    good = {"sub": "uid-123", "iss": "https://securetoken.google.com/demo-project", "email": "a@b.com"}

    def fake(token, request, audience, clock_skew_in_seconds=0):
        if token == "valido":
            return good
        if token == "otro-emisor":
            return {**good, "iss": "https://evil.example"}
        raise ValueError("firma inválida")

    monkeypatch.setattr(id_token, "verify_firebase_token", fake)
    with TestClient(app) as c:
        assert c.get("/v1/me/profile", headers={"Authorization": "Bearer valido"}).status_code == 200
        assert c.get("/v1/me/profile", headers={"Authorization": "Bearer dev:abc"}).status_code == 401
        assert c.get("/v1/me/profile", headers={"Authorization": "Bearer basura"}).status_code == 401
        assert c.get("/v1/me/profile", headers={"Authorization": "Bearer otro-emisor"}).status_code == 401


def test_subscription_status():
    with TestClient(app) as c:
        r = c.get("/v1/me/subscription", headers=H)
        assert r.status_code == 200 and r.json()["status"] in ("none", "trial", "active")
        assert r.json()["price_mxn"] == 50
