import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.security import decode_token

DEMO_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def current_user_id(token: str | None = Depends(oauth2_scheme)) -> uuid.UUID:
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
