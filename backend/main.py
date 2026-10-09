import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app
except Exception as e:
    import traceback
    err_str = str(e)
    err_tb = traceback.format_exc()
    print(f"[CRITICAL STARTUP ERROR]: {err_tb}", file=sys.stderr)
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
    async def startup_error_fallback(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "BACKEND_STARTUP_FAILED",
                "message": err_str,
                "traceback": err_tb.splitlines()[-15:]
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
