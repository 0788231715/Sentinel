from typing import Annotated, Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    CanReadMonitoring,
    create_access_token,
    hash_password,
    require_permission,
    verify_password,
)
from app.db.models import UserModel
from app.db.session import get_db

router = APIRouter()


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=1, max_length=256)


class UserCreate(BaseModel):
    email: str = Field(min_length=3, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=12, max_length=256)
    role: Literal["viewer", "operator", "engineer", "analyst", "admin"] = "viewer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    role: str
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: DbSession):
    user = await db.scalar(select(UserModel).where(UserModel.email == payload.email.lower()))
    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(
        access_token=create_access_token(user),
        user=UserResponse.model_validate(user, from_attributes=True),
    )


@router.get("/me", response_model=UserResponse)
async def me(user: CanReadMonitoring):
    return user


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: DbSession,
    _user: Annotated[UserModel, Depends(require_permission("users:manage"))],
):
    users = await db.scalars(select(UserModel).order_by(UserModel.email))
    return list(users)


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    db: DbSession,
    _user: Annotated[UserModel, Depends(require_permission("users:manage"))],
):
    existing = await db.scalar(select(UserModel).where(UserModel.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email is already registered")
    user = UserModel(
        id=str(uuid4()),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Email is already registered") from None
    await db.refresh(user)
    return user
