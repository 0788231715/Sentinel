from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from sqlalchemy import event
from sqlalchemy.exc import SQLAlchemyError
from fastapi import Request
from uuid import uuid4
from app.core.config import settings
from app.core.logging import logger

# Create async engine based on DATABASE_URL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

if engine.url.get_backend_name() == "sqlite":
    @event.listens_for(engine.sync_engine, "connect")
    def enable_sqlite_foreign_keys(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

class Base(DeclarativeBase):
    pass

async def get_db(request: Request):
    async with AsyncSessionLocal() as session:
        succeeded = False
        try:
            yield session
            succeeded = True
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            if (
                succeeded
                and request is not None
                and request.method in {"POST", "PUT", "PATCH", "DELETE"}
                and hasattr(request.state, "audit_actor_id")
            ):
                from app.db.models import AuditLogModel, UserModel

                user = await session.get(UserModel, request.state.audit_actor_id)
                if user is not None:
                    session.add(
                        AuditLogModel(
                            id=str(uuid4()),
                            space=request.state.audit_space,
                            actor_id=user.id,
                            actor_email=user.email,
                            action=request.state.audit_action,
                            resource=request.state.audit_resource,
                            source_ip=request.state.audit_source_ip,
                        )
                    )
                    try:
                        await session.commit()
                    except SQLAlchemyError:
                        await session.rollback()
                        logger.exception("Could not save audit entry for %s", request.state.audit_resource)
            await session.close()

async def check_db_health() -> bool:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            return True
    except Exception as err:
        logger.warning(f"Database health check failed: {err}")
        return False
