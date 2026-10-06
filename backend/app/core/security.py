import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models import UserModel
from app.db.session import get_db

_bearer = HTTPBearer(auto_error=False)
_ITERATIONS = 310_000
_ROLE_PERMISSIONS = {
    "viewer": {"monitoring:read"},
    "operator": {"monitoring:read", "monitoring:write"},
    "engineer": {"monitoring:read", "monitoring:write"},
    "analyst": {"monitoring:read", "analytics:read"},
    "admin": {"monitoring:read", "monitoring:write", "users:manage"},
}


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ITERATIONS)
    return f"pbkdf2_sha256${_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = password_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), int(iterations)
        )
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def create_access_token(user: UserModel) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    return jwt.encode(
        {"sub": user.id, "role": user.role, "exp": expires},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserModel:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        if not isinstance(user_id, str):
            raise unauthorized
    except JWTError:
        raise unauthorized from None

    user = await db.scalar(select(UserModel).where(UserModel.id == user_id))
    if user is None or not user.is_active:
        raise unauthorized
    return user


def require_permission(permission: str):
    async def dependency(
        user: Annotated[UserModel, Depends(get_current_user)],
    ) -> UserModel:
        if permission not in _ROLE_PERMISSIONS.get(user.role, set()):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return dependency


CurrentUser = Annotated[UserModel, Depends(get_current_user)]
CanReadMonitoring = Annotated[UserModel, Depends(require_permission("monitoring:read"))]
CanWriteMonitoring = Annotated[UserModel, Depends(require_permission("monitoring:write"))]
