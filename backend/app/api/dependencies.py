import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.security import decode_token

DEMO_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")

oauth2_scheme_strict = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=True)
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_oauth2_scheme() -> OAuth2PasswordBearer:
    if settings.AUTH_MODE == "demo":
        return oauth2_scheme_optional
    return oauth2_scheme_strict

def current_user_id(token: str | None = Depends(get_oauth2_scheme())) -> uuid.UUID:
    if settings.AUTH_MODE == "demo":
        return DEMO_USER_ID

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="missing token"
        )

    try:
        payload = decode_token(token)
        sub = payload.get("sub")
        return uuid.UUID(sub)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token"
        ) from e
