import os
import sys
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Ensure backend and root directory are in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

root_dir = os.path.dirname(backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

_startup_error = None
real_app = None

try:
    from app.main import app as real_app
except Exception as e:
    _startup_error = traceback.format_exc()
    print(f"[STARTUP CRITICAL ERROR] {e}\n{_startup_error}", file=sys.stderr)

app = FastAPI()

if real_app is not None:
    app.mount("/", real_app)
else:
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
    async def startup_error_fallback(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "BACKEND_STARTUP_FAILED",
                "details": _startup_error.splitlines()[-25:] if _startup_error else "Unknown error",
                "sys_path": sys.path,
                "cwd": os.getcwd()
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
