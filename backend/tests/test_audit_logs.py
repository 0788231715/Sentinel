from collections.abc import AsyncIterator
from uuid import uuid4

import pytest
import pytest_asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from starlette.requests import Request

from app.core.security import hash_password
from app.db import session as database_session
from app.db.models import AuditLogModel, Base, UserModel


@pytest_asyncio.fixture
async def audit_sessions(tmp_path, monkeypatch) -> AsyncIterator[async_sessionmaker]:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'audit.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(database_session, "AsyncSessionLocal", sessions)
    yield sessions
    await engine.dispose()


def make_request() -> Request:
    request = Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/v1/monitoring/events",
            "headers": [],
            "client": ("127.0.0.1", 1234),
            "server": ("test", 80),
            "scheme": "http",
            "query_string": b"",
            "root_path": "",
        }
    )
    request.state.audit_actor_id = "audit-user"
    request.state.audit_space = "real"
    request.state.audit_action = "POST"
    request.state.audit_resource = "/api/v1/monitoring/events"
    request.state.audit_source_ip = "127.0.0.1"
    return request


@pytest.mark.asyncio
async def test_successful_authenticated_mutation_is_audited(audit_sessions):
    async with audit_sessions() as setup:
        setup.add(
            UserModel(
                id="audit-user",
                email=f"audit-{uuid4()}@example.test",
                password_hash=hash_password("Audit-password-123"),
                role="admin",
            )
        )
        await setup.commit()

    dependency = database_session.get_db(make_request())
    session = await anext(dependency)
    await session.execute(select(UserModel))
    with pytest.raises(StopAsyncIteration):
        await anext(dependency)

    async with audit_sessions() as check:
        entries = list(await check.scalars(select(AuditLogModel)))
    assert len(entries) == 1
    assert entries[0].space == "real"
    assert entries[0].resource == "/api/v1/monitoring/events"
    assert entries[0].source_ip == "127.0.0.1"
