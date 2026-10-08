import os
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

postgres_url = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
sqlite_fallback_url = "sqlite:///./civicpulse_fallback.db"

def get_engine():
    if os.getenv("USE_SQLITE", "").lower() in ("1", "true", "yes"):
        import sqlite3
        from sqlalchemy import event

        engine_sqlite = create_engine(
            sqlite_fallback_url,
            connect_args={"check_same_thread": False},
            echo=False
        )

        @event.listens_for(engine_sqlite, "connect")
        def sqlite_spatial_compat(dbapi_con, connection_record):
            if isinstance(dbapi_con, sqlite3.Connection):
                dbapi_con.create_function("AsEWKB", 1, lambda x: x)
                dbapi_con.create_function("GeomFromEWKB", 1, lambda x: x)
                dbapi_con.create_function("ST_AsGeoJSON", 1, lambda x: None)

        return engine_sqlite

    try:
        engine_pg = create_engine(
            postgres_url,
            pool_pre_ping=True,
            echo=False,
            connect_args={"connect_timeout": 2}
        )
        with engine_pg.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[DATABASE] Connected to PostgreSQL / PostGIS database.")
        return engine_pg
    except Exception as e:
        print(f"[DATABASE WARNING] PostgreSQL container unreachable on port 5432 ({e}). Falling back to SQLite database.")
        import sqlite3
        from sqlalchemy import event

        engine_sqlite = create_engine(
            sqlite_fallback_url,
            connect_args={"check_same_thread": False},
            echo=False
        )

        @event.listens_for(engine_sqlite, "connect")
        def sqlite_spatial_compat(dbapi_con, connection_record):
            if isinstance(dbapi_con, sqlite3.Connection):
                dbapi_con.create_function("AsEWKB", 1, lambda x: x)
                dbapi_con.create_function("GeomFromEWKB", 1, lambda x: x)
                dbapi_con.create_function("ST_AsGeoJSON", 1, lambda x: None)

        return engine_sqlite

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining database session in FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
