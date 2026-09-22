import logging

import requests
from fastapi import Depends, Header, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlmodel import Session, select

from app.core.config import settings
from app.db import get_session
from datetime import datetime, timedelta, timezone

from app.models import Profile, Subscription, User

log = logging.getLogger("auth")
_http = requests.Session()
try:  # las llaves públicas de Google se cachean según sus cabeceras
    from cachecontrol import CacheControl

    _http = CacheControl(_http)
except ImportError:
    pass
_request = google_requests.Request(session=_http)


def _verify(token: str) -> dict:
    """Valida el ID token de Firebase con las llaves públicas de Google (no requiere credenciales de servidor)."""
    if settings.dev_auth and token.startswith("dev:"):
        return {"uid": token[4:]}
    project = settings.firebase_project_id
    if not project:
        raise HTTPException(503, "Firebase no está configurado en el servidor")
    try:
        claims = id_token.verify_firebase_token(token, _request, audience=project, clock_skew_in_seconds=10)
    except Exception as exc:
        log.warning("Token rechazado: %s", exc)
        raise HTTPException(401, "Token inválido")
    if not claims or claims.get("iss") != f"https://securetoken.google.com/{project}" or not claims.get("sub"):
        log.warning("Token rechazado: emisor o sujeto inválido")
        raise HTTPException(401, "Token inválido")
    return {"uid": claims["sub"], "email": claims.get("email"), "phone_number": claims.get("phone_number")}


def current_user(
    authorization: str = Header(default=""), session: Session = Depends(get_session)
) -> User:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(401, "Falta el token")
    claims = _verify(token)
    uid = claims["uid"]
    user = session.exec(select(User).where(User.firebase_uid == uid)).first()
    if not user:
        user = User(firebase_uid=uid, email=claims.get("email"), phone=claims.get("phone_number"))
        session.add(user)
        session.commit()
        session.refresh(user)
        session.add(Profile(user_id=user.id))
        session.commit()
    if not session.get(Subscription, user.id):  # prueba gratuita de 7 días
        session.add(
            Subscription(user_id=user.id, status="trial", expires_at=datetime.now(timezone.utc) + timedelta(days=7))
        )
        session.commit()
    return user


def optional_user(
    authorization: str = Header(default=""), session: Session = Depends(get_session)
) -> User | None:
    if not authorization:
        return None
    return current_user(authorization, session)


def has_premium(session: Session, user: User | None) -> bool:
    """Suscripción activa o en periodo de prueba (7 días) y no vencida."""
    from datetime import datetime, timezone

    from app.models import Subscription

    if not user:
        return False
    sub = session.get(Subscription, user.id)
    if not sub or sub.status not in ("active", "trial"):
        return False
    if sub.expires_at is None:
        return True
    exp = sub.expires_at if sub.expires_at.tzinfo else sub.expires_at.replace(tzinfo=timezone.utc)
    return exp > datetime.now(timezone.utc)
