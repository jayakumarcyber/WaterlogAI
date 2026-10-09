import os
import shutil
import tempfile
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

is_serverless = bool(
    os.getenv("VERCEL")
    or os.getenv("VERCEL_ENV")
    or os.getenv("VERCEL_REGION")
    or os.getenv("AWS_LAMBDA_FUNCTION_NAME")
    or os.getenv("LAMBDA_TASK_ROOT")
)

def get_sqlite_path() -> str:
    """Resolve location of fallback SQLite DB, copying to writable tempdir in serverless to allow read-write access."""
    backend_base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    db_candidates = [
        os.path.join(backend_base, "civicpulse_fallback.db"),
        os.path.abspath(os.path.join(backend_base, "..", "civicpulse_fallback.db")),
        os.path.join(os.getcwd(), "civicpulse_fallback.db"),
    ]
    source_db = None
    for cand in db_candidates:
        if os.path.exists(cand):
            source_db = cand
            break

    if is_serverless:
        tmp_db = os.path.join(tempfile.gettempdir(), "civicpulse_fallback.db")
        if not os.path.exists(tmp_db) and source_db and os.path.exists(source_db):
            try:
                shutil.copyfile(source_db, tmp_db)
                print(f"[DATABASE] Copied fallback database to {tmp_db} for serverless execution.")
            except Exception as e:
                print(f"[DATABASE WARNING] Could not copy fallback DB to {tmp_db}: {e}")
        if os.path.exists(tmp_db):
            return tmp_db
        return tmp_db

    if source_db:
        return source_db
    return os.path.join(backend_base, "civicpulse_fallback.db")

def create_sqlite_engine(db_path: str):
    import sqlite3
    from sqlalchemy import event

    sqlite_url = f"sqlite:///{db_path}"
    engine_sqlite = create_engine(
        sqlite_url,
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

def get_engine():
    db_path = get_sqlite_path()

    if os.getenv("USE_SQLITE", "").lower() in ("1", "true", "yes"):
        return create_sqlite_engine(db_path)

    # In serverless environments where POSTGRES_SERVER is localhost, postgres cannot exist
    if is_serverless and settings.POSTGRES_SERVER in ("localhost", "127.0.0.1", ""):
        print("[DATABASE] Serverless runtime with default localhost DB detected. Using SQLite fallback directly.")
        return create_sqlite_engine(db_path)

    postgres_url = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
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
        print(f"[DATABASE WARNING] PostgreSQL unreachable ({e}). Falling back to SQLite database.")
        return create_sqlite_engine(db_path)

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining database session in FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
