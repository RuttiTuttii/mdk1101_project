from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from jose import jwt

SECRET_KEY = "change-me-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


def create_access_token(subject: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, str]:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    subject = payload.get("sub")
    role = payload.get("role")
    if not subject or not role:
        raise JWTError("Invalid token payload")
    return {"sub": str(subject), "role": str(role)}
